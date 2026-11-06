# Avatar guide

Every person has one avatar, the same in every space. It is a stack of parts
(skin, hair, clothes, accessories) picked in an editor window. Whoever has no avatar is drawn as a ghost. The spawns of the map editor use the same avatar.

The avatar is not the **profile picture**. The profile picture is a square
photo shown in lists, the chat and the name tag, and it is independent from
the avatar: changing one never changes the other. See
[profile-picture.md](profile-picture.md).

This page is for people who use or maintain the feature.

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
5. **Concluir** saves. **Cancelar** throws the draft away. If you changed
   something, closing asks **Descartar alterações?** with three answers:
   **Continuar editando**, **Descartar** and **Salvar**. If the save fails the
   editor stays open with your draft intact. Changing a part and changing it
   back is not an edit.
6. Colors are saved with each part, so reopening the editor shows them and a
   part you add next takes the same color. Removing a part also drops the
   costume.

Nothing is required. An empty avatar means the ghost, but the first time you open the editor without an avatar it starts from a random one.

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

## Animations

The sheet holds the frames of each direction and the game picks one animation
at a time, in this order: dance, emote, walk, eyes closed, idle. Sitting plays
two frames once at 7 fps (the person stands, then sits) and holds the seated
one, instead of a single frame. The dance, held with `Z`, loops the emote
frames at 8 fps facing the viewer, because there is no dance art yet, and holds
the emote pose under reduced motion. See [realtime.md](realtime.md) for the
dance and confetti rules.

## Changing the size of the avatar

The size has one owner, `AVATAR` in `dimensions.ts`. Change it there, raise
`AVATAR_GRID_VERSION` if the grid changed, and review the seats already marked,
because their anchor is the feet. A test of the web app
(`avatarSizeLiterals.test.ts`) fails when a size of the avatar is written as a
number anywhere else in the game, the avatar, the tilesets or the editor.
