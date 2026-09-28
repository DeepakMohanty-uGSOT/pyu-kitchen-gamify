/* Pyu's Kitchen — Python worker.
 * Loads Pyodide (real CPython compiled to WebAssembly) from the CDN,
 * installs the tracer and runs student recipes off the main thread.
 * Student code never sees the DOM or the network from here.
 */
/* eslint-disable no-restricted-globals */
const PYODIDE_VERSION = "0.29.5";
const INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VERSION + "/full/";

let pyodide = null;
let loading = null;

function load() {
  if (loading) return loading;
  loading = (async () => {
    importScripts(INDEX_URL + "pyodide.js");
    // eslint-disable-next-line no-undef
    const py = await loadPyodide({ indexURL: INDEX_URL, stdout: () => {}, stderr: () => {} });
    const tracerUrl = new URL("./tracer.py", self.location.href).toString();
    const res = await fetch(tracerUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error("Could not load the kitchen tracer (" + res.status + ")");
    // The tracer blocks every import from student code (including `js` and
    // `pyodide`), so recipes cannot reach the page or the network.
    py.runPython(await res.text());
    pyodide = py;
    return py;
  })();
  return loading;
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.type === "init") {
    try {
      await load();
      self.postMessage({ type: "ready" });
    } catch (err) {
      loading = null;
      self.postMessage({ type: "loadError", message: String((err && err.message) || err) });
    }
    return;
  }
  if (msg.type === "run") {
    try {
      const py = await load();
      const runLevel = py.globals.get("run_level");
      const out = runLevel(JSON.stringify(msg.payload));
      runLevel.destroy();
      self.postMessage({ type: "result", id: msg.id, result: JSON.parse(out) });
    } catch (err) {
      self.postMessage({ type: "crash", id: msg.id, message: String((err && err.message) || err) });
    }
  }
};
