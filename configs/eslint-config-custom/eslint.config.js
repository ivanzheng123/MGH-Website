import tseslint from "typescript-eslint";
import eslintPluginTurbo from "eslint-plugin-turbo";
import eslintConfigPrettier from "eslint-config-prettier";

/** @type { import("eslint").Linter.Config[] } */
export default [
    // all of this is default config
    {
        files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        rules: {
            semi: "warn",
            "no-empty": "off",
            "prefer-const": "off",
            "no-unused-vars": "off",
        },
    },
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/prefer-ts-expect-error": "off",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
    {
        files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
        plugins: {
            turbo: eslintPluginTurbo,
        },
        rules: {
            "turbo/no-undeclared-env-vars": "error",
        },
    },

    // custom config
    eslintConfigPrettier,
    {
        files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        rules: {},
    },
];
