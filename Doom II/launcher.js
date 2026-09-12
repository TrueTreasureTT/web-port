"use strict";

(() => {
  let doomStarted = false;
  let engineScript = null;

  function $(id) {
    return document.getElementById(id);
  }

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

    library.style.display = "none";
    game.classList.add("active");
    loading.style.display = "grid";
    loading.textContent = "Loading Doom II…";
    canvas.focus();

    if (doomStarted) return;
    doomStarted = true;

    // WebDOOM/Emscripten reads Module before the generated engine script starts.
    window.Module = {
      canvas,
      locateFile(file) {
        return new URL(file, document.baseURI).href;
      },
      print(text) {
        console.log("[DOOM II]", text);
      },
      printErr(text) {
        console.error("[DOOM II]", text);
      },
      setStatus(text) {
        if (text) loading.textContent = text;
      },
      onRuntimeInitialized() {
        loading.style.display = "none";
        canvas.focus();
      },
      onAbort(reason) {
        doomStarted = false;
        showError("Doom II stopped: " + (reason || "unknown engine error"));
      }
    };

    // build-doom2.sh stages the generated WebDOOM files in this directory.
    // Prefer the original Doom II glue file, then use doom.js as the build-script fallback.
    const candidates = ["./doom2.js", "./doom.js"];

    function loadNext(index) {
      if (index >= candidates.length) {
        doomStarted = false;
        showError(
          "ERROR: Doom II engine is not built. Run ./build-doom2.sh in Codespaces, then reload."
        );
        return;
      }

      const script = document.createElement("script");
      script.src = candidates[index];
      script.async = false;

      script.onload = () => {
        engineScript = script;
        console.log("[Doom II] Engine loaded:", script.src);
      };

      script.onerror = () => {
        script.remove();
        loadNext(index + 1);
      };

      document.head.appendChild(script);
    }

    loadNext(0);
  }

  // Keep this global so other pages or the browser console can launch the game.
  window.startDoom = startDoom;

  document.addEventListener("DOMContentLoaded", () => {
    const button = $("play");
    if (!button) return;

    button.addEventListener("click", startDoom, { once: false });
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        startDoom();
      }
    });
  });
})();
