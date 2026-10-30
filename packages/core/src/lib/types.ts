import type { Transaction, db } from "@standin/database";

// Anything a query can run on: the connection pool or an open transaction.
export type DbExecutor = Transaction | typeof db;

import type { ROW_LOCK_MODES } from "./consts/locks";

export type RowLockMode = (typeof ROW_LOCK_MODES)[keyof typeof ROW_LOCK_MODES];

export type Dimensions = { width: number; height: number };

export type ImageSize = Dimensions;
