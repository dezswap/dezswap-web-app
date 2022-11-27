import process from "./process-es6.js";

const { Buffer } = await import("buffer/");

window.Buffer = Buffer;
window.process = process;

globalThis.Buffer = Buffer;
globalThis.process = process;
