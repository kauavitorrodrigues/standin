import { BootstrapService } from "@standin/core";
import { BootstrapInputInvalidError } from "@standin/contracts";

// Creates the first admin and organization of a fresh instance from the
// environment, with no prompts. An empty variable counts as not set and the
// defaults live in the service. Without ADMIN_PASSWORD a strong one is
// generated and printed once, here, and nowhere else.
const env = (name: string) => process.env[name]?.trim() || undefined;

async function bootstrap() {
    const email = env("ADMIN_EMAIL");
    if (!email) {
        console.error("ADMIN_EMAIL is required.");
        process.exit(1);
    }

    const result = await BootstrapService.instance({
        email,
        password: process.env.ADMIN_PASSWORD || undefined,
        name: env("ADMIN_NAME"),
        organizationName: env("ORGANIZATION_NAME"),
    });

    for (const { label } of result.steps) console.log(`✓ ${label}`);
    if (result.generatedPassword) {
        console.log(
            `  generated password (shown only now, store it): ${result.generatedPassword}`
        );
    }
    process.exit(0);
}

bootstrap().catch((error) => {
    // An invalid input is a message for the operator, not a stack trace.
    console.error(
        error instanceof BootstrapInputInvalidError ? error.message : error
    );
    process.exit(1);
});
