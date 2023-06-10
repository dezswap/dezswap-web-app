export default {
  "**/*.ts?(x)": () => ["tsc -p tsconfig.json --noEmit", "eslint"],
  "**/*.{js?(x),ts?(x),css,json}": "prettier --write",
};
