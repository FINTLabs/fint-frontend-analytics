import { Pool } from "pg";

declare global {
    // eslint-disable-next-line no-var
    var __dbPool: Pool | undefined;
}

export function db() {
    if (!global.__dbPool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) throw new Error("DATABASE_URL is not set");
        global.__dbPool = new Pool({ connectionString });
    }
    return global.__dbPool;
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
    const result = await db().query(text, params);
    return result.rows as T[];
}