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

    if (doomStarted) return;
    doomStarted = true;

    library.style.display = "none";
    game.classList.add("active");
    loading.style.display = "grid";
    loading.textContent = "Loading Doom II…";
    canvas.focus();

    // WebDOOM documents -nosound as the browser-safe mode when the optional
    // external SFX/music files are not bundled. Freedoom supplies the game data.
    window.Module = {
      canvas,
      arguments: ["-nosound"],

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

    const script = document.createElement("script");
    script.src = new URL("./doom2.js", document.baseURI).href;
    script.async = false;

    script.onload = () => {
      console.log("[Doom II] WebAssembly engine loaded.");
    };

    script.onerror = () => {
      doomStarted = false;
      showError("ERROR: doom2.js could not be loaded from the Doom II folder.");
    };

    document.head.appendChild(script);
  }

  window.startDoom = startDoom;
})();
