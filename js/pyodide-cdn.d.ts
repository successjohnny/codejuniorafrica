
declare module "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs" {
  export interface PyProxy {
    get(key: string): unknown;
    destroy(): void;
  }

  export interface PyodideInterface {
    globals: {
      set(name: string, value: string): void;
    };

    runPythonAsync(code: string): Promise<PyProxy>;
  }

  export function loadPyodide(): Promise<PyodideInterface>;
}