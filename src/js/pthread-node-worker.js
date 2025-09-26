// Post-JS file for Node.js pthread worker support
// This code is injected into pyodide.asm.js after Emscripten generates it

// Override PThread.allocateUnusedWorker for Node.js
if (typeof PThread !== 'undefined' && PThread.allocateUnusedWorker) {
  const originalAllocateUnusedWorker = PThread.allocateUnusedWorker;

  PThread.allocateUnusedWorker = function() {
    var worker;
    var pthreadMainJs = _scriptName;

    if (Module["mainScriptUrlOrBlob"]) {
      pthreadMainJs = Module["mainScriptUrlOrBlob"];
      if (typeof pthreadMainJs != "string") {
        pthreadMainJs = URL.createObjectURL(pthreadMainJs);
      }
    }

    // In Node.js, use the worker wrapper instead of the main script
    if (ENVIRONMENT_IS_NODE) {
      const path = require("path");
      const __dirname = path.dirname(_scriptName);
      pthreadMainJs = path.join(__dirname, "pyodide-worker.js");
    }

    worker = new Worker(pthreadMainJs, {
      workerData: "em-pthread",
      name: "em-pthread"
    });

    PThread.unusedWorkers.push(worker);
  };
}