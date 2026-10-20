# Avatar guide

Every person has one avatar, the same in every space. It is a stack of parts
(skin, hair, clothes, accessories) picked in a window copied from the Gather
editor. Whoever has no avatar is drawn as a ghost.

The full design is in `.claude/plans/avatars/plan.md`. This page is the short
version for people who use or maintain the feature.

## Who can do what

| Role               | What they do                                 |
| ------------------ | -------------------------------------------- |
| Admin (`ADMIN`)    | Registers the parts in `/admin/avatar-parts` |
| Any signed in user | Edits their own avatar                       |

## For people: editing your avatar

1. Open your profile card and click **Editar perfil**. The avatar editor opens.
2. Pick a part in each tab. Parts with a color show the palette of the tab.
3. A **costume** replaces everything else while it is chosen. The other choices
   are kept and come back when you remove the costume.
4. Use the dice for a random avatar, the arrows or a click on the preview to
   turn it, and the download button to save the front frame as an image.
5. **Concluir** saves. **Cancelar** throws the draft away.

Nothing is required. An empty avatar means the ghost.

## For admins: the parts library

A part has a front sheet (PNG) and, if it needs one, a back sheet that is drawn
behind the body (a backpack, a long hair, a cape). All sheets share the same
grid and have a transparent background. The size and the grid are in
`packages/contracts/src/avatar/consts/dimensions.ts` and the server refuses a
PNG with another size.

A part marked as colorable is drawn in gray tones, and the color is applied by
multiplying. When a sheet of a part is replaced, the avatar of everyone who uses
it is assembled again.

## How it works

- **One sheet per person.** The server assembles the parts and the colors into a
  single PNG when the person saves, and stores it as a file. The game only ever
  downloads that sheet, never the loose parts.
- **The editor preview uses the same function** as the server
  (`assembleSheet`, in `@standin/contracts`), so both draw the same avatar.
- **Presence.** `space:joined` and `space:peer-joined` carry each person's
  `avatarSheetFileId`, null for the ghost. When someone saves or clears their
  avatar the server emits `space:avatar-changed` to the room, and every client
  swaps the sprite without reloading the scene.
- **Stale sheets.** If a part changes, the sheets that use it are assembled
  again in the background. A sheet that is still stale when a person enters a
  space is assembled again then.
- **Fallback.** While a sheet loads, if it fails, or if the file is gone, the
  ghost is drawn. A broken sheet never breaks a sprite.

## Changing the size of the avatar

The size has one owner, `AVATAR` in `dimensions.ts`. Change it there, raise
`AVATAR_GRID_VERSION` if the grid changed, and review the seats already marked,
because their anchor is the feet. A test of the web app
(`avatarSizeLiterals.test.ts`) fails when a size of the avatar is written as a
number anywhere else in the game, the avatar, the tilesets or the editor.
