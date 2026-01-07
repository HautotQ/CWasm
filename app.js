let clangReady = false;

Module = {
  noInitialRun: true,
  print: (text) => log(text),
  printErr: (text) => log("ERR: " + text),
  onRuntimeInitialized() {
    clangReady = true;
    log("clang WASM prêt");
  }
};

function log(text) {
  document.getElementById("output").textContent += text + "\n";
}

async function runC() {
  const output = document.getElementById("output");
  output.textContent = "";

  if (!clangReady) {
    log("clang pas encore prêt...");
    return;
  }

  const code = document.getElementById("editor").value;

  // écrire le fichier main.c dans le FS virtuel
  Module.FS.writeFile("main.c", code);

  log("Compilation...");

  try {
    Module.callMain([
      "main.c",
      "-o", "a.wasm"
    ]);

    log("Compilation OK");
    log("Exécution :");

    // charger le wasm généré
    const wasmBinary = Module.FS.readFile("a.wasm");
    const wasmModule = await WebAssembly.instantiate(wasmBinary, {
      env: {
        puts: (ptr) => {
          log("puts appelé");
        }
      }
    });

    wasmModule.instance.exports.main();

  } catch (e) {
    log("Erreur : " + e.message);
  }
}
