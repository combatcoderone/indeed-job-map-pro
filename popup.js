const DEFAULTS = {
  center: "saint-laurent",
  radiusKm: 25,
  speed: "slow",
  enableRest: true,
  workMinutes: 2,
  restMinutes: 1,
  distanceMode: "driving_km",
  maxDriveMinutes: 30,
  keepRemote: true,
  autoStart: true,
  townsOnly: false,
  openInNewPage: true,
  loadMode: "page",
  maxAutoPages: 10
};

function sendToTab(action) {
  return new Promise(function (resolve) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs || !tabs.length) { resolve({ ok: false, reason: "no active tab" }); return; }
      chrome.tabs.sendMessage(tabs[0].id, { action: action }, function (response) {
        if (chrome.runtime.lastError) {
          resolve({ ok: false, reason: "Open an Indeed search page first, then try again." });
        } else {
          resolve(response || { ok: true });
        }
      });
    });
  });
}

function showStatus(text) {
  document.getElementById("status").textContent = text;
}

function loadSettings() {
  chrome.storage.sync.get(DEFAULTS, function (items) {
    document.getElementById("center").value = items.center || DEFAULTS.center;
    document.getElementById("radius").value = items.radiusKm || DEFAULTS.radiusKm;
    document.getElementById("radiusLabel").textContent = (items.radiusKm || DEFAULTS.radiusKm) + " km";
    document.getElementById("speed").value = items.speed || DEFAULTS.speed;
    document.getElementById("distanceMode").value = items.distanceMode || DEFAULTS.distanceMode;
    document.getElementById("maxDriveMinutes").value = items.maxDriveMinutes || DEFAULTS.maxDriveMinutes;
    document.getElementById("driveLabel").textContent = (items.maxDriveMinutes || DEFAULTS.maxDriveMinutes) + " min";
    document.getElementById("enableRest").checked = items.enableRest !== false;
    document.getElementById("workMinutes").value = items.workMinutes || DEFAULTS.workMinutes;
    document.getElementById("workLabel").textContent = (items.workMinutes || DEFAULTS.workMinutes) + " min";
    document.getElementById("restMinutes").value = (items.restMinutes == null ? DEFAULTS.restMinutes : items.restMinutes);
    document.getElementById("restLabel").textContent = (items.restMinutes == null ? DEFAULTS.restMinutes : items.restMinutes) + " min";
    document.getElementById("keepRemote").checked = items.keepRemote !== false;
    document.getElementById("autoStart").checked = items.autoStart !== false;
    document.getElementById("townsOnly").checked = items.townsOnly === true;
    document.getElementById("openInNewPage").value = items.openInNewPage === false ? "same" : "new";
    document.getElementById("loadMode").value = items.loadMode === "auto" ? "auto" : "page";
  });
}

function saveSettings() {
  const data = {
    center: document.getElementById("center").value,
    radiusKm: parseInt(document.getElementById("radius").value, 10),
    speed: document.getElementById("speed").value,
    distanceMode: document.getElementById("distanceMode").value,
    maxDriveMinutes: parseInt(document.getElementById("maxDriveMinutes").value, 10),
    enableRest: document.getElementById("enableRest").checked,
    workMinutes: parseInt(document.getElementById("workMinutes").value, 10),
    restMinutes: parseFloat(document.getElementById("restMinutes").value),
    keepRemote: document.getElementById("keepRemote").checked,
    autoStart: document.getElementById("autoStart").checked,
    townsOnly: document.getElementById("townsOnly").checked,
    openInNewPage: document.getElementById("openInNewPage").value === "new",
    loadMode: document.getElementById("loadMode").value === "auto" ? "auto" : "page",
    maxAutoPages: 10
  };
  document.getElementById("radiusLabel").textContent = data.radiusKm + " km";
  document.getElementById("workLabel").textContent = data.workMinutes + " min";
  document.getElementById("restLabel").textContent = data.restMinutes + " min";
  document.getElementById("driveLabel").textContent = data.maxDriveMinutes + " min";
  chrome.storage.sync.set(data, function () {
    sendToTab("settingsUpdated");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadSettings();
  ["center", "radius", "speed", "distanceMode", "maxDriveMinutes", "enableRest", "workMinutes", "restMinutes", "keepRemote", "autoStart", "townsOnly", "openInNewPage", "loadMode"].forEach(function (id) {
    const el = document.getElementById(id);
    el.addEventListener("change", saveSettings);
    el.addEventListener("input", saveSettings);
  });

  document.getElementById("loadFilter").addEventListener("click", async function () {
    showStatus("Loading all jobs to the end, then filtering. Slow mode rests 1 minute every 2 minutes if the load is long.");
    const r = await sendToTab("loadAllAndFilter");
    if (r && r.ok) showStatus("Done. Kept " + r.kept + " of " + r.total + " jobs.");
    else if (r && r.reason === "stopped by captcha") showStatus("Stopped. Indeed showed a verification page. Wait a while before you try again.");
    else if (r && r.reason === "stopped by user") showStatus("Stopped by you.");
    else showStatus((r && r.reason) || "Could not reach the Indeed page. Open an Indeed search page first.");
  });
  document.getElementById("showCurrentJob").addEventListener("click", async function () {
    showStatus("Showing the open job on the map.");
    const r = await sendToTab("showCurrentJobOnMap");
    if (r && r.ok) showStatus("Showing on the map: " + r.title);
    else showStatus("Could not show that job. Click the job in the list first, then try again.");
  });
  document.getElementById("openMap").addEventListener("click", async function () {
    showStatus("Opening the map. Load all jobs first if the map looks empty.");
    await sendToTab("showMap");
  });
  document.getElementById("nextPage").addEventListener("click", async function () {
    showStatus("Going to next page.");
    const r = await sendToTab("nextPage");
    if (r && !r.ok) showStatus(r.reason || "No next page was found.");
  });
  document.getElementById("prevPage").addEventListener("click", async function () {
    showStatus("Going to previous page.");
    const r = await sendToTab("prevPage");
    if (r && !r.ok) showStatus(r.reason || "You are already on page 1.");
  });
  document.getElementById("pauseLoad").addEventListener("click", async function () {
    await sendToTab("pauseLoad");
    showStatus("Paused. Click Resume to continue from the same place. Nothing is lost.");
  });
  document.getElementById("resumeLoad").addEventListener("click", async function () {
    await sendToTab("resumeLoad");
    showStatus("Resumed. Continuing from where it stopped.");
  });
  document.getElementById("stopLoad").addEventListener("click", async function () {
    await sendToTab("stopLoad");
    showStatus("Stop requested.");
  });
  document.getElementById("showAll").addEventListener("click", async function () {
    await sendToTab("showAll");
    showStatus("Showing all jobs again.");
  });
  document.getElementById("resetAll").addEventListener("click", async function () {
    await sendToTab("resetAll");
    showStatus("All results reset. All jobs are shown again, the map is cleared, and automated mode is stopped. Your center, radius and other settings are kept.");
  });
  document.getElementById("goTop").addEventListener("click", function () { sendToTab("goTop"); });
  document.getElementById("goBottom").addEventListener("click", function () { sendToTab("goBottom"); });

  sendToTab("getStatus").then(function (r) {
    if (r && r.ok) {
      showStatus("Page " + r.page + ". Loaded " + r.total + " jobs. Next page: " + (r.hasNext ? "yes" : "no") + ". Previous page: " + (r.hasPrev ? "yes" : "no") + ". Speed: " + r.speed + ".");
    }
  });
});
