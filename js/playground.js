// @ts-check
"use strict";

/** @typedef {{ type: "ready" } | { type: "status", message: string } | { type: "runtime-error", message: string } | { type: "result", stdout: string, stderr: string, hasError: boolean }} WorkerMessage */
/** @typedef {{ type: "initialize" } | { type: "run", code: string }} WorkerRequest */

/** @template {HTMLElement} T @param {string} id @param {new (...args: any[]) => T} elementType @returns {T} */
function getRequiredElement(id, elementType) {
  const element = document.getElementById(id);
  if (!(element instanceof elementType)) {
    throw new Error(`Required element "${id}" is missing or has the wrong type.`);
  }
  return element;
}

const editor = getRequiredElement("python-code", HTMLTextAreaElement);
const runButton = getRequiredElement("run-code", HTMLButtonElement);
const resetButton = getRequiredElement("reset-code", HTMLButtonElement);
const clearButton = getRequiredElement("clear-output", HTMLButtonElement);
const output = getRequiredElement("python-output", HTMLPreElement);
const runtimeStatus = getRequiredElement("runtime-status", HTMLParagraphElement);
const currentYear = getRequiredElement("current-year", HTMLSpanElement);

/** @type {Record<string, string>} */
const examples = {
  hello: 'print("Hello, coder!")\nprint("Keep learning and keep creating!")',
  types: 'name = "Amina"       # str: text\nage = 12              # int: a whole number\nheight = 1.5          # float: a decimal number\nis_learning = True    # bool: True or False\n\nprint(name, type(name))\nprint(age, type(age))\nprint(height, type(height))\nprint(is_learning, type(is_learning))',
  decisions: 'age = 12  # int: a whole number\n\nif age >= 10:\n    print("You are ready for a new challenge!")\nelse:\n    print("Keep practising!")',
  loops: 'for number in range(1, 6):\n    print("Count:", number)',
  functions: 'def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nmessage = greet("Coder")\nprint(message)',
};

/** @type {Worker | null} */
let pythonWorker = null;
/** @type {boolean} */
let runtimeReady = false;
/** @type {number | undefined} */
let timeoutId;
/** @type {number | undefined} */
let startupTimeoutId;
/** @type {boolean} */
let runInProgress = false;
const RUN_TIMEOUT_MS = 5000;
const STARTUP_TIMEOUT_MS = 60000;
const DEFAULT_CODE = editor.value;

/** @param {string} message @param {"loading" | "ready" | "error"} state */
function setRuntimeStatus(message, state) {
  runtimeStatus.textContent = message;
  runtimeStatus.dataset.state = state;
}

/** Clear a pending timeout without leaving an undefined timer behind. */
function clearTimers() {
  if (timeoutId !== undefined) {
    window.clearTimeout(timeoutId);
    timeoutId = undefined;
  }
  if (startupTimeoutId !== undefined) {
    window.clearTimeout(startupTimeoutId);
    startupTimeoutId = undefined;
  }
}

/** @param {string} message */
function showRuntimeError(message) {
  clearTimers();
  runtimeReady = false;
  runInProgress = false;
  runButton.disabled = true;
  output.dataset.state = "error";
  output.textContent = `Python could not start. ${message}\n\nCheck your internet connection and refresh the page to try again.`;
  setRuntimeStatus("Python could not start. Check your connection and refresh the page.", "error");
}

/** Start a fresh worker, used at page load and after a timed-out run. */
function startWorker() {
  clearTimers();
  pythonWorker?.terminate();
  runtimeReady = false;
  runInProgress = false;
  runButton.disabled = true;
  setRuntimeStatus("Preparing Python in your browser… The first load needs an internet connection.", "loading");

  try {
    pythonWorker = new Worker("../js/playground-worker.js", {
  type: "module",
});
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    showRuntimeError(detail);
    return;
  }

  pythonWorker.onmessage = (event) => {
    /** @type {WorkerMessage} */
    const message = event.data;

    if (message.type === "status") {
      setRuntimeStatus(message.message, "loading");
      return;
    }

    if (message.type === "ready") {
      if (startupTimeoutId !== undefined) {
        window.clearTimeout(startupTimeoutId);
        startupTimeoutId = undefined;
      }
      runtimeReady = true;
      runButton.disabled = false;
      setRuntimeStatus("Python is ready. Write some code and run it!", "ready");
      return;
    }

    if (message.type === "runtime-error") {
      showRuntimeError(message.message);
      return;
    }

    if (message.type === "result") {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      runInProgress = false;
      runButton.disabled = !runtimeReady;
      const parts = [message.stdout, message.stderr].filter((part) => part.length > 0);
      output.textContent = parts.length > 0 ? parts.join(message.stdout && message.stderr ? "\n" : "") : "Program finished without printing anything.";
      output.dataset.state = message.hasError ? "error" : "success";
    }
  };

  pythonWorker.onerror = (event) => {
    event.preventDefault();
    showRuntimeError("The Python worker encountered a problem.");
  };

  pythonWorker.postMessage({ type: "initialize" });
  startupTimeoutId = window.setTimeout(() => {
    showRuntimeError("The first load took too long.");
    pythonWorker?.terminate();
    pythonWorker = null;
  }, STARTUP_TIMEOUT_MS);
}

function runCode() {
  if (!pythonWorker || !runtimeReady || runInProgress) {
    return;
  }

  runInProgress = true;
  runButton.disabled = true;
  output.dataset.state = "normal";
  output.textContent = "Running your Python program…";
  pythonWorker.postMessage({ type: "run", code: editor.value });

  timeoutId = window.setTimeout(() => {
    pythonWorker?.terminate();
    pythonWorker = null;
    runtimeReady = false;
    runInProgress = false;
    output.dataset.state = "error";
    output.textContent = "⏱️ Your program took too long and was stopped. Check your loop or try a smaller task.";
    setRuntimeStatus("The run was stopped. Restarting Python…", "loading");
    startWorker();
  }, RUN_TIMEOUT_MS);
}

runButton.addEventListener("click", runCode);
resetButton.addEventListener("click", () => {
  editor.value = DEFAULT_CODE;
  output.dataset.state = "normal";
  output.textContent = "Example restored. Press Run Code to see the result.";
});
clearButton.addEventListener("click", () => {
  output.dataset.state = "normal";
  output.textContent = "Output cleared.";
});

document.querySelectorAll("button[data-example]").forEach((button) => {
  button.addEventListener("click", () => {
    const exampleName = button.getAttribute("data-example");
    if (exampleName && Object.prototype.hasOwnProperty.call(examples, exampleName)) {
      editor.value = examples[exampleName];
      output.dataset.state = "normal";
      output.textContent = "Example loaded. Press Run Code to try it.";
      editor.focus();
    }
  });
});

currentYear.textContent = String(new Date().getFullYear());
startWorker();
