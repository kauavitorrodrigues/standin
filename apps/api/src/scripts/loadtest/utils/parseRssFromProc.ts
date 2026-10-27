// The resident set size, in MB, from the text of /proc/<pid>/status. Null when
// the line is not there.
export const parseRssFromProc = (status: string): number | null => {
    const match = /^VmRSS:\s+(\d+)\s+kB/m.exec(status);
    if (!match) return null;
    return Number(match[1]) / 1024;
};

// The clock ticks per second of /proc, which is 100 on every Linux the API runs
// on. Reading it with `getconf CLK_TCK` would only add a process to the test.
export const CLOCK_TICKS_PER_SECOND = 100;

// The CPU time the process has used, in seconds (user plus system), from the
// text of /proc/<pid>/stat. The name of the process sits in parentheses and may
// hold spaces, so the fields are counted after the last parenthesis. Null when
// the line cannot be read.
export const parseCpuSecondsFromStat = (stat: string): number | null => {
    const afterName = stat.slice(stat.lastIndexOf(")") + 1).trim();
    const fields = afterName.split(/\s+/);
    // After the name: state is field 3, so utime and stime are the 12th and 13th.
    const userTicks = Number(fields[11]);
    const systemTicks = Number(fields[12]);
    if (!Number.isFinite(userTicks) || !Number.isFinite(systemTicks)) {
        return null;
    }
    return (userTicks + systemTicks) / CLOCK_TICKS_PER_SECOND;
};

// The pid of the process listening on the port, from `ss -ltnpH` output.
export const parsePidFromSs = (output: string): number | null => {
    const match = /pid=(\d+)/.exec(output);
    return match ? Number(match[1]) : null;
};
