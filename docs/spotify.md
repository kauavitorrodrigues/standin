# Spotify guide

An organization can connect Spotify, so its people can link their own Spotify
account. It is optional and off until the owner of the organization brings a
Spotify app. Nothing is set on the instance: every organization has its own
Spotify app, its own list of people and its own limit.

This page is for the owner of an organization and for the people who run the
instance. It says how to create the Spotify app, what the owner fills in, what
a member does, and what the connection does and does not do.

## What it does today

- The owner saves the Client ID and Client Secret of a Spotify app in the
  settings of the organization.
- Each member links their own Spotify account to that app, and can unlink it.
- The owner sees who holds a place and can free one.

- Everyone who is connected shows what they are playing to the others in the
  space (see below).

## What people are playing

Every connected person who is online in a space shows what they play:

- The server asks Spotify every 10 seconds for each connected person who is
  online in a space, and sends an event to the space only when the track, or
  whether it is playing or paused, changes. People who join later get what is
  shown in the join snapshot. The browser never talks to Spotify.
- The profile card of the person has a "Ouvindo" card with the cover, the track,
  the artists and the Spotify logo. It opens the track in Spotify in a new tab.
- While the music plays, paper-like music notes rise from the avatar. Everyone
  near the person sees them, including the person. They stop when the music
  pauses and are not drawn with reduced motion.
- Nothing is shown for a private session, an ad or a podcast episode. A track
  paused for more than 5 minutes is hidden until the music plays again.
- A 429 from Spotify pauses the polling of that organization for the time
  Spotify asked. Other errors (401, 403, a network failure) never break the
  space: a refused refresh token removes the connection, and the others keep
  what was shown.

The server keeps the access token in memory only, and the new refresh token
Spotify sometimes sends is sealed and saved.

## The limit of 5 people

Spotify keeps every new app in development mode:

- The **owner of the Spotify app needs an active Spotify Premium
  subscription**. If it lapses, the app stops working until it is renewed.
- The app serves up to **5 people**. Each one has to be added by hand to the
  list of the app in the Spotify dashboard, with the name and the e-mail of
  their Spotify account.
- A person who is not on that list can sign in to Spotify, but every request
  the app makes for them is refused (403).

Lifting the limit needs a quota extension that Spotify gives only to registered
businesses with a large audience, so plan for 5. Standin enforces the same
number: the sixth person gets a message instead of a confusing error after the
Spotify sign in.

Spotify changes these rules from time to time. The current ones are in the
[quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
page.

## Create the Spotify app

1. Sign in at the [Spotify developer
   dashboard](https://developer.spotify.com/dashboard) with the Premium
   account that will own the app.
2. Click **Create app**. Give it a name and a short description people will
   recognize on the Spotify authorization screen.
3. In **Redirect URIs**, add the address that the settings of Standin show
   (see below), exactly as shown. It is the same string for the whole
   instance.
4. In **Which API/SDKs are you planning to use?**, choose **Web API**, accept
   the terms and save.
5. Open the app, then **Settings**. Copy the **Client ID**, and use **View
   client secret** to copy the **Client Secret**.
6. In **Settings > User management**, add each person who will connect, with
   the name and the e-mail of their Spotify account. Up to 5.

The labels above are the ones of the dashboard today and may change. Spotify
requires `https` for the Redirect URI. The only exception is a loopback
address, which may use plain `http` but must be written as `127.0.0.1` or
`[::1]`: `localhost` is not allowed. The address you register has to be exactly
the one Standin sends, so copy it from the card.

### Trying it on your machine

Spotify does not accept `localhost`, so to connect Spotify in development the
whole app has to run on `127.0.0.1`. This is only for the Spotify connection:
everything else works on `localhost`.

You do not have to edit the `.env` back and forth. Keep it on `localhost` and
start the app with the script made for this:

```bash
pnpm dev:loopback
```

It sets `SERVER_URL`, `FRONTEND_URL`, `VITE_BASE_API_URL` and
`GITHUB_CALLBACK_URL` to `127.0.0.1` for that run only (what is set on the
command wins over the `.env`), and starts the web on `127.0.0.1` too. Then open
`http://127.0.0.1:5173`. `pnpm dev` goes on working on `localhost`. The ports
are the default ones, 3001 and 5173. Stop one mode before starting the other.

The rest of this section says what the script does, for when you want to set it
up by hand.

The attempt (its `state`) and your session travel in cookies, and cookies do
not cross from `localhost` to `127.0.0.1`. The browser, the web and the API
have to agree on one host, so set these in the `.env` and restart the API and
the web:

```env
SERVER_URL="http://127.0.0.1:3001"
FRONTEND_URL="http://127.0.0.1:5173"
VITE_BASE_API_URL="http://127.0.0.1:3001"
```

- Register `http://127.0.0.1:3001/integrations/spotify/callback` as the
  Redirect URI (the card shows it).
- Open the web at `http://127.0.0.1:5173`, never at `localhost`: the API only
  accepts `FRONTEND_URL` as the origin (CORS), so a page opened at another host
  has every request blocked.
- Vite may listen only on IPv6 (`[::1]`), and then `127.0.0.1:5173` does not
  open. Start it with `pnpm --filter web exec vite --host 127.0.0.1`.
- `DATABASE_URL` can stay on `localhost`.
- If you also use the sign in with GitHub in this mode, change
  `GITHUB_CALLBACK_URL` to `http://127.0.0.1:3001/auth/github/callback` and
  register that address in the GitHub App, or the sign in comes back to
  `localhost` and loses the session.

#### Running the new version

1. Apply the migration that creates the two tables:
   `pnpm -C packages/database db:migrate`.
2. Start the app with `pnpm dev:loopback`. (By hand: put the `.env` on
   `127.0.0.1` as above and start with `pnpm dev`; if
   `http://127.0.0.1:5173` does not open, start the web with
   `pnpm --filter web exec vite --host 127.0.0.1`.) The
   `GITHUB_CALLBACK_URL` only matters if you also sign in with GitHub in this
   mode, see the [GitHub guide](github-login.md#cookies-and-the-lan-mode).
3. Open `http://127.0.0.1:5173`, sign in as the owner of an organization and
   open a space.
4. Go to **Settings > Organização > Apps > Spotify > Configurar app** and
   follow the steps. Then each person goes to **Settings > Preferências >
   Integrações** and clicks **Entrar com o Spotify**.

To go back, put the three variables on `localhost` again and open the web at
`http://localhost:5173`. To use a real address instead (an HTTPS domain), set
the three variables to it, or set `API_PUBLIC_URL`, and register that Redirect
URI.

## Save it in Standin

The owner opens a space, then **Settings > Organização > Apps**. Only the owner
sees this tab.

1. Copy the address under **Endereço de retorno** and register it in the
   Spotify app (step 3 above).
2. Paste the Client ID and the Client Secret and save. Standin asks Spotify if
   the pair is valid and refuses it when it is not. It cannot tell if the owner
   has Premium or who is on the list of the app, that only shows when a person
   connects.
3. The list below shows who holds the places and has a button to remove
   someone.

The secret is never shown again. The field stays empty after saving, and a new
save replaces it. Changing the Client ID is a different Spotify app, so the
connections made with the old one are deleted.

**Remover app** deletes the app and every connection made with it.

### The redirect address

The address is `<API_PUBLIC_URL>/integrations/spotify/callback`. The API does
not know how the browser reaches it behind a proxy, so `API_PUBLIC_URL` says.

| Variable         | Use                                                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_PUBLIC_URL` | Optional. The address where the browser reaches the API. The compose stack sets it to `FRONTEND_URL` plus `/api`, as the Caddyfile proxies it. Without it `SERVER_URL` is used, right in development |

Changing the address means registering the new one in every Spotify app.

## Connect an account

A member opens **Settings > Preferências > Integrações** and clicks **Entrar com
o Spotify**. Until the owner sets the app up the button is locked and the row says
so. **Atualizar** connects again (it also refreshes the Spotify photo) and
**Desconectar** ends the connection. Spotify asks for the permission, then sends the person back to Standin with a message
that says how it ended.

| Message                             | What happened                                                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spotify conectado                   | Done.                                                                                                                                                          |
| Você não autorizou o Spotify        | The person refused on the Spotify page.                                                                                                                        |
| Todas as vagas estão ocupadas       | The organization already has 5 connections. The owner frees one.                                                                                               |
| Essa conta não está na lista do app | The Spotify account is not in **User management** of the Spotify app. The owner adds it, then retry.                                                           |
| O Spotify não está configurado      | The owner removed the app in the meantime.                                                                                                                     |
| A tentativa de conexão expirou      | The person took more than 10 minutes, opened the link in another browser, or started two connections in two tabs at once (one attempt per browser). Try again. |

A connection belongs to one person in one organization. Someone in two
organizations connects in each one, because each has its own Spotify app.

**Desconectar** deletes the tokens at once. Spotify has no call to revoke them,
so the access of the app also stays listed in the Spotify account until the
person removes it at
[spotify.com/account/apps](https://www.spotify.com/account/apps).

A connection also ends when the person deletes their Standin account and when
the organization is deleted. Standin has no way yet to remove a member or to
leave an organization; when it does, the connections of that person in it go
too.

## Where the data is kept

- `organization_integrations`: one row per organization and provider with the
  Client ID and the Client Secret. The secret is sealed.
- `app_connections`: one row per person, organization, provider and service
  with the account id at the provider and the refresh token (sealed) and the
  scope. The access token is not kept.

Both are written for more than Spotify, so another provider reuses them.

Sealed values are readable only by a server with the same `INVITE_LINK_SECRET`.
**Changing it makes the saved Spotify secrets unreadable**: the owner sees the
app as not set and saves the pair again, and the refresh tokens of the people
stop working so they connect again. The same variable also seals the invite
links, each use with its own key, so a value sealed for one cannot be opened
as the other.

## What it does not do

- It does not play, pause or change anything in Spotify. The only permission
  asked is `user-read-currently-playing`.
- It has no switch yet to hide what you play: connecting is what shares it.
- It does not ask for the e-mail or the name of the Spotify account.
- It does not check the Premium of the owner. If it lapses, Spotify refuses the
  app and connecting fails with the generic message until it is renewed.

## References

The pages of Spotify that explain each step. The same links are in the setup
dialog of the card.

- [Developer dashboard](https://developer.spotify.com/dashboard)
- [Getting started: create an app, Client ID and secret](https://developer.spotify.com/documentation/web-api/tutorials/getting-started)
- [Apps](https://developer.spotify.com/documentation/web-api/concepts/apps)
- [Redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)
- [Quota modes: the limit of 5 people and the Premium owner](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
