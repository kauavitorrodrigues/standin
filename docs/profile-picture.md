# Profile picture guide

Every person can have a profile picture: a square photo that shows in the
profile card, the lists of people, the chat and the name tag over the avatar in
a space. Whoever has none is shown as the first initial of the name on a flat
color, as before.

The profile picture is not the avatar. The avatar is the layered sprite that
walks around the space (see [avatar.md](avatar.md)). They are independent:
changing one never changes the other.

This page is for people who use or maintain the feature.

## Who can do what

| Role               | What they do                                        |
| ------------------ | --------------------------------------------------- |
| Any signed in user | Sets, changes and removes their own profile picture |

Nobody can change the picture of another person.

## For people: changing your picture

1. Open your profile card and click **Editar perfil**.
2. To add a photo, click the picture or the pencil on **Foto de perfil**, and
   the file chooser opens right away. You can also drop an image on the picture.
3. To change a photo you already have, click the pencil on the corner of the
   picture, which is always shown. The new photo replaces the current one, so
   you do not have to remove it first. With a photo, the picture itself is not a
   drop zone: only the pencil and the X react, and a dropped image is ignored.
4. The photo is sent as soon as you choose it. The picture is dimmed with a
   spinner while it is sent, and you cannot send another meanwhile. If it
   fails, an error message shows and your previous picture stays.
5. The **X** shows in the middle of the picture only while the mouse is over
   it. It removes the picture and goes back to the initial, and it asks for
   confirmation first.

Everyone in the same space sees the change on your name tag without reloading.

## Limits

| Rule          | Value                                           |
| ------------- | ----------------------------------------------- |
| Formats       | PNG, JPEG or WebP (animated images are refused) |
| File size     | Up to 5 MB                                      |
| Smallest side | At least 32 px                                  |
| Largest side  | No limit. A 4000 px phone photo is fine         |

The server keeps the center square of the shorter side, shrinks it to 256 x 256 px and stores it as a PNG with no metadata (no EXIF, no
location). The file you chose is never stored.

## For maintainers

- The API (controller layer) receives and processes the image, the core only
  persists. The processing is in
  `apps/api/src/features/users/utils/processProfilePicture.ts` (`sharp`),
  called through `buildProfilePictureAction`. The browser sends the file as it
  is and only checks the format, the file size and
  the smallest side to warn early. The upload middleware and
  `validateProfilePictureFile` check the mime type, extension and size the
  client declares, and the format is read again from the bytes, never trusted
  from the file name or the mime type. The crop is always the center square of the
  shorter side, after the EXIF orientation is applied.
- The limits live in one place, `PROFILE_PICTURE` in
  `packages/contracts/src/users/consts/profile-picture.ts`.
- One row per person in `user_profile_pictures`, pointing at a `files` row.
  The database keeps no URL: the API builds `/files/:id` as `profilePictureUrl`
  (`null` without a picture). Replacing or removing a picture deletes the old
  file in the same transaction.
- Routes (signed in): `PUT /users/me/profile-picture` (multipart with only the
  `file` field) and
  `DELETE /users/me/profile-picture`. Both answer `{ user }`. Errors:
  422 not a valid image, 413 file too large, 415 no file sent.
- Live update: the core runs `UserService.onProfilePictureChanged`, and the
  socket server emits `space:profile-picture-changed` (`{ userId,
profilePictureUrl }`) to the spaces where the person is connected.
- `UserService.updateProfilePicture(userId, action)` is the single path for any
  source of a picture. The action is `{ action: "set", file }` with the final
  PNG, or `{ action: "remove" }`. The core never decodes an image. A future
  import (for example from a login provider) calls
  `buildProfilePictureAction` with the downloaded bytes and then this function.
