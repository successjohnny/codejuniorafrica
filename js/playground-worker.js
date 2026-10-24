
 // @ts-check
"use strict";

import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";

/** @typedef {import("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs").PyodideInterface} PyodideRuntime */
/** @typedef {import("https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs").PyProxy} PythonResult */
/** @typedef {{ type: "initialize" } | { type: "run", code: string }} WorkerRequest */

const PYODIDE_VERSION = "0.314.0.7";

/** @type {PyodideRuntime | null} */
let pyodideInstance = null;

/** @type {Promise<PyodideRuntime> | null} */
let initializationPromise = null;

/**
 * Load Pyodide once and reuse it for subsequent runs.
 * @returns {Promise<PyodideRuntime>}
 */
function getPyodide() {
  if (pyodideInstance) {
    return Promise.resolve(pyodideInstance);
  }

  if (!initializationPromise) {
    initializationPromise = loadPyodide()
      .then((pyodide) => {
        pyodideInstance = pyodide;
        return pyodide;
      })
      .catch((error) => {
        initializationPromise = null;
        throw error;
      });
  }

  return initializationPromise;
}

/**
 * Send a readable error message to the page.
 * @param {unknown} error
 */
function reportError(error) {
  const message = error instanceof Error ? error.message : String(error);
  self.postMessage({ type: "runtime-error", message });
}

self.addEventListener("message", /** @param {MessageEvent<WorkerRequest>} event */ async (event) => {
  /** @type {WorkerRequest} */
  const message = event.data;

  if (message.type === "initialize") {
    self.postMessage({
      type: "status",
      message: `Loading Python ${PYODIDE_VERSION}…`,
    });

    try {
      await getPyodide();
      self.postMessage({ type: "ready" });
    } catch (error) {
      reportError(error);
    }

    return;
  }

  if (message.type !== "run") {
    return;
  }

  /** @type {PythonResult | null} */
  let result = null;

  try {
    const pyodide = await getPyodide();

    pyodide.globals.set("__playground_source", message.code);

    result = await pyodide.runPythonAsync(`
import contextlib
import io
import traceback

__playground_stdout = io.StringIO()
__playground_stderr = io.StringIO()
__playground_error = False

try:
    with contextlib.redirect_stdout(__playground_stdout), contextlib.redirect_stderr(__playground_stderr):
        exec(compile(__playground_source, "<playground>", "exec"), {"__name__": "__main__"})
except Exception:
    __playground_error = True
    __playground_stderr.write(traceback.format_exc())

{
    "stdout": __playground_stdout.getvalue(),
    "stderr": __playground_stderr.getvalue(),
    "hasError": __playground_error
}
`);

    self.postMessage({
      type: "result",
      stdout: String(result.get("stdout") ?? ""),
      stderr: String(result.get("stderr") ?? ""),
      hasError: Boolean(result.get("hasError")),
    });
  } catch (error) {
    reportError(error);
  } finally {
    result?.destroy();
  }
});