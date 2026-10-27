// Where the connection that lives for the whole signed-in session listens.
// The connection of a space is not in it, so what is meant for the app (chat)
// is sent once to the person instead of once per connection.
export const buildNotifyRoom = (userId: string): string => `notify:${userId}`;
