# Spaces guide

A space is a place the people of an organization walk around in. It belongs to
one organization and owns exactly one map (see [map-editor.md](map-editor.md)).
This page covers how a space is shown in the list, and in particular its
photo.

This page is for people who use or maintain the feature.

## The photo of the space

Each space card in the list shows a photo of the map. Whoever has none yet is
shown as a colored gradient.

The photo is **a picture of the map as the owner published it**. It is a
feature, not a gap, that it follows the published map and nothing else:

- It is made for you. There is no upload and no crop: nobody picks an image,
  and nobody can put an image there that is not the map.
- It changes when the owner publishes the map in the editor, and only then.
- Decorating (placing objects, assigning or moving a desk) does not change it.
  Decorating is the everyday tweaking of the room by whoever sits in it, and
  the card stays a steady cover of the map instead of changing every time
  somebody moves a plant.

### When it is made

| When                                                | What happens                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| You create a space                                  | The photo is taken from the template, or the blank map, you chose                    |
| The owner publishes in the map editor               | The map is photographed again and the photo is replaced                              |
| The owner opens the editor of a space with no photo | The photo is taken then. This is how spaces made before the photo existed get theirs |

Nothing waits for the photo. Creating a space opens it right away, and the card
takes the photo when it arrives. If taking or sending it fails, nothing is
shown to you: the card keeps the gradient (or the previous photo), and the next
publish tries again.

Publishing something that does not change how the map looks (a zone, or a
change you undid) does not send a new photo. The editor compares the new photo
with the last one it sent, and skips the upload when they are the same.

### Who can do what

| Role   | What they do                                           |
| ------ | ------------------------------------------------------ |
| Owner  | Changes the photo, by publishing the map in the editor |
| Member | Sees the photo. Cannot change it                       |

Only the owner can send a photo. A member who decorates their own desk does not
change it, and the server would refuse the upload anyway.

### Limits

| Rule         | Value                                                     |
| ------------ | --------------------------------------------------------- |
| Format       | PNG                                                       |
| File size    | Up to 3 MB                                                |
| Longest side | 640 px, in the proportion of the map (what the app sends) |

The server stores the file as `spaces/<spaceId>/<id>.png`, whatever name the
browser sent, and checks that the bytes are a PNG, not only the type the
browser declared.

## For maintainers

### Where things are

| Layer    | Where                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| Database | `spaces.thumbnail_file_id`, nullable, a foreign key to `files` (migration `0015_add_space_thumbnail`)               |
| Contract | `thumbnailUrl` (`string \| null`) on `Space` and `SpaceDetails`, ready to display                                   |
| Core     | `packages/core/src/features/spaces/setThumbnail.ts`, and the cleanup in `delete.ts` and `deleteByOrganizationId.ts` |
| API      | `PUT /organizations/:organizationId/spaces/:spaceId/thumbnail`, permission `update` on `space`                      |
| Web      | `SpaceCard` and `Thumbnail`, `SpaceMapEditorPage`, `CreateForm` and `useCaptureSpaceThumbnail`                      |

The photo does not go in the body of the update: it is a `multipart/form-data`
upload in the field `thumbnail`, one file.

### How it is taken

The server never renders a map. The photo always comes from the browser:

- **In the editor**, the shared editor already knows how to photograph its own
  scene. `MapEditorPage` takes a `thumbnail` target (`{ missing, save }`).
  `SpaceMapEditorPage` passes `missing: !space.thumbnailUrl` and a `save` that
  calls the upload. A photo is made once when the scene is ready and the space
  has none, and again after every successful publish. The template editor uses
  the same code.
- **On creation**, `CreateForm` starts `useCaptureSpaceThumbnail` after the
  space exists. It draws the map the space came from (the preview the page
  already loaded, from the cache) in a game of its own, off the screen
  (`captureMapPreview`), photographs it and tears it down. It gives up after 8
  seconds, and the form does not wait for it.

A failure of the photo is logged with `console.warn` and never reaches the
editor or the creation: `saveMapThumbnail` swallows it.

The editor keeps a memory of the last photo it sent (`ThumbnailMemory`: a
SHA-256 of the bytes, and a queue). A photo equal to it is not sent. The saves
go one at a time, in the order of the publishes, so the memory ends with the
photo the server got last. The memory lives as long as the editor is open, so
the first publish after opening sends one photo even if it did not change.

### Storage

Replacing and deleting follow the same rule as the profile picture
(`updateProfilePicture`): inside the transaction, the old `files` row is soft
deleted and the space is pointed at the new file, with the row of the space
locked. The old object leaves storage only after the commit
(`FileService.purge`), and a failure to remove it is logged. If the transaction
fails, the new file is removed and the old one is untouched.

Deleting a space, or its organization, removes the photo the same way. The
organization delete returns the storage keys and purges them after its own
commit.

The extension of a stored object decides how it is served back, so the upload
never trusts the name the browser sent: `setSpaceThumbnail` checks the PNG
signature of the bytes and stores under a fixed name and type.

### Not covered on purpose

- **Decorating does not retake the photo.** See above. The owner's next publish
  in the editor does.
- **No server rendering and no job.** Only the Phaser scene draws a map the way
  the editor shows it, and a second renderer on the server would drift from it.
  The photo is already taken off the critical path, so a job would not make
  anything faster.

### Tests

- `packages/database`, `packages/contracts` and `packages/core` have unit tests
  for the column, the contract, the serialization, the replace and the delete
  (including the order commit, then purge, and the rollback).
- `apps/api/src/__integration__/spaces.thumbnail.http.integration.test.ts` runs
  the real Express stack against a real Postgres: upload, replace, every
  refusal (no file, not an image, not a PNG by its bytes, wrong organization,
  not the owner), the stored name, and the cleanup when the space or the
  organization goes away. It is off unless `INTEGRATION_DATABASE_URL` points at
  a throwaway database different from `DATABASE_URL`.
- `apps/web` tests the upload mutation, the cache update, the card, the editor
  wiring, the capture and the memory, with Phaser replaced by a fake.
