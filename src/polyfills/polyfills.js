import process from "./process-es6.js";

(async () => {
    const { Buffer } = await import("buffer/");
    globalThis.Buffer = Buffer;
    window.Buffer = Buffer;
})();

globalThis.process = process;
window.process = process;
