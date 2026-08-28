export const webVitestConfig = {
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        clearMocks: true,
        passWithNoTests: true,
    },
};
