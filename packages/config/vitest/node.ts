export const nodeVitestConfig = {
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        clearMocks: true,
        passWithNoTests: true,
    },
};
