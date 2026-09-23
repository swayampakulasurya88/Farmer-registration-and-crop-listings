// utils/bus.js
// Tiny realtime event bus built on Server-Sent Events (SSE).
//
// Every open browser tab keeps an EventSource open on GET /events. Whenever
// the application data changes (a listing is added/updated/sold, an interest
// or favorite is created, an admin moderates something...), the routes call
// broadcast() and every connected page swaps its <main> content silently —
// no page refresh, real Firebase-like realtime sync.

const clients = new Set();

// Register a connected SSE response.
function addClient(res) {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

function removeClient(res) {
  clients.delete(res);
}

function clientCount() {
  return clients.size;
}

// Push a `sync` event to every connected tab.
//   broadcast('listings', { listingId: 'abc' })
function broadcast(channel, data = {}) {
  const payload = JSON.stringify({
    type: 'sync',
    channel,
    at: Date.now(),
    clients: clients.size,
    ...data,
  });
  for (const res of clients) {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      clients.delete(res);
    }
  }
}

module.exports = { addClient, removeClient, broadcast, clientCount };