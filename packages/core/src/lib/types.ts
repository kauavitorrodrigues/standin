import type { Transaction, db } from "@standin/database";

// Anything a query can run on: the connection pool or an open transaction.
export type DbExecutor = Transaction | typeof db;

export type Dimensions = { width: number; height: number };

export type ImageSize = Dimensions;
