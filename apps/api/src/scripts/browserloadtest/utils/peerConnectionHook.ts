// Runs in the page before any script of the app. It keeps every
// RTCPeerConnection the app makes, so the harness can ask them for stats.
export const PEER_CONNECTION_HOOK = `
(() => {
    const Original = window.RTCPeerConnection;
    if (!Original) return;
    window.__peerConnections = [];
    window.RTCPeerConnection = function (...args) {
        const connection = new Original(...args);
        window.__peerConnections.push(connection);
        return connection;
    };
    window.RTCPeerConnection.prototype = Original.prototype;
    Object.setPrototypeOf(window.RTCPeerConnection, Original);
})();
`;

// Evaluated in the page as text, so the build step of the script cannot
// inject helpers that do not exist there. Gives the stats of every open
// connection as plain entries.
export const COLLECT_STATS_SCRIPT = `
(async () => {
    const connections = (window.__peerConnections || []).filter(
        (connection) => connection.connectionState !== "closed"
    );
    const reports = await Promise.all(
        connections.map((connection) => connection.getStats())
    );
    return reports.flatMap((report) => Array.from(report.values()));
})()
`;
