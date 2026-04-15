import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { useAppSession } from "./lib/session";
import { db } from "./database/db";
import { eq } from "drizzle-orm";
import { usersTable } from "./database/schema";
import bcrypt from "bcryptjs";
import { redirect } from "@tanstack/react-router";

export const getCurrentUser = createServerFn({method: "GET"})
    .handler(async () => {
        const session = await useAppSession();
        const userId = session.data.userId;

        if (!userId) {
            return null;
        }
        
        const user = await db.query.usersTable.findFirst({
            where: eq(usersTable.id, userId),
        });

        return user;
    })

export const authenticateUser = createServerOnlyFn(async (email: string, password: string) => {
    const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
    });

    if (!user) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return null;
    }

    return user;
})

export const logout = createServerFn({method: "POST"})
    .handler(async () => {
        const session = await useAppSession();
        await session.clear()

        throw redirect({
            to: "/login",
        })
    })