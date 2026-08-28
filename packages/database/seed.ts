import bcrypt from "bcryptjs";
import { db, usersTable, and, eq, isNull } from "./src";

const BCRYPT_SALT_ROUNDS = 10;

const DEMO_USER = {
    name: "Demo",
    email: "demo@standin.dev",
    password: "Sup3r$ecret",
};

async function seed() {
    const [existingUser] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
            and(
                eq(usersTable.email, DEMO_USER.email),
                isNull(usersTable.deletedAt),
            ),
        );

    if (existingUser) {
        console.log(`Usuário demo já existe: ${DEMO_USER.email}`);
        process.exit(0);
    }

    const password = await bcrypt.hash(DEMO_USER.password, BCRYPT_SALT_ROUNDS);

    await db.insert(usersTable).values({
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        password,
    });

    console.log(
        `✓ Usuário demo criado: ${DEMO_USER.email} / ${DEMO_USER.password}`,
    );
    process.exit(0);
}

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
