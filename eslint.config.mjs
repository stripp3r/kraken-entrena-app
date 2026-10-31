import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts de Node sueltos (CommonJS a propósito, corren con `node
    // scripts/x.js`, usan __dirname) -- no son parte de la app Next/TS.
    "scripts/**",
    // Archivos estáticos servidos tal cual (el WASM de MediaPipe es código de terceros ya compilado: daba 10
    // errores y ~500 avisos que tapaban los del código propio) y los skills locales de Claude Code.
    "public/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
