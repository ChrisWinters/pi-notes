import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "eslint.config.mjs"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts"]
  })),
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      import: importPlugin
    },
    settings: {
      "import/resolver": {
        typescript: true
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "import/no-default-export": "off"
    }
  }
);
