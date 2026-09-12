"use strict";

class WebGameLauncher {
    constructor(options = {}) {
        this.canvasId = options.canvasId || "game-canvas";
        this.statusId = options.statusId || "status";

        this.canvas = null;
        this.statusElement = null;

        this.running = false;
        this.module = null;
    }

    init() {
        this.canvas = document.getElementById(this.canvasId);
        this.statusElement = document.getElementById(this.statusId);

        if (!this.canvas) {
            throw new Error(
                `Canvas #${this.canvasId} was not found`
            );
        }

        this.setupCanvas();
        this.setupInput();
    }

    setupCanvas() {
        this.canvas.width = 960;
        this.canvas.height = 600;

        this.canvas.style.width = "100%";
        this.canvas.style.height = "auto";

        this.canvas.tabIndex = 0;
    }

    setupInput() {
        this.canvas.addEventListener(
            "click",
            () => {
                this.canvas.focus();
            }
        );

        window.addEventListener(
            "keydown",
            event => {
                const blockedKeys = [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
                    " "
                ];

                if (blockedKeys.includes(event.key)) {
                    event.preventDefault();
                }
            }
        );
    }

    setStatus(message) {
        console.log("[DOOM II]", message);

        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }

    async start() {
        if (this.running) {
            return;
        }

        try {
            this.init();

            this.setStatus(
                "Loading WebAssembly engine..."
            );

            await this.loadGameEngine();

            this.running = true;

            this.setStatus(
                "Game running!"
            );

        } catch (error) {
            console.error(error);

            this.setStatus(
                "Failed to start: " + error.message
            );
        }
    }

    loadGameEngine() {
        return new Promise(
            (resolve, reject) => {

                const script =
                    document.createElement("script");

                script.src = "./doom.js";

                script.async = true;

                window.Module = {
                    canvas: this.canvas,

                    locateFile: (file) => {
                        return "./" + file;
                    },

                    print: (text) => {
                        console.log(
                            "[DOOM]",
                            text
                        );
                    },

                    printErr: (text) => {
                        console.error(
                            "[DOOM ERROR]",
                            text
                        );
                    },

                    setStatus: (text) => {
                        this.setStatus(text);
                    },

                    monitorRunDependencies: (
                        remaining
                    ) => {
                        if (remaining > 0) {
                            this.setStatus(
                                `Loading engine... ${remaining}`
                            );
                        }
                    },

                    onRuntimeInitialized: () => {
                        console.log(
                            "WebAssembly runtime initialized"
                        );

                        resolve();
                    },

                    onAbort: (message) => {
                        reject(
                            new Error(
                                "Engine aborted: " +
                                message
                            )
                        );
                    }
                };

                script.onload = () => {
                    console.log(
                        "Doom JavaScript loader loaded"
                    );
                };

                script.onerror = () => {
                    reject(
                        new Error(
                            "Could not load doom.js"
                        )
                    );
                };

                document.body.appendChild(script);
            }
        );
    }

    stop() {
        if (!this.running) {
            return;
        }

        this.running = false;

        this.setStatus(
            "Game stopped"
        );
    }

    fullscreen() {
        if (!this.canvas) {
            return;
        }

        if (this.canvas.requestFullscreen) {
            this.canvas.requestFullscreen();
        }
    }
}


const game = new WebGameLauncher({
    canvasId: "game-canvas",
    statusId: "status"
});


window.addEventListener(
    "DOMContentLoaded",
    () => {

        const startButton =
            document.getElementById("start-game");

        const fullscreenButton =
            document.getElementById("fullscreen");

        if (startButton) {
            startButton.addEventListener(
                "click",
                () => {
                    game.start();
                }
            );
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener(
                "click",
                () => {
                    game.fullscreen();
                }
            );
        }

        game.start();
    }
);
