// ---------- Values recorded from the real Python run ----------

export type SafeValue = {
  t: string; // python type name: int, float, str, bool, NoneType, list, tuple, dict, function, ...
  v?: any; // JS value for simple types; SafeValue[] for lists; [k, v][] for dicts
  r: string; // python repr
  n?: number; // length for str / containers
  big?: boolean;
  name?: string; // function name
  params?: string[]; // function params
};

export type VarMap = Record<string, SafeValue>;

export type StackFrame = { fn: string; l: number; loc: VarMap };

export type LoopInfo = {
  line: number;
  kind: "for" | "while";
  iter: number;
  header: boolean;
  total?: number;
  seq?: string[];
  var?: string;
  src?: string;
  value?: string;
};

export type CondInfo = { text: string; kind: "if" | "elif" | "while"; value?: boolean; r?: string };

export type PyError = { type: string; msg: string; line: number | null };

export type ExecEvent = {
  k: "line" | "call" | "return" | "print" | "input" | "error" | "end";
  l: number;
  d: number;
  fn?: string | null;
  g?: VarMap;
  st?: StackFrame[];
  loops?: LoopInfo[];
  cond?: CondInfo;
  out?: string;
  prompt?: string;
  val?: string;
  args?: VarMap;
  ret?: SafeValue;
  raised?: boolean;
  error?: PyError;
  stopped?: StopReason;
};

export type StopReason = "inputs" | "steps" | "output" | "import" | "timeout";

export type RunResult = {
  events: ExecEvent[];
  truncated: boolean;
  output: string[];
  inputsUsed: number;
  final: VarMap;
  error: PyError | null;
  stopped: StopReason | null;
  blocked?: string | null;
  steps: number;
};

export type AstInfo = {
  lines: number;
  counts: Record<string, number>;
  functions: string[];
  loops: { kind: string; line: number; end: number }[];
  conds: { line: number; kind: string; test: string }[];
  names: string[];
};

export type FuncTestResult = {
  fn: string;
  missing?: boolean;
  ret?: SafeValue;
  out?: string[];
  error?: PyError;
  stopped?: StopReason;
};

export type CompileError = { type: string; msg: string; line: number; col: number };

export type LevelRunResult = {
  compile: CompileError | null;
  ast: AstInfo | null;
  runs: RunResult[];
  funcTests: FuncTestResult[];
  timeout?: boolean;
  crash?: string;
};

// ---------- Level definitions ----------

export type JsValue = number | string | boolean | null | JsValue[];

export type PyType = "int" | "float" | "str" | "bool" | "list" | "number" | "NoneType";

export type CompareOp = "==" | "!=" | ">" | ">=" | "<" | "<=";

export type Check =
  | {
      type: "var";
      name: string;
      equals?: JsValue;
      op?: CompareOp;
      value?: number;
      pyType?: PyType;
      hideExpected?: boolean;
      whenValue?: { value: JsValue; message: string }[];
      fail?: string;
    }
  | { type: "hasValue"; value: JsValue; pyType?: PyType; fail?: string }
  | { type: "output"; lines: string[]; mode?: OutputMode; fail?: string }
  | { type: "outputContains"; text: string; fail?: string }
  | { type: "noError"; fail?: string }
  | { type: "compiles"; fail?: string }
  | { type: "noErrorOfType"; error: string; fail?: string }
  | { type: "varSequence"; name: string; values: JsValue[]; fail?: string }
  | { type: "callCount"; fn: string; min?: number; max?: number; fail?: string }
  | { type: "maxLines"; n: number; fail?: string }
  | { type: "defines"; fn: string; fail?: string }
  | {
      type: "funcTest";
      fn: string;
      args?: JsValue[];
      kwargs?: Record<string, JsValue>;
      expect?: JsValue;
      pyType?: PyType;
      expectOutput?: string[];
      noOutput?: boolean;
      mode?: OutputMode;
      fail?: string;
    };

export type OutputMode = "exact" | "normal" | "loose";

export type Customer = {
  name: string;
  inputs?: string[];
  globals?: Record<string, JsValue>;
  expect?: Check[];
  hidden?: boolean;
  failHint?: string;
  says?: string; // what they say when they walk up
};

export type BindingObject =
  | "pot"
  | "thermometer"
  | "waterPot"
  | "saltMeter"
  | "plates"
  | "receipt"
  | "chilli"
  | "teaCup"
  | "kettle"
  | "oven"
  | "fridge"
  | "tickets"
  | "cookieBox"
  | "scale"
  | "tray"
  | "dish"
  | "allergyBoard"
  | "cookieBelt"
  | "counter";

export type Binding = {
  object: BindingObject;
  variable: string;
  extra?: string; // second variable for two-value widgets
  label?: string;
};

export type SceneId = "pantry" | "scales" | "counter" | "tasting" | "stove" | "wall" | "fire" | "grand";

export type Level = {
  id: string;
  chapter: number;
  title: string;
  concept: string;
  points: number;
  story: string;
  goal: string; // the order, supports `code` spans and **bold**
  notes?: string[]; // extra clarifications (still never the answer)
  mode?: "code" | "fill" | "reorder";
  starterCode?: string;
  fillTemplate?: string; // uses [[ ]] for blanks
  reorderLines?: string[]; // shown in this (scrambled) order
  scene: SceneId;
  bindings?: Binding[];
  mysteryVars?: string[];
  picture?: { emoji: string; label: string }[];
  alarm?: string;
  runLabel?: "Customer" | "Day";
  customers: Customer[];
  checks: Check[];
  outputMode?: OutputMode;
  hints: string[];
  successText: string;
  timer?: number; // seconds (fire drill)
  fireStages?: { label: string; checks: Check[] }[];
  allowImports?: string[];
};

export type Chapter = {
  id: number;
  title: string;
  concept: string;
  area: string;
  accent: string;
  icon: string;
  blurb: string;
};
