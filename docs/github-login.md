# Sign in with GitHub guide

An instance can let people sign in with their GitHub account, next to the
e-mail and password form. It is optional and off by default. The GitHub App
belongs to the instance, not to an organization, so every organization sees the
same button.

This page is for the people who run the instance. It says how to create the
GitHub App, which variables turn the login on, and what the login does and does
not do.

## What the login does

- Proves who the person is. It does not put them in any organization: joining
  an organization is still by invite.
- Reads the GitHub name, the primary verified e-mail and the photo, and keeps
  only the numeric GitHub id and the login. The GitHub access token is thrown
  away right after the profile is read. The client secret stays in `.env`.
- Signs the person in with the same session as the e-mail and password login:
  the same token in the same `token` cookie.

### Who ends up signed in

| Situation                                   | Result                                                                                                                                             |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| The GitHub account was used before          | Signs in as the same person. Nothing in the profile changes.                                                                                       |
| An active person has the verified e-mail    | The GitHub account is linked to them and they sign in. Their name, avatar and photo stay. The GitHub photo is imported only if they have none.     |
| Nobody has the e-mail                       | A new person is created with the GitHub name and e-mail, no password, a random avatar and the GitHub photo. They go through the normal onboarding. |
| The primary e-mail is private or unverified | Refused. Nothing is created or linked.                                                                                                             |
| The e-mail belongs to a deleted person      | A deleted person is never reactivated. A new person is created instead.                                                                            |

The login never links by an e-mail that GitHub did not verify, because that
would let anyone take over an account by registering its e-mail on GitHub.

### What it does not do

- A person who only signs in with GitHub has no password and cannot sign in
  with e-mail and password. Setting a password from the profile is not part of
  this feature.
- The name, e-mail and photo are read once, at the first sign in (the photo also
  when an existing person links and has none). They are not synced afterwards.
- It does not touch the avatar sprite, except to give a random one to a person
  who was just created.
- No session table and no revoking of sessions. That did not change.

## Create the GitHub App

In GitHub, go to **Settings > Developer settings > GitHub Apps > New GitHub
App**. Use the account of the person or the organization that runs the
instance. Fill the form exactly like this. Anything not listed stays at its
default or empty.

| Field                                                       | Value                                                                     | Why                                                                                                                                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **GitHub App name**                                         | A name people know, for example `Stand!N Acme`                            | It is the name on the "Authorize ..." screen that every person sees. At most 34 characters and unique across GitHub.                                                                 |
| **Description**                                             | Optional. For example `Sign in to Stand!N with your GitHub account.`      | Shown to people on the authorization page.                                                                                                                                           |
| **Homepage URL**                                            | The public address of the web (the `FRONTEND_URL`), or the repository URL | Required, and it has to be a full URL.                                                                                                                                               |
| **Callback URL**                                            | `<API URL>/auth/github/callback`                                          | Where GitHub sends the person back. Up to 10 URLs, so add the production one, `http://localhost:3001/auth/github/callback` for development and the LAN one if you use it. See below. |
| **Expire user authorization tokens**                        | Checked (the default)                                                     | GitHub recommends it. The token is not stored anyway.                                                                                                                                |
| **Request user authorization (OAuth) during installation**  | Unchecked                                                                 | The login does not install anything. If it were checked, the Setup URL could not be used.                                                                                            |
| **Enable Device Flow**                                      | Unchecked                                                                 | The login uses the web flow.                                                                                                                                                         |
| **Setup URL** and **Redirect on update**                    | Empty and unchecked                                                       | Only the future installation per organization needs them.                                                                                                                            |
| **Webhook > Active**                                        | Unchecked                                                                 | The login receives no events. Turn it on when the GitHub integration is built, then fill the URL and the secret.                                                                     |
| **Repository permissions** and **Organization permissions** | None                                                                      | The login does not read any repository. If GitHub adds a read only permission by itself, leave it.                                                                                   |
| **Account permissions > Email addresses**                   | **Read-only**                                                             | The only permission the login needs. Without it `/user/emails` does not answer and nobody can sign in.                                                                               |
| **Subscribe to events**                                     | None                                                                      | Events need the webhook to be active.                                                                                                                                                |
| **Where can this GitHub App be installed?**                 | **Any account**                                                           | See the note below.                                                                                                                                                                  |

**On "Any account".** GitHub's own docs say a private app ("Only on this
account") can only be installed by its owner, but they do not say whether other
people can still sign in with it. Since every person of the instance has to
sign in, choose **Any account**. If you prefer to keep the app private, test it
with a second GitHub account first. If that account gets a "not found" page on
GitHub, switch to **Any account**.

Then click **Create GitHub App**. On the page of the app:

1. Copy the **Client ID** shown at the top of the page. It looks like
   `Iv23li...`. It is not the "App ID".
2. In **Client secrets**, click **Generate a new client secret** and copy it
   right away: GitHub shows it only once. If you lose it, generate another and
   delete the old one.

The labels above are the ones of the GitHub form today and may change. The
reference is [Registering a GitHub
App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app).

### What the person sees on GitHub

The first time, GitHub shows the name of the app and asks for the permission to
read the e-mail addresses. After that GitHub only redirects back. GitHub Apps
do not use a `scope` in the authorize URL, the permissions come from the form
above, so the login sends only `client_id`, `redirect_uri`, `state`,
`code_challenge` and `code_challenge_method=S256`.

## Variables

Set them in the `.env` at the repository root and restart the API.

| Variable               | Use                                    |
| ---------------------- | -------------------------------------- |
| `GITHUB_CLIENT_ID`     | Client ID of the App                   |
| `GITHUB_CLIENT_SECRET` | Client secret of the App               |
| `GITHUB_CALLBACK_URL`  | The callback URL registered in the App |

The login is on only when the three are filled. With any of them empty, the
button does not show and `GET /auth/github` and `GET /auth/github/callback`
answer 404. `GET /auth/providers` tells the web which providers are on
(`{ "github": true }`), and it reads the same configuration as the routes.

After the login the API redirects the browser to `FRONTEND_URL`, the same
variable the API already uses for CORS, so there is no second setting for it.

`.env.example` also lists `GITHUB_WEBHOOK_SECRET`, `GITHUB_APP_SLUG`,
`GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` as comments. They are reserved for
the future GitHub integration and nothing reads them today.

### The callback URL rule

`GITHUB_CALLBACK_URL` and the Callback URL registered in the App must be the
exact same string. GitHub refuses the sign in when they differ, even by a
trailing slash or `http` against `https`. The URL points at the API, not at the
web.

### Cookies, and the LAN mode

The browser goes web, API, GitHub, API and back to the web. The API sets the
`token` cookie on the callback response, and that cookie is what the HTTP
requests and the game socket use. The web never reads the token itself.

- **Normal dev** (web on `localhost:5173`, API on `localhost:3001`): cookies are
  not scoped by port, so the cookie reaches both. Nothing to configure.
- **`pnpm dev:lan`**: the page and the API share one https origin through the
  `/api` proxy. For the login to work from another computer, register and set
  the callback URL on that origin, for example
  `https://192.168.0.10:5173/api/auth/github/callback`, and set `FRONTEND_URL`
  to `https://192.168.0.10:5173`, so the redirect lands on the same origin that
  holds the cookie.
- In production the cookie is `Secure`, so the instance must be served over
  https.

## For maintainers

The work is split in two. Everything that talks to GitHub lives in the
provider, `packages/infra/src/integrations/github`, and the API only does HTTP
and app work around it. The core only persists and applies the domain rules on
prepared data.

### The provider (`packages/infra/src/integrations/github`)

- `GithubProvider` has `isConfigured`, `getConfig`, `getAuthUrl`,
  `exchangeCode`, `getProfile`, `getVerifiedEmail` and `downloadAvatar`. It
  reads its own variables (names in `consts/env.ts`) and throws the OAuth
  errors of `@standin/contracts`.
- `isConfigured` (from `utils/getConfig.ts`) is the only place that decides
  whether the login is on. The providers route and both GitHub routes use it.
- Layout: `consts/` (variable names, GitHub urls, headers, timeouts, avatar
  host and limits), `utils/` (config reader, request helper with timeout,
  headers, PKCE challenge, avatar url check), `operations/` (one file per
  action), `schemas/` (zod schemas of the GitHub response bodies, private to
  the provider, one `*.schema.ts` each) and `types/`. Tests sit in
  `__tests__` next to what they test.
- `getAuthUrl` builds the authorize url with `client_id`, `redirect_uri`,
  `state`, `code_challenge` and `code_challenge_method=S256`. `exchangeCode`
  trades the code (with the PKCE verifier) for a token. `getProfile` reads
  `GET /user`. `getVerifiedEmail` reads `GET /user/emails` and returns only the
  primary e-mail that is verified. All calls use `fetch` with a timeout and no
  redirect.
- `downloadAvatar` downloads the photo only from `https` on
  `avatars.githubusercontent.com` with `?s=256`, with a size limit and a short
  timeout. A redirect is followed by hand and only to the same host rule. It
  returns the bytes or null and never throws.

### The API (`apps/api/src/features/auth/github`)

- Routes (public): `GET /auth/providers`, `GET /auth/github` and
  `GET /auth/github/callback`, one controller file each. They answer 404 when
  the provider is not configured.
- The start route makes a random `state` and a PKCE verifier, keeps both in a
  10 minute httpOnly cookie (`oauth_github`, `utils/oauthStateCookie.ts`) and
  redirects to the url from `GithubProvider.getAuthUrl`. The callback compares
  the `state` with the cookie in constant time, clears the cookie, and calls
  the provider. `resolveUser` asks the provider for the e-mail only when it is
  needed, then uses `UserService.findByIdentity`, `linkIdentity` and
  `createFromIdentity`. Only `createFromIdentity` gives a random avatar.
- `importGithubProfilePicture` calls `GithubProvider.downloadAvatar`, then the
  same `buildProfilePictureAction` as an upload, then
  `UserService.updateProfilePicture`. Any failure is logged and the person signs
  in without a photo.
- Every failure sends the browser to `FRONTEND_URL` with `?error=<code>`. The
  codes are fixed in `OAUTH_ERROR_CODES` (`packages/contracts/src/auth`) and the
  message of GitHub is never forwarded: `oauth_state_invalid`,
  `oauth_access_denied`, `github_email_unverified`, `oauth_exchange_failed` and
  `oauth_sign_in_failed`. The login page shows the message for each one.
- Tables: `users.password` is nullable, and `user_identities` holds
  `provider`, `provider_user_id` (the numeric GitHub id as text),
  `provider_login` (informative) with a unique index on
  `(provider, provider_user_id)`. If two requests of the same new account race,
  the unique index refuses one of them and it signs in as the winner.
  `UserService.isValid` refuses a person with no password without running
  bcrypt.

## Future GitHub integration

Not built. The same App is meant to serve it, so nothing here closes the door.

- **Install per organization:** the owner installs the App on a GitHub account
  or organization and comes back through the **Setup URL**. A
  `github_installations` table would keep the installation id, the Stand!N
  organization and the GitHub account. The return must prove it is the owner
  (a signed `state`, or "Request user authorization during installation").
- **Webhooks:** one endpoint. Validate `X-Hub-Signature-256` over the raw body
  with `GITHUB_WEBHOOK_SECRET` (the route needs `express.raw` before the global
  JSON parser) and make it idempotent by `X-GitHub-Delivery`.
- **Who sent the event:** `sender.id` of the payload matches
  `user_identities.provider_user_id`. That is why the numeric id is stored.
- **Which organization:** `installation.id` matches `github_installations`.
- **Particles:** a `pull_request` event (`opened`, or `closed` with `merged`)
  becomes a socket emit to the room of the space, and the web draws a particle
  on the author's avatar. Webhooks are enough for that, the private key of the
  App is only needed if the API of GitHub is ever called.
- **Development:** a public tunnel (smee.io or ngrok) so GitHub reaches the
  webhook.
- **Open question:** with several spaces in one organization, does the particle
  show in all of them or does each space pick its repositories?
