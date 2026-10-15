// The fields of a Postgres error that the desk conflict handling reads.
export type DatabaseError = {
    code?: string;
    constraint?: string;
    cause?: { code?: string; constraint?: string };
};
