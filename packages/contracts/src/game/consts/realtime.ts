// How far, in world px, a person is told about the others. It has to cover what
// the camera shows at its smallest zoom on a large screen (about 2.9k px from
// the avatar to the corner), so nobody on screen is ever missing. Past it the
// server sends nothing about that person.
export const SPACE_AOI_RADIUS_PX = 3000;

// A person already known stays known until they are this much further than
// the radius, so someone standing on the border does not flicker in and out.
export const SPACE_AOI_EXIT_MARGIN_PX = 200;

// How far an emote or a nearby message travels. It is above the widest reach
// either one has on the client (the emote radius and the nearby radius at its
// maximum), which still decides by itself whether to show it.
export const SPACE_EVENT_RADIUS_PX = 640;

// How often the server sends the positions that changed, for each space.
export const SPACE_TICK_MS = 100;

// A position past this is not a position of any map. Keeps a client from
// sending numbers that break the grid of the server.
export const SPACE_MAX_COORDINATE_PX = 100_000;

// What the connection that lives for the whole signed-in session says about
// itself in the handshake, so the server sends it the app notifications.
export const SOCKET_APP_CHANNEL = "app";
