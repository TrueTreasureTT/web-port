"use strict";

(() => {
  let doomStarted = false;

  const $ = (id) => document.getElementById(id);

  function showError(message) {
    const loading = $("loading");
    if (loading) {
      loading.style.display = "grid";
      loading.textContent = message;
    }
    console.error("[Doom II]", message);
  }

  function startDoom() {
    const library = $("library");
    const game = $("game");
    const canvas = $("canvas");
    const loading = $("loading");

    if (!library || !game || !canvas || !loading) {
      showError("Doom II launcher: required HTML elements are missing.");
      return;
    }

    // Prevent a second click from loading the Emscripten engine twice.
    if (doomStarted) return;
    doomStarted = true;

    library.style.display = "none";
    game.classList.add("active");
    loading.style.display = "grid";
    loading.textContent = "Loading Doom II…";

    canvas.focus();

    // Emscripten reads window.Module before the generated engine script executes.
    window.Module = {
      canvas: canvas,

      // Keep all generated WebDOOM files relative to Doom II/index.html.
      locateFile(file) {
        return new URL(file, document.baseURI).href;
      },

      print(text) {
        console.log("[Doom II]", text);
      },

      printErr(text) {
        console.error("[Doom II]", text);
      },

      setStatus(text) {
        if (text) loading.textContent = text;
      },

      onRuntimeInitialized() {
        loading.style.display = "none";
        canvas.focus();
        console.log("[Doom II] WebAssembly runtime ready.");
      },

      onAbort(reason) {
        doomStarted = false;
        showError("Doom II stopped: " + (reason || "unknown engine error"));
      }
    };

    // build-doom2.sh normally creates doom2.js.
    // doom.js is kept as a fallback for older WebDOOM builds.
    const candidates = ["./doom2.js", "./doom.js"];

    function loadEngine(index) {
      if (index >= candidates.length) {
        doomStarted = false;
        showError(
          "ERROR: Doom II engine files are missing. Build WebDOOM with ./build-doom2.sh, then reload."
        );
        return;
      }

      const script = document.createElement("script");
      script.src = new URL(candidates[index], document.baseURI).href;
      script.async = false;

      script.onload = () => {
        console.log("[Doom II] Engine loaded:", candidates[index]);
      };

      script.onerror = () => {
        script.remove();
        loadEngine(index + 1);
      };

      document.head.appendChild(script);
    }

    loadEngine(0);
  }

  // index.html calls this directly from the Play button.
  window.startDoom = startDoom;
})();
