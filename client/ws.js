window.Empire = window.Empire || {};

window.Empire.WS = (() => {
  let socket = null;

  function init() {
    // Connect later after login
  }

  function connect() {
    if (!window.Empire.token) return;
    const url = `ws://localhost:3000?token=${window.Empire.token}`;
    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      subscribeMap();
    });

    socket.addEventListener("message", (event) => {
      let payload = null;
      try {
        payload = JSON.parse(event.data);
      } catch (err) {
        return;
      }

      if (payload.type === "map:update") {
        window.Empire.Map.applyUpdate(payload.data);
      }
    });
  }

  function subscribeMap() {
    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify({ type: "map:subscribe" }));
    }
  }

  return { init, connect };
})();
