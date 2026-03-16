window.Empire = window.Empire || {};

window.Empire.UI = (() => {
  const weaponCatalog = [
    "Baseballová pálka",
    "Pistole",
    "Samopal (SMG)",
    "Útočná puška",
    "Explozivní nálož"
  ];

  const defenseCatalog = [
    "Neprůstřelná vesta",
    "Ocelové barikády",
    "Bezpečnostní kamery",
    "Automatické kulometné stanoviště",
    "EMP obranný modul",
    "Kulometná věž",
    "Raketová věž"
  ];

  let cachedProfile = null;
  let cachedEconomy = null;

  function init() {
    bindActions();
  }

  function bindActions() {
    document.getElementById("attack-btn").addEventListener("click", async () => {
      if (!window.Empire.token) {
        pushEvent("Pro útok je nutné přihlášení.");
        return;
      }
      if (!window.Empire.selectedDistrict) return;
      const result = await window.Empire.API.attackDistrict(
        window.Empire.selectedDistrict.id
      );
      if (result && result.message) {
        pushEvent(result.message);
      }
    });

    const raidBtn = document.getElementById("raid-btn");
    if (raidBtn) {
      raidBtn.addEventListener("click", () => {
        if (!window.Empire.token) {
          pushEvent("Pro vykrádání je nutné přihlášení.");
          return;
        }
        if (!window.Empire.selectedDistrict) return;
        pushEvent("Vykrádání distriktu bylo zahájeno.");
      });
    }

    const spyBtn = document.getElementById("spy-btn");
    if (spyBtn) {
      spyBtn.addEventListener("click", () => {
        if (!window.Empire.token) {
          pushEvent("Pro špehování je nutné přihlášení.");
          return;
        }
        if (!window.Empire.selectedDistrict) return;
        pushEvent("Špehování distriktu bylo zahájeno.");
      });
    }

    document.getElementById("refresh-round").addEventListener("click", () => {
      window.Empire.API.refreshRound();
    });

    const navProfile = document.getElementById("nav-profile");
    if (navProfile) {
      navProfile.addEventListener("click", () => {
        showProfileModal();
      });
    }

    const navSettings = document.getElementById("nav-settings");
    if (navSettings) {
      navSettings.addEventListener("click", () => {
        showSettingsModal();
      });
    }

    const navLogout = document.getElementById("nav-logout");
    if (navLogout) {
      navLogout.addEventListener("click", () => {
        localStorage.removeItem("empire_token");
        localStorage.removeItem("empire_structure");
        window.location.href = "login.html";
      });
    }
  }

  async function hydrateAfterAuth() {
    const profile = await window.Empire.API.getProfile();
    const economy = await window.Empire.API.getEconomy();
    const districtData = await window.Empire.API.getDistricts();

    window.Empire.player = profile;
    updateProfile(profile);
    updateEconomy(economy);

    if (districtData && districtData.districts) {
      window.Empire.Map.setDistricts(districtData.districts);
    }

    window.Empire.WS.connect();
  }

  function updateProfile(profile) {
    cachedProfile = profile;
    document.getElementById("profile-gang").textContent = profile.gangName || "-";
    document.getElementById("profile-districts").textContent = profile.districts || 0;
    document.getElementById("profile-alliance").textContent = profile.alliance || "Žádná";
    const structure = document.getElementById("profile-structure");
    const statStructure = document.getElementById("stat-structure");
    if (structure) {
      structure.textContent = profile.structure || localStorage.getItem("empire_structure") || "-";
    }
    if (statStructure) {
      statStructure.textContent = profile.structure || localStorage.getItem("empire_structure") || "-";
    }
    hydrateProfileModal(profile);
    updateWeaponsPopover();
    updateDefensePopover();
  }

  function setGuestMode(isGuest) {
    const banner = document.getElementById("guest-banner");
    if (!banner) return;
    banner.classList.toggle("hidden", !isGuest);
  }

  function initProfileModal() {
    const root = document.getElementById("profile-modal");
    const backdrop = document.getElementById("profile-modal-backdrop");
    const closeBtn = document.getElementById("profile-modal-close");
    if (!root) return;
    if (backdrop) backdrop.addEventListener("click", () => root.classList.add("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => root.classList.add("hidden"));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") root.classList.add("hidden");
    });
  }

  function initSettingsModal() {
    const root = document.getElementById("settings-modal");
    const backdrop = document.getElementById("settings-modal-backdrop");
    const closeBtn = document.getElementById("settings-modal-close");
    if (!root) return;
    if (backdrop) backdrop.addEventListener("click", () => root.classList.add("hidden"));
    if (closeBtn) closeBtn.addEventListener("click", () => root.classList.add("hidden"));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") root.classList.add("hidden");
    });
  }

  function hydrateProfileModal(profile) {
    if (!profile) return;
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    const avatar = localStorage.getItem("empire_avatar");
    const avatarImg = document.getElementById("profile-avatar");
    if (avatarImg) {
      if (avatar) {
        avatarImg.src = avatar;
        avatarImg.classList.remove("hidden");
      } else {
        avatarImg.removeAttribute("src");
        avatarImg.classList.add("hidden");
      }
    }
    setText("profile-modal-username", profile.username || "-");
    setText("profile-modal-gang", profile.gangName || "-");
    setText("profile-modal-structure", profile.structure || localStorage.getItem("empire_structure") || "-");
    setText("profile-modal-alliance", profile.alliance || "Žádná");
    setText("profile-modal-districts", profile.districts || 0);
    setText("profile-modal-cash", `$${profile.money || 0}`);
    setText("profile-modal-drugs", profile.drugs || 0);
    setText("profile-modal-garage", profile.garage || 0);
    setText("profile-modal-weapons", profile.weapons || 0);
    setText("profile-modal-defense", profile.defense || 0);
  }

  function showProfileModal() {
    const root = document.getElementById("profile-modal");
    if (!root) return;
    root.classList.remove("hidden");
  }

  function showSettingsModal() {
    const root = document.getElementById("settings-modal");
    if (!root) return;
    root.classList.remove("hidden");
  }

  function updateEconomy(economy) {
    cachedEconomy = economy;
    document.getElementById("stat-cash").textContent = `$${economy.balance || 0}`;
    document.getElementById("stat-influence").textContent = economy.influence || 0;
    const drugs = document.getElementById("stat-drugs");
    const garage = document.getElementById("stat-garage");
    const weapons = document.getElementById("stat-weapons");
    const defense = document.getElementById("stat-defense");
    if (drugs) drugs.textContent = economy.drugs || 0;
    if (garage) garage.textContent = economy.garage || 0;
    if (weapons) weapons.textContent = economy.weapons || 0;
    if (defense) defense.textContent = economy.defense || 0;
    updateWeaponsPopover();
    updateDefensePopover();
  }

  function resolveWeaponCounts() {
    const fromProfile = cachedProfile?.weaponsDetail;
    const fromEconomy = cachedEconomy?.weaponsDetail;
    const fromStorage = (() => {
      try {
        return JSON.parse(localStorage.getItem("empire_weapons_detail") || "null");
      } catch {
        return null;
      }
    })();
    return fromProfile || fromEconomy || fromStorage || {
      "Baseballová pálka": 7,
      Pistole: 14,
      "Samopal (SMG)": 6,
      "Útočná puška": 3,
      "Explozivní nálož": 2,
      "Neprůstřelná vesta": 9,
      "Ocelové barikády": 4,
      "Bezpečnostní kamery": 8,
      "Automatické kulometné stanoviště": 1,
      "EMP obranný modul": 1,
      "Kulometná věž": 2,
      "Raketová věž": 1
    };
  }

  function updateWeaponsPopover() {
    const list = document.getElementById("weapons-popover-list");
    if (!list) return;
    const counts = resolveWeaponCounts();
    list.innerHTML = weaponCatalog
      .map((name) => {
        const key = Object.keys(counts).find((k) => k.toLowerCase() === name.toLowerCase());
        const value = key ? counts[key] : 0;
        return `
          <div class="stat__popover-item">
            <span>${name}</span>
            <strong>${value}</strong>
          </div>
        `;
      })
      .join("");
  }

  function resolveDefenseCounts() {
    const fromProfile = cachedProfile?.defenseDetail;
    const fromEconomy = cachedEconomy?.defenseDetail;
    const fromStorage = (() => {
      try {
        return JSON.parse(localStorage.getItem("empire_defense_detail") || "null");
      } catch {
        return null;
      }
    })();
    return fromProfile || fromEconomy || fromStorage || {
      "Neprůstřelná vesta": 9,
      "Ocelové barikády": 4,
      "Bezpečnostní kamery": 8,
      "Automatické kulometné stanoviště": 1,
      "EMP obranný modul": 1,
      "Kulometná věž": 2,
      "Raketová věž": 1
    };
  }

  function updateDefensePopover() {
    const list = document.getElementById("defense-popover-list");
    if (!list) return;
    const counts = resolveDefenseCounts();
    list.innerHTML = defenseCatalog
      .map((name) => {
        const key = Object.keys(counts).find((k) => k.toLowerCase() === name.toLowerCase());
        const value = key ? counts[key] : 0;
        return `
          <div class="stat__popover-item">
            <span>${name}</span>
            <strong>${value}</strong>
          </div>
        `;
      })
      .join("");
  }

  function updateDistrict(district) {
    if (!district) return;
    const name = document.getElementById("district-name");
    if (!name) return;
    const displayName = district.name || `${district.type} #${district.id}`;
    document.getElementById("district-owner").textContent = district.owner || "Neobsazeno";
    document.getElementById("district-income").textContent = `$${district.income || 0}/hod`;
    document.getElementById("district-influence").textContent = district.influence || 0;
    name.textContent = displayName;
  }

  function updateRound(round) {
    if (!round) return;
    document.getElementById("round-ends").textContent = round.roundEndsAt || "-";
    document.getElementById("round-days").textContent =
      round.daysRemaining != null ? round.daysRemaining : "-";
  }

  function pushEvent(text) {
    const container = document.getElementById("event-items");
    if (!container) return;
    const div = document.createElement("div");
    div.className = "ticker__item";
    div.textContent = text;
    container.prepend(div);
  }

  return {
    init,
    hydrateAfterAuth,
    updateProfile,
    updateEconomy,
    updateDistrict,
    updateRound,
    pushEvent,
    setGuestMode,
    initProfileModal,
    initSettingsModal
  };
})();
