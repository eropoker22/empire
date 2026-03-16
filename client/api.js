window.Empire = window.Empire || {};

window.Empire.API = (() => {
  const baseUrl = "http://localhost:3000";

  function init() {
    if (window.Empire.token) {
      refreshRound();
    }
  }

  async function login(username, password) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  }

  async function register(username, gangName, password) {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, gangName, password })
    });
    return res.json();
  }

  async function getDistricts() {
    const res = await fetch(`${baseUrl}/districts`, {
      headers: authHeaders()
    });
    return res.json();
  }

  async function getProfile() {
    const res = await fetch(`${baseUrl}/players/me`, {
      headers: authHeaders()
    });
    return res.json();
  }

  async function setStructure(structure) {
    const res = await fetch(`${baseUrl}/players/structure`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ structure })
    });
    return res.json();
  }

  async function getEconomy() {
    const res = await fetch(`${baseUrl}/economy/status`, {
      headers: authHeaders()
    });
    return res.json();
  }

  async function attackDistrict(districtId) {
    const res = await fetch(`${baseUrl}/combat/attack`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ districtId })
    });
    return res.json();
  }

  async function refreshRound() {
    const res = await fetch(`${baseUrl}/rounds/status`, {
      headers: authHeaders()
    });
    const data = await res.json();
    window.Empire.UI.updateRound(data);
  }

  function authHeaders() {
    return window.Empire.token
      ? { Authorization: `Bearer ${window.Empire.token}` }
      : {};
  }

  return {
    init,
    login,
    register,
    getDistricts,
    getProfile,
    setStructure,
    getEconomy,
    attackDistrict,
    refreshRound
  };
})();
