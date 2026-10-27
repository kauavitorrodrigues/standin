# Real-time and media guide

How people see each other, talk and chat inside a space. How many people it
holds and what it costs are in [performance.md](performance.md).

## Real-time presence

Teammates in the same space see each other move, emote and talk in real time over Socket.IO. The server relays positions, emotes, nearby messages and typing, and decides who hears what: only people in range, and only people in the same private room.

How a position travels:

1. The browser sends its position when it changes, at most every 80 ms.
2. The server collects the changes and sends each person one batch at a fixed tick, with only the people inside their area of interest.
3. A person who enters or leaves view is announced separately, so the avatar appears and disappears at the right time.

The server keeps who is inside each space in memory, so joining reads only the person who joins. Every connection is rate limited per event. The same socket carries the editor lock, the "map published" notices, and the room events (open, lock, join request, crossing a door). The numbers behind this (tick, areas, caches and limits) are in the [performance guide](performance.md).

## Proximity voice chat

Each user's avatar carries a proximity radius; when two avatars in the same space come within range, the game scene unlocks a live P2P voice channel between them over a WebRTC mesh signaled through the server. Move apart and the channel closes. No SFU, no manual "join call" step. Inside a room, communication is limited to the people in that room.

## Proximity camera and screen sharing

Camera and screen share ride the same mesh as voice, so there is no media server yet. What is sent is decided per peer, on every position update: a peer inside the enter radius receives your audio and video, and one beyond the (slightly larger) exit radius stops receiving it, so standing at the edge does not flicker. At most four peers receive your video at once, and the bitrate per receiver shrinks as more of them are watching. Someone out of range receives no media at all, not just a lowered volume.

Because each sender uploads its video once per receiver, this mesh suits a small group sharing media at once. How far it goes, and what a media server would change, is in [docs/performance.md](docs/performance.md). The camera starts off and is opened only when you turn it on.

## Chat (spaces and DMs)

Every space has one standing `SPACE` conversation shared by all of that space's members, for talking without being in proximity range. On top of that, any two members of the same organization can open a `DIRECT` conversation with each other. Both support text and file-attachment messages, editing, reactions, threads and read receipts, and both are scoped to the organization.
