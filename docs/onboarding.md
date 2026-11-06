# Onboarding

A short checklist, **Primeiros passos**, that shows a new person what to do in a
space. The progress belongs to the account, not to a space, so it follows the
person everywhere.

## What the person sees

A button with a progress ring sits in the column of buttons of the space page.
The checklist opens by itself once, when the progress has loaded and no task is
done. Each row opens a dialog that explains the task, and its main button closes
the flow and does the task in the space. When all five tasks are done a "Tudo
pronto" toast shows once and the button goes away.

| Task                 | Key                  | Action of the dialog                                              | Counts as done when                                                      |
| -------------------- | -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Claim a desk         | `claim-desk`         | **Ver as mesas** starts the desk guide                            | The person has any desk, however they got it                             |
| Personalize avatar   | `personalize-avatar` | **Abrir o editor**                                                | An avatar save succeeds                                                  |
| Navigate the office  | `navigate-office`    | **Entendi**                                                       | The avatar walked 3 tiles. Teleports and snapping to a seat do not count |
| Customize the office | `customize-office`   | **Decorar a minha mesa**, only with a desk and decorating enabled | A decoration is applied with at least one change                         |
| Hang out             | `hang-out`           | **Entendi**                                                       | The avatar enters a named common area after it has traveled              |

The desk guide outlines the free desks in green with a pulse. With no free desk
it says so and asks the person to talk to whoever administers the office. Once
the person has a desk it offers **Ir até a mesa** or **Agora não**.

A common area is an `area` zone with a label. Private rooms do not count, and
spawning inside one does not either.

The browser remembers in `localStorage` (`onboarding_checklist_<userId>`) that
the checklist opened and that the celebration was shown.

## For maintainers

Progress is `users.onboarding_tasks`, a `jsonb` column that defaults to `{}`
with the shape `{ "<taskKey>": { "completedAt": "<ISO date>" } }`. The keys are
not an enum in the database, so a new task needs no migration. Unknown entries
are dropped on read.

| Endpoint                     | What it does                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| `GET /onboarding`            | `{ tasks }`, with only the completed tasks                                               |
| `PUT /onboarding/tasks/:key` | Marks a task and returns the same shape. An unknown key is 400 `UNKNOWN_ONBOARDING_TASK` |

Marking is idempotent and safe under concurrent calls: it is one `jsonb_set`
that keeps the first `completedAt`. The client does not call again for a task
that is done or in flight, and a failure is silent. The task keys are
`ONBOARDING_TASKS` in `packages/contracts`. The walking and area tasks come from
the game, which emits `player:traveled` and `player:area-entered` on its event
bus.
