# Pyu's Kitchen — execution tracer.
#
# Runs the student's recipe (real Python) with sys.settrace and records what
# actually happened: every line, call, return, print, input and error, plus
# snapshots of the variables. The frontend replays these events as kitchen
# animations. Nothing here ever changes what the student's code does.

import ast
import builtins
import itertools
import json
import math
import sys
import types

RECIPE = "<recipe>"
MAX_STEPS = 10000
MAX_EVENTS = 3000
MAX_OUTPUT_LINES = 3000
MAX_STACK = 6

SKIP_NAMES = {
    "__builtins__", "__name__", "__doc__", "__package__", "__loader__",
    "__spec__", "__annotations__", "__file__", "__cached__", "__warningregistry__",
}


class StopRecipe(BaseException):
    """Base for the kitchen's own stop signals. BaseException so that a
    student's `except Exception` can't swallow them."""


class OutOfInputs(StopRecipe):
    pass


class StepLimit(StopRecipe):
    pass


class TooMuchOutput(StopRecipe):
    pass


class BlockedImport(StopRecipe):
    def __init__(self, name):
        super().__init__(name)
        self.name = name


# ---------------------------------------------------------------- snapshots

def _short(text, limit=120):
    return text if len(text) <= limit else text[: limit - 3] + "..."


def safe(v, depth=0):
    """Serialisable snapshot of a value, or None if it shouldn't be shown."""
    t = type(v)
    try:
        if v is None:
            return {"t": "NoneType", "r": "None"}
        if t is bool:
            return {"t": "bool", "v": v, "r": repr(v)}
        if t is int:
            if -(2 ** 53) < v < 2 ** 53:
                return {"t": "int", "v": v, "r": repr(v)}
            try:
                r = repr(v)
            except ValueError:
                r = "a gigantic number"
            return {"t": "int", "v": None, "big": True, "r": _short(r, 40)}
        if t is float:
            if math.isfinite(v):
                return {"t": "float", "v": v, "r": repr(v)}
            return {"t": "float", "v": None, "r": repr(v)}
        if t is str:
            return {"t": "str", "v": v[:400], "n": len(v), "r": _short(repr(v[:200]))}
        if t in (list, tuple, set, frozenset):
            if depth > 2:
                return {"t": t.__name__, "v": [], "n": len(v), "r": "[...]"}
            items = list(itertools.islice(iter(v), 30))
            vals = [safe(x, depth + 1) or {"t": "other", "r": "?"} for x in items]
            inner = ", ".join(x["r"] for x in vals[:12])
            if len(v) > 12:
                inner += ", ..."
            if t is list:
                r = "[" + inner + "]"
            elif t is tuple:
                r = "(" + inner + ("," if len(v) == 1 else "") + ")"
            else:
                r = "{" + inner + "}" if len(v) else t.__name__ + "()"
            return {"t": t.__name__, "v": vals, "n": len(v), "r": _short(r, 160)}
        if t is dict:
            if depth > 2:
                return {"t": "dict", "v": [], "n": len(v), "r": "{...}"}
            pairs = []
            for k, val in itertools.islice(v.items(), 30):
                pairs.append([safe(k, depth + 1) or {"t": "other", "r": "?"},
                              safe(val, depth + 1) or {"t": "other", "r": "?"}])
            inner = ", ".join(k["r"] + ": " + x["r"] for k, x in pairs[:10])
            if len(v) > 10:
                inner += ", ..."
            return {"t": "dict", "v": pairs, "n": len(v), "r": _short("{" + inner + "}", 160)}
        if isinstance(v, types.FunctionType):
            if v.__code__.co_filename != RECIPE:
                return None
            return {"t": "function", "name": v.__name__, "params": _params(v),
                    "r": "<recipe card: " + v.__name__ + ">"}
        if isinstance(v, (types.ModuleType, types.BuiltinFunctionType, type)):
            return None
        try:
            r = repr(v)
        except Exception:
            r = "<" + t.__name__ + ">"
        return {"t": t.__name__, "r": _short(r)}
    except Exception:
        return {"t": "other", "r": "?"}


def _params(fn):
    code = fn.__code__
    names = list(code.co_varnames[: code.co_argcount])
    defaults = fn.__defaults__ or ()
    out = []
    first_default = len(names) - len(defaults)
    for i, name in enumerate(names):
        if i >= first_default:
            d = safe(defaults[i - first_default])
            out.append(name + "=" + (d["r"] if d else "?"))
        else:
            out.append(name)
    return out


def snapshot(ns):
    out = {}
    for k, v in list(ns.items()):
        if not isinstance(k, str) or k in SKIP_NAMES or k.startswith("__"):
            continue
        s = safe(v)
        if s is not None:
            out[k] = s
    return out


# ---------------------------------------------------------------- analysis

SAFE_CALLS = {"len", "range", "int", "float", "str", "abs", "min", "max", "round", "bool", "list", "sorted", "sum"}
SAFE_NODES = (
    ast.Expression, ast.BoolOp, ast.BinOp, ast.UnaryOp, ast.Compare, ast.Name, ast.Load,
    ast.Constant, ast.List, ast.Tuple, ast.Subscript, ast.Slice, ast.Call, ast.JoinedStr,
    ast.FormattedValue, ast.IfExp,
    ast.And, ast.Or, ast.Not, ast.USub, ast.UAdd, ast.Add, ast.Sub, ast.Mult, ast.Div,
    ast.FloorDiv, ast.Mod, ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE, ast.In,
    ast.NotIn, ast.Is, ast.IsNot,
)


def _is_safe_expr(src):
    try:
        tree = ast.parse(src, mode="eval")
    except SyntaxError:
        return None
    for node in ast.walk(tree):
        if not isinstance(node, SAFE_NODES):
            return None
        if isinstance(node, ast.Call):
            if not (isinstance(node.func, ast.Name) and node.func.id in SAFE_CALLS):
                return None
    try:
        return compile(tree, "<kitchen-check>", "eval")
    except Exception:
        return None


def analyze(code, tree):
    lines = 0
    for raw in code.splitlines():
        s = raw.strip()
        if s and not s.startswith("#"):
            lines += 1
    counts = {}
    functions = []
    loops = []
    conds = []

    def visit(node, scope):
        for child in ast.iter_child_nodes(node):
            name = type(child).__name__
            counts[name] = counts.get(name, 0) + 1
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions.append(child.name)
                visit(child, child.name)
                continue
            if isinstance(child, (ast.For, ast.While)):
                info = {
                    "kind": "for" if isinstance(child, ast.For) else "while",
                    "line": child.lineno,
                    "end": getattr(child, "end_lineno", child.lineno),
                    "scope": scope,
                }
                if isinstance(child, ast.For):
                    info["target"] = ast.unparse(child.target)
                    info["iter"] = ast.unparse(child.iter)
                else:
                    info["test"] = ast.unparse(child.test)
                loops.append(info)
            if isinstance(child, ast.If):
                is_elif = False
                parent_orelse = getattr(node, "orelse", None)
                if isinstance(node, ast.If) and parent_orelse and len(parent_orelse) == 1 and parent_orelse[0] is child:
                    # `elif` shares its parent's column, a nested `if` does not
                    is_elif = child.col_offset == node.col_offset or _line_starts_with(code, child.lineno, "elif")
                conds.append({"line": child.lineno, "kind": "elif" if is_elif else "if",
                              "test": ast.unparse(child.test), "scope": scope})
            if isinstance(child, ast.While):
                conds.append({"line": child.lineno, "kind": "while",
                              "test": ast.unparse(child.test), "scope": scope})
            visit(child, scope)

    visit(tree, None)
    names_used = sorted({n.id for n in ast.walk(tree) if isinstance(n, ast.Name)})
    return {"lines": lines, "counts": counts, "functions": functions,
            "loops": loops, "conds": conds, "names": names_used}


def _line_starts_with(code, lineno, word):
    try:
        return code.splitlines()[lineno - 1].lstrip().startswith(word)
    except IndexError:
        return False


# ---------------------------------------------------------------- tracer

def _recipe_line():
    f = sys._getframe(1)
    while f is not None:
        if f.f_code.co_filename == RECIPE:
            return f.f_lineno, f
        f = f.f_back
    return 0, None


class Writer:
    def __init__(self, tracer):
        self.tracer = tracer
        self.buf = ""

    def write(self, s):
        if not isinstance(s, str):
            s = str(s)
        self.buf += s
        while "\n" in self.buf:
            line, self.buf = self.buf.split("\n", 1)
            self.tracer.emit_print(line)
        return len(s)

    def flush(self):
        pass

    def finish(self):
        if self.buf:
            self.tracer.emit_print(self.buf)
            self.buf = ""


class Tracer:
    def __init__(self, info, inputs, record=True):
        self.record = record
        self.events = []
        self.steps = 0
        self.truncated = False
        self.output = []
        self.inputs = [str(x) for x in (inputs or [])]
        self.inputs_used = 0
        self.last_line = {}
        self.loop_state = {}
        self.raising = set()
        self.ns = None
        self.loops = info["loops"] if info else []
        self.conds = {}
        self.cond_code = {}
        for c in (info["conds"] if info else []):
            self.conds[(c["line"], c["scope"])] = c
            self.cond_code[(c["line"], c["scope"])] = _is_safe_expr(c["test"])
        self.iter_code = {}
        for lp in self.loops:
            if lp["kind"] == "for":
                self.iter_code[(lp["line"], lp["scope"])] = _is_safe_expr(lp["iter"])

    # -- helpers
    def _can_record(self):
        if not self.record:
            return False
        if len(self.events) >= MAX_EVENTS:
            self.truncated = True
            return False
        return True

    def _stack(self, frame):
        frames = []
        f = frame
        while f is not None:
            if f.f_code.co_filename == RECIPE and f.f_code.co_name != "<module>" and not f.f_code.co_name.startswith("<"):
                frames.append(f)
            f = f.f_back
        frames.reverse()
        out = []
        for f in frames[-MAX_STACK:]:
            out.append({"fn": f.f_code.co_name, "l": f.f_lineno, "loc": snapshot(dict(f.f_locals))})
        return out, len(frames)

    def _base(self, kind, frame):
        st, depth = self._stack(frame)
        return {"k": kind, "l": frame.f_lineno if frame else 0, "d": depth,
                "fn": frame.f_code.co_name if frame and depth else None,
                "g": snapshot(self.ns) if self.ns is not None else {}, "st": st}

    @staticmethod
    def _scope(frame):
        name = frame.f_code.co_name
        return None if name == "<module>" else name

    def _eval(self, code, frame):
        if code is None:
            return None
        try:
            return (True, eval(code, frame.f_globals, dict(frame.f_locals)))
        except Exception:
            return None

    # -- tracing
    def global_trace(self, frame, event, arg):
        if frame.f_code.co_filename != RECIPE:
            return None
        name = frame.f_code.co_name
        if name.startswith("<") and name != "<module>":
            return self.quiet_trace
        if event == "call" and name != "<module>" and self._can_record():
            ev = self._base("call", frame)
            ev["args"] = snapshot(dict(frame.f_locals))
            self.events.append(ev)
        return self.local_trace

    def quiet_trace(self, frame, event, arg):
        if event == "line":
            self._count()
        return self.quiet_trace

    def _count(self):
        self.steps += 1
        if self.steps > MAX_STEPS:
            raise StepLimit()

    def local_trace(self, frame, event, arg):
        fid = id(frame)
        if event == "line":
            self._count()
            self.raising.discard(fid)
            line = frame.f_lineno
            scope = self._scope(frame)
            loops_out = self._loops(frame, fid, line, scope)
            self.last_line[fid] = line
            if self._can_record():
                ev = self._base("line", frame)
                if loops_out:
                    ev["loops"] = loops_out
                c = self.conds.get((line, scope))
                if c is not None:
                    res = self._eval(self.cond_code.get((line, scope)), frame)
                    cond = {"text": c["test"], "kind": c["kind"]}
                    if res is not None:
                        try:
                            cond["value"] = bool(res[1])
                            cond["r"] = _short(repr(res[1]), 60)
                        except Exception:
                            pass
                    ev["cond"] = cond
                self.events.append(ev)
        elif event == "exception":
            self.raising.add(fid)
        elif event == "return":
            if frame.f_code.co_name != "<module>" and self._can_record():
                ev = self._base("return", frame)
                if fid in self.raising:
                    ev["raised"] = True
                else:
                    ev["ret"] = safe(arg) or {"t": "other", "r": "?"}
                self.events.append(ev)
            self.last_line.pop(fid, None)
            self.raising.discard(fid)
        return self.local_trace

    def _loops(self, frame, fid, line, scope):
        active = []
        prev = self.last_line.get(fid)
        for lp in self.loops:
            if lp["scope"] != scope or not (lp["line"] <= line <= lp["end"]):
                continue
            key = (fid, lp["line"])
            if line == lp["line"]:
                continuing = (prev is not None and key in self.loop_state
                              and lp["line"] <= prev <= lp["end"])
                if not continuing:
                    st = {"checks": 0}
                    if lp["kind"] == "for":
                        res = self._eval(self.iter_code.get((lp["line"], scope)), frame)
                        if res is not None:
                            seq = res[1]
                            try:
                                st["total"] = len(seq)
                            except Exception:
                                pass
                            try:
                                if not isinstance(seq, (dict, set)):
                                    st["seq"] = [(safe(x) or {"r": "?"})["r"] for x in itertools.islice(iter(seq), 12)]
                            except Exception:
                                pass
                    self.loop_state[key] = st
                self.loop_state[key]["checks"] += 1
            st = self.loop_state.get(key)
            if st is None:
                continue
            item = {"line": lp["line"], "kind": lp["kind"], "iter": st["checks"],
                    "header": line == lp["line"]}
            if "total" in st:
                item["total"] = st["total"]
            if "seq" in st:
                item["seq"] = st["seq"]
            if lp["kind"] == "for":
                item["var"] = lp["target"]
                item["src"] = lp["iter"]
                if lp["target"].isidentifier():
                    loc = frame.f_locals
                    if lp["target"] in loc:
                        s = safe(loc[lp["target"]])
                        if s is not None:
                            item["value"] = s["r"]
            else:
                item["src"] = lp["test"]
            active.append(item)
        return active

    # -- io
    def emit_print(self, line):
        self.output.append(line)
        if len(self.output) > MAX_OUTPUT_LINES:
            raise TooMuchOutput()
        if self._can_record():
            lineno, frame = _recipe_line()
            st, depth = self._stack(frame) if frame else ([], 0)
            self.events.append({"k": "print", "l": lineno, "d": depth, "out": line[:300]})

    def fake_input(self, prompt=""):
        prompt = "" if prompt is None else str(prompt)
        if self.inputs_used >= len(self.inputs):
            raise OutOfInputs()
        value = self.inputs[self.inputs_used]
        self.inputs_used += 1
        if self._can_record():
            lineno, frame = _recipe_line()
            st, depth = self._stack(frame) if frame else ([], 0)
            self.events.append({"k": "input", "l": lineno, "d": depth,
                                "prompt": prompt[:200], "val": value})
        return value


# ---------------------------------------------------------------- running

def _error_info(e):
    line = None
    tb = e.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == RECIPE:
            line = tb.tb_lineno
        tb = tb.tb_next
    try:
        msg = str(e)
    except Exception:
        msg = ""
    return {"type": type(e).__name__, "msg": msg[:500], "line": line}


def _make_builtins(tracer, allowed_imports):
    b = dict(builtins.__dict__)
    real_import = builtins.__import__

    def guarded_import(name, globals=None, locals=None, fromlist=(), level=0):
        caller = sys._getframe(1)
        if caller.f_code.co_filename == RECIPE:
            root = (name or "").split(".")[0]
            if root not in allowed_imports:
                raise BlockedImport(name)
        return real_import(name, globals, locals, fromlist, level)

    def blocked(*args, **kwargs):
        raise BlockedImport("open")

    b["__import__"] = guarded_import
    b["input"] = tracer.fake_input
    b["open"] = blocked
    for name in ("breakpoint", "help", "copyright", "credits", "license"):
        b.pop(name, None)
    return b


def _run_code(code_obj, tracer, globs, allowed_imports):
    ns = {"__name__": "__main__"}
    ns["__builtins__"] = _make_builtins(tracer, allowed_imports)
    for k, v in (globs or {}).items():
        ns[k] = v
    tracer.ns = ns
    writer = Writer(tracer)
    old_out = sys.stdout
    sys.stdout = writer
    stopped = None
    error = None
    blocked = None
    sys.settrace(tracer.global_trace)
    try:
        exec(code_obj, ns)
    except OutOfInputs:
        stopped = "inputs"
    except StepLimit:
        stopped = "steps"
    except TooMuchOutput:
        stopped = "output"
    except BlockedImport as e:
        stopped = "import"
        blocked = e.name
    except SystemExit:
        pass
    except RecursionError as e:
        error = _error_info(e)
    except BaseException as e:
        error = _error_info(e)
    finally:
        sys.settrace(None)
        sys.stdout = old_out
    try:
        writer.finish()
    except StopRecipe:
        pass
    return ns, stopped, error, blocked


def run_one(code_obj, info, run, allowed_imports):
    tracer = Tracer(info, run.get("inputs"))
    ns, stopped, error, blocked = _run_code(code_obj, tracer, run.get("globals"), allowed_imports)
    final = snapshot(ns)
    end = {"k": "error" if (error or stopped) else "end", "l": (error or {}).get("line") or 0,
           "d": 0, "g": final, "st": []}
    if error:
        end["error"] = error
    if stopped:
        end["stopped"] = stopped
    tracer.events.append(end)
    return {
        "events": tracer.events,
        "truncated": tracer.truncated,
        "output": tracer.output,
        "inputsUsed": tracer.inputs_used,
        "final": final,
        "error": error,
        "stopped": stopped,
        "blocked": blocked,
        "steps": tracer.steps,
    }


def run_func_tests(code_obj, info, tests, first_run, allowed_imports):
    results = []
    tracer = Tracer(info, first_run.get("inputs"), record=False)
    ns, stopped, error, blocked = _run_code(code_obj, tracer, first_run.get("globals"), allowed_imports)
    for t in tests:
        fn = ns.get(t["fn"])
        res = {"fn": t["fn"]}
        if not isinstance(fn, types.FunctionType):
            res["missing"] = True
            results.append(res)
            continue
        tr = Tracer(info, t.get("inputs") or [], record=False)
        tr.ns = ns
        ns["__builtins__"]["input"] = tr.fake_input
        writer = Writer(tr)
        old_out = sys.stdout
        sys.stdout = writer
        sys.settrace(tr.global_trace)
        try:
            ret = fn(*t.get("args", []), **t.get("kwargs", {}))
            res["ret"] = safe(ret) or {"t": "other", "r": repr(ret)[:80]}
        except OutOfInputs:
            res["stopped"] = "inputs"
        except StepLimit:
            res["stopped"] = "steps"
        except TooMuchOutput:
            res["stopped"] = "output"
        except BlockedImport as e:
            res["stopped"] = "import"
        except BaseException as e:
            res["error"] = _error_info(e)
        finally:
            sys.settrace(None)
            sys.stdout = old_out
        try:
            writer.finish()
        except StopRecipe:
            pass
        res["out"] = tr.output[:50]
        results.append(res)
    return results


def run_level(payload_json):
    p = json.loads(payload_json)
    code = p.get("code", "")
    allowed = set(p.get("allowImports") or [])
    result = {"compile": None, "ast": None, "runs": [], "funcTests": []}
    try:
        tree = ast.parse(code, RECIPE)
        code_obj = compile(tree, RECIPE, "exec")
    except SyntaxError as e:
        result["compile"] = {"type": type(e).__name__, "msg": e.msg or str(e),
                             "line": e.lineno or 1, "col": e.offset or 1}
        return json.dumps(result)
    except (ValueError, TypeError) as e:
        result["compile"] = {"type": "SyntaxError", "msg": str(e), "line": 1, "col": 1}
        return json.dumps(result)
    info = analyze(code, tree)
    result["ast"] = info
    runs = p.get("runs") or [{}]
    for run in runs:
        result["runs"].append(run_one(code_obj, info, run, allowed))
    tests = p.get("funcTests") or []
    if tests:
        result["funcTests"] = run_func_tests(code_obj, info, tests, runs[0], allowed)
    return json.dumps(result)
