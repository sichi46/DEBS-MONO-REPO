module.exports = {
    root: true,
    extends: ["@repo/eslint-config"],
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: ["dist", "node_modules", "vitest.config.ts", "prisma/"],
    overrides: [
        {
            // Test files routinely cast mocks through `any` — enforcing the rule
            // here produces false positives and adds no safety value.
            files: ["**/*.test.ts", "**/*.spec.ts"],
            rules: {
                "@typescript-eslint/no-explicit-any": "off",
            },
        },
    ],
};
