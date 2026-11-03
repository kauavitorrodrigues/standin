import {
    SPACE_GUEST_LIST_STATES,
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
} from "@standin/contracts";
import type { SpaceGuestListState } from "@standin/contracts";
import {
    spaceGuestsTable,
    and,
    eq,
    isNotNull,
    isNull,
    lte,
    ne,
    not,
    or,
    sql,
} from "@standin/database";
import type { SQL } from "@standin/database";

/** A pending request past its 24h, or an admission past its validity. */
const lapsedCondition = (now: Date): SQL => {
    const { status, expiresAt } = spaceGuestsTable;
    const condition = and(
        ne(status, SPACE_GUEST_STATUSES.DENIED),
        isNotNull(expiresAt),
        lte(expiresAt, now)
    );
    // `and` gives undefined only with no parts, never here.
    return condition ?? sql`false`;
};

/**
 * The SQL twin of `effectiveState` and `toListState`: the rows that read as
 * the given state at `now`. A request past its end reads as expired even
 * before the sweeper writes that down, so the filter must not trust the
 * stored status alone.
 */
export const listStateCondition = (
    state: SpaceGuestListState,
    now: Date
): SQL | undefined => {
    const { status, statusReason, archivedAt } = spaceGuestsTable;
    const isLapsed = lapsedCondition(now);
    const notLapsed = not(isLapsed);
    const notArchived = isNull(archivedAt);

    switch (state) {
        case SPACE_GUEST_LIST_STATES.ARCHIVED:
            return isNotNull(archivedAt);
        case SPACE_GUEST_LIST_STATES.PENDING:
            return and(
                notArchived,
                eq(status, SPACE_GUEST_STATUSES.PENDING),
                notLapsed
            );
        case SPACE_GUEST_LIST_STATES.ACTIVE:
            return and(
                notArchived,
                eq(status, SPACE_GUEST_STATUSES.ADMITTED),
                notLapsed
            );
        case SPACE_GUEST_LIST_STATES.EXPIRED:
            return and(
                notArchived,
                or(
                    isLapsed,
                    and(
                        eq(status, SPACE_GUEST_STATUSES.DENIED),
                        eq(statusReason, SPACE_GUEST_STATUS_REASONS.TIMEOUT)
                    )
                )
            );
        case SPACE_GUEST_LIST_STATES.REVOKED:
            return and(
                notArchived,
                eq(status, SPACE_GUEST_STATUSES.DENIED),
                ne(statusReason, SPACE_GUEST_STATUS_REASONS.TIMEOUT)
            );
    }
};
