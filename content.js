// Indeed Job Map Pro, version 1.17.0
// What it does:
// 1. Auto scrolls the left job list to the end, in small steps, so Indeed loads every job.
// 2. Keeps only jobs within the chosen radius from the chosen center, anywhere in Canada.
// 3. Rest time: by default 1 minute rest every 2 minutes of work, adjustable in the popup.
// 4. Speeds researched for this version:
//    Slow: 1.6 to 2.5 sec per step, 60 percent of the viewport per scroll, safest.
//    Normal: 0.9 to 1.4 sec per step, 85 percent of the viewport per scroll.
//    Fast: 0.5 to 0.8 sec per step, full viewport per scroll, higher risk of a check.
// 5. Stops by itself if Indeed shows a CAPTCHA or verify you are human page.
// 6. Adds Next page, Previous page, Top, Bottom, Stop and Show all controls.
// Indeed cards usually show only a city, not an exact address, so distance is
// measured from the town center. Jobs that only say Montreal, QC use downtown Montreal.

(function () {
  const CENTERS = {
    "saint-laurent": { name: "Saint-Laurent", lat: 45.5130, lng: -73.6650 },
    "pointe-claire": { name: "Pointe-Claire", lat: 45.4500, lng: -73.8100 },
    "montreal-downtown": { name: "Montreal downtown", lat: 45.5017, lng: -73.5673 },
    "kirkland": { name: "Kirkland", lat: 45.4500, lng: -73.8500 },
    "dorval": { name: "Dorval", lat: 45.4500, lng: -73.7500 },
    "laval": { name: "Laval", lat: 45.6067, lng: -73.7125 },
    "longueuil": { name: "Longueuil", lat: 45.5312, lng: -73.5181 },
    "quebec-city": { name: "Quebec City", lat: 46.8139, lng: -71.2080 },
    "gatineau": { name: "Gatineau", lat: 45.4765, lng: -75.7013 },
    "sherbrooke": { name: "Sherbrooke", lat: 45.4000, lng: -71.9000 },
    "trois-rivieres": { name: "Trois-Rivieres", lat: 46.3500, lng: -72.5500 },
    "toronto": { name: "Toronto", lat: 43.6532, lng: -79.3832 },
    "ottawa": { name: "Ottawa", lat: 45.4215, lng: -75.6972 },
    "mississauga": { name: "Mississauga", lat: 43.5890, lng: -79.6441 },
    "hamilton": { name: "Hamilton", lat: 43.2557, lng: -79.8711 },
    "london": { name: "London", lat: 42.9849, lng: -81.2453 },
    "kitchener": { name: "Kitchener", lat: 43.4516, lng: -80.4925 },
    "windsor": { name: "Windsor", lat: 42.3149, lng: -83.0364 },
    "kingston": { name: "Kingston", lat: 44.2312, lng: -76.4860 },
    "vancouver": { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
    "victoria": { name: "Victoria", lat: 48.4284, lng: -123.3656 },
    "surrey": { name: "Surrey", lat: 49.1913, lng: -122.8490 },
    "kelowna": { name: "Kelowna", lat: 49.8880, lng: -119.4960 },
    "calgary": { name: "Calgary", lat: 51.0447, lng: -114.0719 },
    "edmonton": { name: "Edmonton", lat: 53.5461, lng: -113.4938 },
    "red-deer": { name: "Red Deer", lat: 52.2681, lng: -113.8112 },
    "winnipeg": { name: "Winnipeg", lat: 49.8951, lng: -97.1384 },
    "saskatoon": { name: "Saskatoon", lat: 52.1578, lng: -106.6702 },
    "regina": { name: "Regina", lat: 50.4452, lng: -104.6189 },
    "halifax": { name: "Halifax", lat: 44.6488, lng: -63.5752 },
    "moncton": { name: "Moncton", lat: 46.0878, lng: -64.7782 },
    "st-johns": { name: "St. John's", lat: 47.5615, lng: -52.7126 },
    "charlottetown": { name: "Charlottetown", lat: 46.2382, lng: -63.1311 },
    "fredericton": { name: "Fredericton", lat: 45.9636, lng: -66.6431 },
    "yellowknife": { name: "Yellowknife", lat: 62.4540, lng: -114.3718 },
    "whitehorse": { name: "Whitehorse", lat: 60.7217, lng: -135.0538 }
  };

  // Town centers across Canada. Coordinates are approximate town centers,
  // good enough for a radius filter in km. If a town is missing, the code
  // tries a free lookup for that town name in Canada and caches the result.
  const TOWN_COORDS = {
    "saint-laurent": { lat: 45.5130, lng: -73.6650 },
    "pointe-claire": { lat: 45.4500, lng: -73.8100 },
    "kirkland": { lat: 45.4500, lng: -73.8500 },
    "dollard-des-ormeaux": { lat: 45.4833, lng: -73.8333 },
    "dorval": { lat: 45.4500, lng: -73.7500 },
    "baie-durfe": { lat: 45.4167, lng: -73.9167 },
    "sainte-anne-de-bellevue": { lat: 45.4067, lng: -73.9500 },
    "montreal": { lat: 45.5017, lng: -73.5673 },
    "laval": { lat: 45.6067, lng: -73.7125 },
    "westmount": { lat: 45.4845, lng: -73.5970 },
    "verdun": { lat: 45.4600, lng: -73.5700 },
    "lasalle": { lat: 45.4333, lng: -73.6667 },
    "lachine": { lat: 45.4433, lng: -73.6667 },
    "boucherville": { lat: 45.6000, lng: -73.4667 },
    "longueuil": { lat: 45.5312, lng: -73.5181 },
    "brossard": { lat: 45.4500, lng: -73.4667 },
    "repentigny": { lat: 45.7333, lng: -73.4500 },
    "terrebonne": { lat: 45.7000, lng: -73.6333 },
    "blainville": { lat: 45.6667, lng: -73.8833 },
    "boisbriand": { lat: 45.6167, lng: -73.8333 },
    "saint-eustache": { lat: 45.5667, lng: -73.9000 },
    "vaudreuil-dorion": { lat: 45.4000, lng: -74.0333 },
    "beaconsfield": { lat: 45.4333, lng: -73.8333 },
    "pierrefonds": { lat: 45.4667, lng: -73.8500 },
    "quebec city": { lat: 46.8139, lng: -71.2080 },
    "quebec": { lat: 46.8139, lng: -71.2080 },
    "gatineau": { lat: 45.4765, lng: -75.7013 },
    "sherbrooke": { lat: 45.4000, lng: -71.9000 },
    "trois-rivieres": { lat: 46.3500, lng: -72.5500 },
    "saguenay": { lat: 48.4167, lng: -71.0667 },
    "levis": { lat: 46.8000, lng: -71.1833 },
    "saint-jean-sur-richelieu": { lat: 45.3167, lng: -73.2667 },
    "drummondville": { lat: 45.8833, lng: -72.4833 },
    "granby": { lat: 45.4000, lng: -72.7333 },
    "saint-hyacinthe": { lat: 45.6333, lng: -72.9500 },
    "shawinigan": { lat: 46.5667, lng: -72.7500 },
    "rimouski": { lat: 48.4500, lng: -68.5333 },
    "toronto": { lat: 43.6532, lng: -79.3832 },
    "ottawa": { lat: 45.4215, lng: -75.6972 },
    "mississauga": { lat: 43.5890, lng: -79.6441 },
    "brampton": { lat: 43.7315, lng: -79.7624 },
    "hamilton": { lat: 43.2557, lng: -79.8711 },
    "london": { lat: 42.9849, lng: -81.2453 },
    "markham": { lat: 43.8561, lng: -79.3370 },
    "vaughan": { lat: 43.8361, lng: -79.4983 },
    "kitchener": { lat: 43.4516, lng: -80.4925 },
    "windsor": { lat: 42.3149, lng: -83.0364 },
    "oshawa": { lat: 43.8971, lng: -78.8658 },
    "burlington": { lat: 43.3255, lng: -79.7990 },
    "barrie": { lat: 44.3894, lng: -79.6903 },
    "guelph": { lat: 43.5448, lng: -80.2482 },
    "cambridge": { lat: 43.3616, lng: -80.3144 },
    "waterloo": { lat: 43.4643, lng: -80.5204 },
    "kingston": { lat: 44.2312, lng: -76.4860 },
    "thunder bay": { lat: 48.3809, lng: -89.2477 },
    "sudbury": { lat: 46.4917, lng: -80.9930 },
    "sault ste marie": { lat: 46.5219, lng: -84.3461 },
    "peterborough": { lat: 44.3091, lng: -78.3197 },
    "st catharines": { lat: 43.1594, lng: -79.2469 },
    "niagara falls": { lat: 43.0896, lng: -79.0849 },
    "vancouver": { lat: 49.2827, lng: -123.1207 },
    "surrey": { lat: 49.1913, lng: -122.8490 },
    "burnaby": { lat: 49.2488, lng: -122.9805 },
    "richmond": { lat: 49.1666, lng: -123.1336 },
    "victoria": { lat: 48.4284, lng: -123.3656 },
    "kelowna": { lat: 49.8880, lng: -119.4960 },
    "abbotsford": { lat: 49.0500, lng: -122.3167 },
    "coquitlam": { lat: 49.2838, lng: -122.7932 },
    "langley": { lat: 49.1042, lng: -122.6604 },
    "nanaimo": { lat: 49.1659, lng: -123.9401 },
    "kamloops": { lat: 50.6745, lng: -120.3273 },
    "prince george": { lat: 53.9171, lng: -122.7497 },
    "chilliwack": { lat: 49.1579, lng: -121.9515 },
    "calgary": { lat: 51.0447, lng: -114.0719 },
    "edmonton": { lat: 53.5461, lng: -113.4938 },
    "red deer": { lat: 52.2681, lng: -113.8112 },
    "lethbridge": { lat: 49.6956, lng: -112.8451 },
    "fort mcmurray": { lat: 56.7264, lng: -111.3810 },
    "medicine hat": { lat: 50.0405, lng: -110.6764 },
    "grande prairie": { lat: 55.1707, lng: -118.7946 },
    "winnipeg": { lat: 49.8951, lng: -97.1384 },
    "brandon": { lat: 49.8485, lng: -99.9501 },
    "saskatoon": { lat: 52.1578, lng: -106.6702 },
    "regina": { lat: 50.4452, lng: -104.6189 },
    "halifax": { lat: 44.6488, lng: -63.5752 },
    "moncton": { lat: 46.0878, lng: -64.7782 },
    "saint john": { lat: 45.2733, lng: -66.0633 },
    "fredericton": { lat: 45.9636, lng: -66.6431 },
    "charlottetown": { lat: 46.2382, lng: -63.1311 },
    "st johns": { lat: 47.5615, lng: -52.7126 },
    "sydney": { lat: 46.1368, lng: -60.1942 },
    "dartmouth": { lat: 44.6650, lng: -63.5670 },
    "yellowknife": { lat: 62.4540, lng: -114.3718 },
    "whitehorse": { lat: 60.7217, lng: -135.0538 },
    "iqaluit": { lat: 63.7467, lng: -68.5170 }
  };

  const ALLOWED_TOWNS = [
    "saint-laurent", "pointe-claire", "kirkland", "dollard-des-ormeaux",
    "dorval", "baie-durfe", "sainte-anne-de-bellevue"
  ];

  const SPEED_PROFILES = {
    slow: { label: "Slow", baseMs: 1600, jitterMs: 900, fraction: 0.6 },
    normal: { label: "Normal", baseMs: 950, jitterMs: 500, fraction: 0.85 },
    fast: { label: "Fast", baseMs: 550, jitterMs: 300, fraction: 1.0 }
  };

  const DEFAULTS = {
    center: "saint-laurent",
    radiusKm: 25,
    speed: "slow",
    enableRest: true,
    workMinutes: 2,
    restMinutes: 1,
    keepRemote: true,
    autoStart: true,
    townsOnly: false,
    distanceMode: "driving_km",
    maxDriveMinutes: 30,
    customLat: null,
    customLng: null,
    openInNewPage: true,
    loadMode: "page",
    maxAutoPages: 10
  };

  function isJobListPage() {
    const path = window.location.pathname || "";
    if (path.indexOf("/viewjob") !== -1) return false;
    if (path.indexOf("/rc/clk") !== -1) return false;
    if (path.indexOf("/jobs/view") !== -1) return false;
    if (path.indexOf("/company") !== -1) return false;
    if (path.indexOf("/cmp/") !== -1) return false;
    if (path.indexOf("/career") !== -1) return false;
    if (path.indexOf("/profile") !== -1) return false;
    if (path === "/jobs" || path === "/" || path.indexOf("/jobs") === 0) return true;
    return false;
  }

  function isJobDetailOpen() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("vjk")) return true;
    return !!document.querySelector("[data-testid='job-detail'], .jobsearch-JobComponent, [id*='jobDetail']");
  }

  let settings = Object.assign({}, DEFAULTS);
  let isLoading = false;
  let stopRequested = false;
  let isPaused = false;
  let driveCache = {};
  let mapObj = null;
  let mapCircle = null;
  let mapCenterMarker = null;
  let mapMarkers = [];
  let mapVisible = false;
  let mapFittedOnce = false;
  let jobLocations = [];
  let collectSeq = 0;
  let collectRunning = false;
  let lastPageUrl = window.location.href;
  let lastPageNumber = 0;
  let pageWatchStarted = false;
  let autoRunActive = false;
  let isFiltered = false;
  let lastCounts = { total: 0, kept: 0, hidden: 0 };
  let autoStartedForClick = false;
  let geoCache = {};

  function loadSettings() {
    return new Promise(function (resolve) {
      try {
        chrome.storage.sync.get(DEFAULTS, function (items) {
          settings = Object.assign({}, DEFAULTS, items || {});
          resolve(settings);
        });
      } catch (e) {
        resolve(settings);
      }
    });
  }

  function effectiveCenter() {
    if (settings.customLat !== null && settings.customLng !== null && !isNaN(settings.customLat) && !isNaN(settings.customLng)) {
      return { name: "Custom map center", lat: settings.customLat, lng: settings.customLng };
    }
    return CENTERS[settings.center] || CENTERS["saint-laurent"];
  }

  const CANADA_BOUNDS = [[41.0, -141.0], [84.0, -52.0]];
  function isInCanada(lat, lng) {
    return lat >= 41.0 && lat <= 84.0 && lng >= -141.0 && lng <= -52.0;
  }
  function isGenericPlace(text) {
    const n = (text || "").toLowerCase().trim();
    return n === "" || n === "remote" || n === "canada" || n === "remote in canada" || n === "remote, canada" || n === "hybrid" || n === "work from home";
  }

  function getJobUrl(card) {
    if (!card) return null;
    function jkToUrl(jk) {
      return "https://ca.indeed.com/viewjob?jk=" + jk;
    }
    function jkFromHref(href) {
      if (!href) return null;
      const m = href.match(/[?&]jk=([A-Za-z0-9]+)/);
      return m ? m[1] : null;
    }
    // 1. The job key on the card itself. This is the exact job, not the company link.
    const jkSelf = card.getAttribute ? card.getAttribute("data-jk") : null;
    if (jkSelf) return jkToUrl(jkSelf);
    // 2. The title link, which carries data-jk. Check it before any other link.
    const titleLink = card.querySelector("a[data-jk]");
    if (titleLink) {
      const jk = titleLink.getAttribute("data-jk") || jkFromHref(titleLink.getAttribute("href"));
      if (jk) return jkToUrl(jk);
    }
    // 3. Any link in the card that carries a jk= parameter, in document order.
    const links = card.querySelectorAll("a[href*='jk=']");
    for (let i = 0; i < links.length; i++) {
      const jk = jkFromHref(links[i].getAttribute("href"));
      if (jk) return jkToUrl(jk);
    }
    // 4. A direct viewjob link only, never a generic first link, a company link, or a save link.
    const viewLink = card.querySelector("a[href*='/viewjob']");
    if (viewLink && viewLink.getAttribute("href")) {
      const href = viewLink.getAttribute("href");
      return href.indexOf("http") === 0 ? href : "https://ca.indeed.com" + href;
    }
    return null;
  }

  function openJob(job) {
    const card = job ? job.card : null;
    const url = (job && job.url) || getJobUrl(card);
    if (!url) { setStatus("Could not find the link for this job. Try opening it from the list instead."); return false; }
    if (settings.openInNewPage !== false) {
      window.open(url, "_blank");
      setStatus("Opened job in a new tab: " + (job ? job.title : ""));
    } else {
      if (card) {
        const titleLink = card.querySelector("a[data-jk]") || card;
        try { titleLink.click(); } catch (e) {}
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.location.href = url;
      }
      setStatus("Opened job in this page: " + (job ? job.title : ""));
    }
    return true;
  }

  function saveSettingsPatch(patch) {
    try {
      chrome.storage.sync.set(patch, function () { Object.assign(settings, patch); });
    } catch (e) {}
  }

  function norm(s) {
    // Strip accents first: "Montreal" must match "Montreal", "Baie-D'Urfe" must
    // match "baie-durfe". Without this, townCoordsFor missed accented towns.
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/['\u2019]/g, "").replace(/[-.]/g, " ").replace(/\s+/g, " ").trim();
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const r = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * r * Math.asin(Math.sqrt(a));
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function waitWhilePaused() {
    while (isPaused && !stopRequested) {
      setStatus("Paused. Click Resume to continue from the same place. Nothing is lost.");
      await sleep(1000);
    }
  }

  function parseIndeedCommute(text) {
    const m = (text || "").match(/(\d+)\s*(?:-|\s)?minute commute|(\d+)\s*min\b/i);
    if (!m) return null;
    const v = parseInt(m[1] || m[2], 10);
    return isNaN(v) ? null : v;
  }

  function getDetailAddress() {
    const detail = document.querySelector("[data-testid='job-detail'], .jobsearch-JobComponent");
    if (!detail) return null;
    // Header area only: a postal code deep in the job description, or on
    // another job, is not this job's address.
    const text = (detail.innerText || "").slice(0, 1500);
    const postal = text.match(/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d\b/i);
    if (!postal) return null;
    const idx = text.indexOf(postal[0]);
    const start = Math.max(0, idx - 80);
    const snippet = text.slice(start, idx + postal[0].length).replace(/\s+/g, " ").trim();
    return snippet;
  }

  async function geocodeAddress(address) {
    if (isGenericPlace(address)) return null;
    const key = "addr:" + address.toLowerCase().trim();
    if (geoCache[key] !== undefined) return geoCache[key];
    try {
      const q = encodeURIComponent(address + ", Canada");
      const res = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + q, { headers: { "Accept": "application/json" } });
      const data = await res.json();
      if (data && data.length) {
        const point = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        if (!isInCanada(point.lat, point.lng)) { geoCache[key] = null; return null; }
        geoCache[key] = point;
        return point;
      }
    } catch (e) {}
    geoCache[key] = null;
    return null;
  }

  async function getDriving(center, coords) {
    const key = center.lat.toFixed(3) + "," + center.lng.toFixed(3) + ">" + coords.lat.toFixed(4) + "," + coords.lng.toFixed(4);
    if (driveCache[key]) return driveCache[key];
    try {
      const url = "https://router.project-osrm.org/route/v1/driving/" + center.lng + "," + center.lat + ";" + coords.lng + "," + coords.lat + "?overview=false";
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.code === "Ok" && data.routes && data.routes.length) {
        const r = data.routes[0];
        const out = { km: r.distance / 1000, minutes: r.duration / 60 };
        driveCache[key] = out;
        return out;
      }
    } catch (e) {}
    return null;
  }


  function randomDelayMs() {
    const p = SPEED_PROFILES[settings.speed] || SPEED_PROFILES.slow;
    return p.baseMs + Math.random() * p.jitterMs;
  }

  function textOf(el) {
    return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ").trim();
  }

  function hasCaptcha() {
    const bodyText = (document.body ? document.body.innerText : "").toLowerCase();
    return /verify you are human|captcha|unusual traffic|are you a robot|please verify|verify that you are not a robot/i.test(bodyText) ||
      !!document.querySelector("iframe[src*='captcha'], iframe[src*='recaptcha'], iframe[src*='hcaptcha']");
  }

  function findJobCards() {
    const seen = new Map();
    const selectors = [
      "[data-jk]",
      ".job_seen_beacon",
      "li[data-testid='job-card']",
      "div[data-testid='job-card']",
      "a[data-jk]"
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        const card = el.closest("[data-jk]") || el.closest(".job_seen_beacon") || el.closest("li") || el;
        const key = card.getAttribute("data-jk") || card.getAttribute("id") || textOf(card).slice(0, 120);
        if (key && textOf(card).length > 20 && !seen.has(key)) seen.set(key, card);
      });
    });
    return Array.from(seen.values());
  }

  function findScrollContainer() {
    const cards = findJobCards();
    if (cards.length) {
      let el = cards[0];
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 20) {
          return el;
        }
        el = el.parentElement;
      }
    }
    const candidates = [
      document.querySelector("#mosaic-jobResults"),
      document.querySelector("[data-testid='job-list']"),
      document.querySelector("main")
    ];
    for (const c of candidates) {
      if (c && c.scrollHeight > c.clientHeight + 20) return c;
    }
    return document.scrollingElement || document.documentElement;
  }

  function currentPageNumber() {
    const params = new URLSearchParams(window.location.search);
    const start = parseInt(params.get("start") || "0", 10);
    if (isNaN(start)) return 1;
    return Math.floor(start / 10) + 1;
  }

  function findPageLink(kind) {
    const links = Array.from(document.querySelectorAll("a, button"));
    const isNext = kind === "next";
    for (const el of links) {
      const label = (el.getAttribute("aria-label") || "").toLowerCase();
      const testId = (el.getAttribute("data-testid") || "").toLowerCase();
      const text = textOf(el).toLowerCase();
      if (isNext) {
        if (testId === "pagination-page-next" || label === "next" || label === "next page" || text === "next") return el;
      } else {
        if (testId === "pagination-page-previous" || label === "previous" || label === "previous page" || text === "previous") return el;
      }
    }
    return null;
  }

  function pageLinkIsDisabled(el) {
    if (!el) return true;
    if (el.disabled) return true;
    if (el.getAttribute("aria-disabled") === "true") return true;
    return false;
  }

  function goToPage(kind) {
    const link = findPageLink(kind);
    if (link && !pageLinkIsDisabled(link)) {
      setStatus("Going to " + kind + " page. The page will reload the list.");
      link.click();
      return { ok: true, method: "clicked Indeed button" };
    }
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const start = parseInt(params.get("start") || "0", 10) || 0;
    let nextStart = kind === "next" ? start + 10 : start - 10;
    if (kind === "prev" && start <= 0) {
      setStatus("You are already on page 1. There is no previous page.");
      return { ok: false, reason: "already on first page" };
    }
    if (nextStart < 0) nextStart = 0;
    params.set("start", String(nextStart));
    url.search = params.toString();
    setStatus("Going to " + kind + " page. The page will reload the list.");
    window.location.href = url.toString();
    return { ok: true, method: "changed start in URL" };
  }

  function hasNextPage() {
    const link = findPageLink("next");
    if (link && !pageLinkIsDisabled(link)) return true;
    return findJobCards().length >= 10;
  }

  function hasPrevPage() {
    const params = new URLSearchParams(window.location.search);
    const start = parseInt(params.get("start") || "0", 10) || 0;
    if (start > 0) return true;
    const link = findPageLink("prev");
    return !!(link && !pageLinkIsDisabled(link));
  }

  async function refreshMapForCurrentPage() {
    await collectJobLocations(settings.loadMode === "auto");
    plotJobMarkers();
    updateMapCount();
    updatePanelCounts();
    setStatus("Map updated for page " + currentPageNumber() + ". " + jobLocations.length + " jobs on the map.");
  }

  async function onPageChanged(source) {
    if (isLoading) return;
    const page = currentPageNumber();
    setStatus("Page changed to page " + page + " (" + source + "). Waiting for the list to finish loading, then updating the map.");
    // Wait until the list is stable, so we do not collect a half loaded page and plot wrong places.
    let lastCount = findJobCards().length;
    for (let i = 0; i < 10; i++) {
      await sleep(1000);
      if (isLoading) return;
      const count = findJobCards().length;
      if (count >= 5 && count === lastCount) break;
      lastCount = count;
    }
    if (findJobCards().length < 3) { setStatus("Page " + page + " list is still empty, map kept as it was. Click Refresh map when the list appears."); return; }
    if (settings.loadMode === "auto") {
      await collectJobLocations(true);
    } else {
      await collectJobLocations(false);
    }
    plotJobMarkers();
    updateMapCount();
    updatePanelCounts();
    setStatus("Map updated for page " + page + ". " + jobLocations.length + " jobs on the map.");
  }

  function startPageWatcher() {
    if (!isJobListPage()) return;
    if (pageWatchStarted) return;
    pageWatchStarted = true;
    lastPageUrl = window.location.href;
    lastPageNumber = currentPageNumber();
    setInterval(function () {
      if (isLoading) return;
      const url = window.location.href;
      const page = currentPageNumber();
      if (url !== lastPageUrl || page !== lastPageNumber) {
        lastPageUrl = url;
        lastPageNumber = page;
        onPageChanged("page " + page);
      }
    }, 1000);
    let debounce = null;
    try {
      const observer = new MutationObserver(function () {
        if (isLoading || !mapVisible) return;
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(function () {
          const page = currentPageNumber();
          if (page !== lastPageNumber) {
            lastPageNumber = page;
            lastPageUrl = window.location.href;
            onPageChanged("list changed");
          }
        }, 1200);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  function saveAutoRun(run) {
    try { chrome.storage.local.set({ irfAutoRun: run }); } catch (e) {}
  }

  async function loadAllPagesAuto() {
    if (!isJobListPage()) return { ok: false, reason: "not a job list page. Open an Indeed search list first." };
    if (isLoading) return { ok: false, reason: "already loading" };
    autoRunActive = true;
    stopRequested = false;
    const maxPages = settings.maxAutoPages || 10;
    let pagesDone = 0;
    try {
      const stored = await new Promise(function (res) { chrome.storage.local.get({ irfAutoRun: null }, function (items) { res(items && items.irfAutoRun); }); });
      if (stored && stored.active && stored.pagesDone) pagesDone = stored.pagesDone;
    } catch (e) {}
    saveAutoRun({ active: true, pagesDone: pagesDone, maxPages: maxPages, startedPage: currentPageNumber() });
    while (pagesDone < maxPages) {
      if (stopRequested) break;
      if (hasCaptcha()) { setStatus("Stopped. Indeed showed a verification page."); break; }
      setStatus("Automated mode: page " + currentPageNumber() + ", " + (pagesDone + 1) + " of " + maxPages + ". Loading all jobs on this page.");
      const r = await scrollToEnd();
      if (!r.ok) break;
      await filterJobs();
      await collectJobLocations(true);
      plotJobMarkers();
      updateMapCount();
      pagesDone++;
      saveAutoRun({ active: true, pagesDone: pagesDone, maxPages: maxPages, startedPage: currentPageNumber() });
      if (pagesDone >= maxPages) break;
      if (!hasNextPage()) break;
      setStatus("Automated mode: going to the next page, " + (pagesDone + 1) + " of " + maxPages + ".");
      goToPage("next");
      // Wait for the new page list to appear in this same page load, or for a reload.
      await sleep(3000);
      if (window.location.href === lastPageUrl && currentPageNumber() === lastPageNumber) {
        // Page did not change in this load, the reload path will continue via storage.
        break;
      }
      lastPageUrl = window.location.href;
      lastPageNumber = currentPageNumber();
    }
    autoRunActive = false;
    saveAutoRun({ active: false, pagesDone: pagesDone, maxPages: maxPages });
    setStatus("Automated mode done. " + pagesDone + " page(s) loaded. " + jobLocations.length + " jobs on the map. Click Show map to see them.");
    return { ok: true, total: jobLocations.length, pages: pagesDone };
  }

  function getLocationText(card) {
    const locEl = card.querySelector("[data-testid='text-location'], .companyLocation, [class*='companyLocation']");
    if (locEl && textOf(locEl)) return textOf(locEl);
    // No location element: return empty, never the whole card text. The whole
    // card holds the description, and any town named there is usually not
    // this job's city. collectJobLocations has its own card-top line scan.
    return "";
  }

  function isRemote(card) {
    return /remote/i.test(textOf(card));
  }

  function townCoordsFor(text) {
    if (!text) return null;
    const n = norm(text);
    if (!n) return null;
    // 1. Exact town before the comma: "Blainville, QC" -> Blainville.
    // This is the location field itself, not a mention in a description.
    const head = norm(String(text).split(",")[0].trim());
    if (head) {
      for (const town of Object.keys(TOWN_COORDS)) {
        if (norm(town) === head) return TOWN_COORDS[town];
      }
    }
    // 2. Longest whole-word match, so a longer town name wins over a shorter
    // one contained in it, and list order can no longer pick the wrong city.
    // Callers must pass location-only text, never a whole card or description.
    let best = null, bestLen = 0;
    for (const town of Object.keys(TOWN_COORDS)) {
      const tn = norm(town);
      if (!tn || tn.length <= bestLen) continue;
      const esc = tn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp("(^|[^a-z0-9])" + esc + "([^a-z0-9]|$)").test(n)) { best = TOWN_COORDS[town]; bestLen = tn.length; }
    }
    return best;
  }

  async function geocodeTown(text) {
    if (isGenericPlace(text)) return null;
    const key = norm(text);
    if (!key || geoCache[key] !== undefined) return geoCache[key] || null;
    try {
      const q = encodeURIComponent(text + ", Canada");
      const res = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + q, {
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      if (data && data.length) {
        const point = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        if (!isInCanada(point.lat, point.lng)) { geoCache[key] = null; return null; }
        geoCache[key] = point;
        return point;
      }
    } catch (e) {
      // No internet lookup, fall back to the built in list only.
    }
    geoCache[key] = null;
    return null;
  }

  async function shouldKeep(card) {
    const center = effectiveCenter();
    const locationText = getLocationText(card);
    const fullText = textOf(card);
    const remote = isRemote(card);
    if (remote && settings.keepRemote) return { keep: true, reason: "Remote" };
    if (remote && !settings.keepRemote) return { keep: false, reason: "Remote, and remote is off" };
    const indeedMinutes = parseIndeedCommute(fullText);
    // Exact address first: postal code in the card, or detail panel for the selected job.
    let coords = null;
    let source = "town center";
    const postalInCard = fullText.match(/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d\b/i);
    if (postalInCard) {
      coords = await geocodeAddress(postalInCard[0] + ", " + locationText);
      if (coords) source = "postal code " + postalInCard[0];
    }
    if (!coords) {
      const detailAddr = getDetailAddress();
      const cardTitle = textOf(card).slice(0, 60);
      const detailEl = document.querySelector("[data-testid='job-detail'], .jobsearch-JobComponent");
      const detailTitleEl = detailEl ? detailEl.querySelector("h1, h2, [data-testid='job-title']") : null;
      const detailTitle = detailTitleEl ? textOf(detailTitleEl) : "";
      if (detailAddr && detailTitle && cardTitle && detailTitle.indexOf(cardTitle.slice(0, 20)) !== -1) {
        coords = await geocodeAddress(detailAddr);
        if (coords) source = "exact address " + detailAddr;
      }
    }
    if (!coords) coords = townCoordsFor(locationText);
    if (!coords) {
      const short = locationText.split(",")[0].trim();
      coords = await geocodeTown(short);
      if (coords) source = "town lookup " + short;
    }
    if (!coords) {
      return { keep: !settings.townsOnly, reason: "Unknown place" };
    }
    const straightKm = haversineKm(center.lat, center.lng, coords.lat, coords.lng);
    const n = norm(locationText);
    const isAllowedTown = ALLOWED_TOWNS.some(function (x) { return n.indexOf(norm(x)) !== -1; });
    // If it is clearly far by straight line, hide it without a driving call.
    if (straightKm > settings.radiusKm * 1.8 && settings.distanceMode !== "driving_time") {
      return { keep: false, reason: straightKm.toFixed(1) + " km straight, " + source };
    }
    // Driving distance and time from OSRM, the better method.
    let driving = null;
    if (settings.distanceMode !== "straight_km") {
      driving = await getDriving(center, coords);
    }
    if (driving) {
      const label = straightKm.toFixed(1) + " km straight, " + driving.km.toFixed(1) + " km driving, " + Math.round(driving.minutes) + " min driving, " + source + (indeedMinutes ? ", Indeed says " + indeedMinutes + " min commute" : "");
      if (settings.distanceMode === "driving_time") {
        const limit = indeedMinutes !== null ? indeedMinutes : Math.round(driving.minutes);
        return { keep: limit <= settings.maxDriveMinutes, reason: label };
      }
      return { keep: driving.km <= settings.radiusKm, reason: label };
    }
    const label2 = straightKm.toFixed(1) + " km straight, " + source + (indeedMinutes ? ", Indeed says " + indeedMinutes + " min commute" : "");
    if (settings.distanceMode === "driving_time" && indeedMinutes !== null) {
      return { keep: indeedMinutes <= settings.maxDriveMinutes, reason: label2 };
    }
    if (straightKm <= settings.radiusKm) return { keep: true, reason: label2 };
    if (settings.townsOnly && isAllowedTown) return { keep: true, reason: "In West Island list, " + label2 };
    return { keep: false, reason: label2 };
  }

  function showDistanceLabel(card, result) {
    try {
      const old = card.querySelector(".irf-distance-label");
      if (old) old.remove();
      const el = document.createElement("div");
      el.className = "irf-distance-label";
      el.textContent = result.reason;
      el.style.cssText = "font-size:11px;color:#2557a7;background:#eef3fb;border-radius:6px;padding:3px 6px;margin-top:4px;line-height:1.4;";
      card.appendChild(el);
    } catch (e) {}
  }

  function setStatus(message) {
    const el = document.getElementById("irf-status");
    if (el) el.textContent = message;
  }

  function updatePanelCounts() {
    const total = findJobCards().length;
    const page = currentPageNumber();
    const speed = (SPEED_PROFILES[settings.speed] || SPEED_PROFILES.slow).label;
    const next = hasNextPage() ? "Next page: yes" : "Next page: no";
    const prev = hasPrevPage() ? "Previous page: yes" : "Previous page: no";
    if (isFiltered) {
      setStatus("Page " + page + ". Speed " + speed + ". Kept " + lastCounts.kept + " of " + lastCounts.total + " jobs. Hidden " + lastCounts.hidden + ". " + next + ". " + prev + ".");
    } else {
      setStatus("Page " + page + ". Speed " + speed + ". Loaded " + total + " jobs. " + next + ". " + prev + ". Click Load all to go to the end, then Filter.");
    }
  }

  async function takeRest(restMs) {
    const totalSec = Math.round(restMs / 1000);
    let remaining = totalSec;
    setStatus("Resting for " + totalSec + " seconds, to look human. Do not close the page. Resume in " + remaining + " sec.");
    while (remaining > 0) {
      if (stopRequested) return false;
      const resumeBtn = document.getElementById("irf-resume");
      if (resumeBtn && resumeBtn.dataset.skipRest === "1") { resumeBtn.dataset.skipRest = "0"; isPaused = false; return true; }
      if (isPaused) {
        setStatus("Paused during rest. Rest has " + remaining + " sec left. Click Resume to skip the rest and continue.");
        await sleep(1000);
        continue;
      }
      if (hasCaptcha()) return false;
      await sleep(5000);
      remaining -= 5;
      if (remaining > 0) setStatus("Resting. Resume in " + remaining + " sec. Click Resume to skip the rest.");
    }
    return true;
  }

  async function scrollToEnd() {
    if (!isJobListPage()) return { ok: false, reason: "not a job list page. Open an Indeed search list first." };
    if (isLoading) return { ok: false, reason: "already loading" };
    isLoading = true;
    stopRequested = false;
    const container = findScrollContainer();
    const isWindow = container === document.scrollingElement || container === document.documentElement || container === document.body;
    const profile = SPEED_PROFILES[settings.speed] || SPEED_PROFILES.slow;
    let lastCount = findJobCards().length;
    let noNewCount = 0;
    let steps = 0;
    let workStart = Date.now();
    let restCount = 0;
    const workMs = (settings.workMinutes || 2) * 60000;
    const restMs = (settings.restMinutes || 0) * 60000;
    setStatus("Loading all jobs. Speed " + profile.label + ". Scrolling to the end, please wait.");
    try {
      while (noNewCount < 5 && steps < 200) {
        await waitWhilePaused();
        if (stopRequested) return { ok: false, reason: "stopped by user" };
        if (!isJobListPage()) return { ok: false, reason: "stopped, this is no longer a job list page" };
        if (hasCaptcha()) {
          setStatus("Stopped. Indeed showed a verification page. Wait a while before you try again.");
          return { ok: false, reason: "stopped by captcha" };
        }
        steps++;
        // Rest check: after workMinutes of work, rest for restMinutes.
        if (settings.enableRest && restMs > 0 && (Date.now() - workStart) >= workMs) {
          restCount++;
          const ok = await takeRest(restMs);
          if (!ok) {
            if (hasCaptcha()) return { ok: false, reason: "stopped by captcha" };
            return { ok: false, reason: "stopped by user" };
          }
          workStart = Date.now();
          setStatus("Rest done (" + restCount + "). Resuming the load.");
        }
        const stepPx = isWindow
          ? Math.round(window.innerHeight * profile.fraction)
          : Math.round(container.clientHeight * profile.fraction);
        if (isWindow) {
          window.scrollBy({ top: stepPx, behavior: "smooth" });
        } else {
          container.scrollBy({ top: stepPx, behavior: "smooth" });
        }
        await sleep(randomDelayMs());
        const moreBtn = Array.from(document.querySelectorAll("button, a")).find(function (el) {
          return /see more jobs|show more jobs|load more/i.test(textOf(el));
        });
        if (moreBtn) { try { moreBtn.click(); } catch (e) {} }
        await sleep(400);
        const count = findJobCards().length;
        if (count > lastCount) {
          lastCount = count;
          noNewCount = 0;
        } else {
          noNewCount++;
        }
        setStatus("Loading all jobs. Speed " + profile.label + ". Found " + lastCount + " jobs so far. Rests taken: " + restCount + ".");
      }
    } finally {
      isLoading = false;
    }
    updatePanelCounts();
    setStatus("Reached the end. Loaded " + lastCount + " jobs on page " + currentPageNumber() + ". Rests taken: " + restCount + ". " + (hasNextPage() ? "There is a next page." : "No next page was found."));
    return { ok: true, total: lastCount };
  }

  async function filterJobs() {
    if (!isJobListPage()) return { ok: false, reason: "not a job list page. Open an Indeed search list first." };
    const cards = findJobCards();
    if (!cards.length) {
      setStatus("No job cards found yet. Wait for the list to load, then try again.");
      return { ok: false, reason: "no cards" };
    }
    let kept = 0;
    let hidden = 0;
    setStatus("Checking " + cards.length + " jobs against your radius.");
    for (const card of cards) {
      await waitWhilePaused();
      if (stopRequested) break;
      const result = await shouldKeep(card);
      const row = card.closest("li") || card;
      if (result.keep) {
        row.style.display = "";
        card.style.display = "";
        kept++;
      } else {
        row.style.display = "none";
        hidden++;
      }
      card.setAttribute("data-irf-distance", result.reason);
      showDistanceLabel(card, result);
    }
    lastCounts = { total: cards.length, kept: kept, hidden: hidden };
    isFiltered = true;
    updatePanelCounts();
    return { ok: true, total: cards.length, kept: kept, hidden: hidden };
  }

  function showAllJobs() {
    findJobCards().forEach(function (card) {
      const row = card.closest("li") || card;
      row.style.display = "";
      card.style.display = "";
    });
    isFiltered = false;
    lastCounts = { total: findJobCards().length, kept: 0, hidden: 0 };
    updatePanelCounts();
    setStatus("Showing all jobs again on page " + currentPageNumber() + ".");
    return { ok: true };
  }

  function scrollListTo(where) {
    const container = findScrollContainer();
    const isWindow = container === document.scrollingElement || container === document.documentElement || container === document.body;
    if (where === "top") {
      if (isWindow) window.scrollTo({ top: 0, behavior: "smooth" });
      else container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (isWindow) window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      else container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }

  async function collectJobLocations(accumulate) {
    if (!isJobListPage()) return jobLocations;
    if (collectRunning) return jobLocations;
    collectRunning = true;
    const mySeq = ++collectSeq;
    const cards = findJobCards();
    const keepOld = accumulate === true && settings.loadMode === "auto";
    const oldJobs = keepOld ? jobLocations.slice() : [];
    const oldIds = new Set(oldJobs.map(function (j) { return j.jk || j.id; }));
    const newJobs = [];
    const dupCount = {};
    oldJobs.forEach(function (j) {
      const k = j.lat.toFixed(4) + "," + j.lng.toFixed(4);
      dupCount[k] = (dupCount[k] || 0) + 1;
    });
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const id = "irf-p" + currentPageNumber() + "-" + i + "-" + (card.getAttribute("data-jk") || ("n" + i));
      card.setAttribute("data-irf-id", id);
      const titleEl = card.querySelector("h2 a, h2 span, a[data-jk] span, [data-testid='job-title'], h2");
      const title = titleEl ? textOf(titleEl).slice(0, 90) : ("Job " + (i + 1));
      const companyEl = card.querySelector("[data-testid='company-name']");
      const company = companyEl ? textOf(companyEl).slice(0, 80) : "";
      const locEl = card.querySelector("[data-testid='text-location'], [data-testid='job-location'], .companyLocation");
      let locationText = locEl ? textOf(locEl).trim().slice(0, 80) : "";
      if (!locationText) {
        const inner = (card.innerText || "").split("\n").slice(0, 8).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 2 && s.length < 40; });
        const locLine = inner.find(function (s) { return /,\s*(QC|ON|BC|AB|MB|SK|NS|NB|NL|PE|YT|NT|NU)\b/.test(s); });
        if (locLine) locationText = locLine.slice(0, 80);
      }
      // Do not guess a town from the whole card text. A town name in the job description
      // is often not the job place, and that was putting pins in the wrong place.
      // If there is no location element, the job goes to the small list, not to a false pin.
      let coords = null;
      let source = "town";
      if (locationText) {
        coords = townCoordsFor(locationText);
        if (!coords) {
          const postal = locationText.match(/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d\b/i);
          if (postal) {
            coords = await geocodeAddress(postal[0] + ", " + locationText);
            if (coords) source = "postal code";
          }
        }
        if (!coords) {
          const short = locationText.split(",")[0].trim();
          if (short && !isGenericPlace(short)) {
            coords = await geocodeTown(short);
            if (coords) source = "town lookup";
          }
        }
      }
      let outsideCanada = false;
      let noPlace = false;
      if (!coords) {
        noPlace = true;
        source = "no place on map, see small list below the map";
        coords = { lat: 45.5017, lng: -73.5673 };
      } else if (!isInCanada(coords.lat, coords.lng)) {
        outsideCanada = true;
        source = "outside Canada, see small list below the map";
      }
      const center = effectiveCenter();
      const straightKm = haversineKm(center.lat, center.lng, coords.lat, coords.lng);
      const visible = card.style.display !== "none" && (!card.closest("li") || card.closest("li").style.display !== "none");
      const reason = card.getAttribute("data-irf-distance") || "";
      const key = coords.lat.toFixed(4) + "," + coords.lng.toFixed(4);
      const n = dupCount[key] || 0;
      dupCount[key] = n + 1;
      let plotLat = coords.lat, plotLng = coords.lng;
      if (n > 0) {
        const ang = n * 1.1;
        const off = 0.004 * (1 + Math.floor(n / 6));
        plotLat = coords.lat + off * Math.cos(ang);
        plotLng = coords.lng + off * Math.sin(ang) / Math.cos(coords.lat * Math.PI / 180);
      }
      const jk = card.getAttribute("data-jk") || null;
      if (keepOld && jk && oldIds.has(jk)) continue;
      const url = getJobUrl(card);
      newJobs.push({ id: id, index: i, title: title, company: company, location: locationText || "No place shown", lat: coords.lat, lng: coords.lng, plotLat: plotLat, plotLng: plotLng, straightKm: straightKm, inside: straightKm <= settings.radiusKm, visible: visible, reason: reason, source: source, outsideCanada: outsideCanada, noPlace: noPlace, jk: jk, url: url, card: card, page: currentPageNumber() });
    }
    collectRunning = false;
    if (mySeq !== collectSeq) return jobLocations;
    jobLocations = keepOld ? oldJobs.concat(newJobs) : newJobs;
    try { chrome.storage.local.set({ irfJobLocations: jobLocations.map(function (j) { return { id: j.id, title: j.title, location: j.location, lat: j.lat, lng: j.lng, straightKm: j.straightKm, inside: j.inside, jk: j.jk, url: j.url }; }) }); } catch (e) {}
    return jobLocations;
  }

  function makePinIcon(cls) {
    if (typeof L === "undefined") return null;
    return L.divIcon({ className: "", html: '<div class="irf-pin ' + cls + '"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
  }

  function plotJobMarkers() {
    if (!mapObj || typeof L === "undefined") return;
    mapMarkers.forEach(function (m) { mapObj.removeLayer(m); });
    mapMarkers = [];
    const inCanada = jobLocations.filter(function (j) { return !j.outsideCanada && !j.noPlace; });
    inCanada.forEach(function (job) {
      const icon = makePinIcon(job.inside ? "irf-pin-green" : "irf-pin-red");
      const marker = L.marker([job.plotLat, job.plotLng], { icon: icon }).addTo(mapObj);
      marker.jobId = job.id;
      const safeTitle = job.title.replace(/</g, "&lt;");
      const safeCompany = (job.company || "").replace(/</g, "&lt;");
      const safeLoc = job.location.replace(/</g, "&lt;");
      const safeReason = (job.reason || "").replace(/</g, "&lt;");
      const modeText = settings.openInNewPage === false ? "Same page" : "New page";
      marker.bindPopup(
        "<div class=\"irf-popup\"><b>" + safeTitle + "</b><br>" + (safeCompany ? safeCompany + "<br>" : "") + safeLoc +
        "<div class=\"irf-popup-dist\">" + job.straightKm.toFixed(1) + " km straight from center<br>" + safeReason + "</div>" +
        "<div>Open in: " + modeText + " (change it in the settings below)</div>" +
        "<button class=\"irf-open-job-popup\" data-irf-id=\"" + job.id + "\">Open this job in a new tab</button></div>",
        { maxWidth: 280, closeButton: true }
      );
      marker.on("click", function () { showJobDetail(job); });
      mapMarkers.push(marker);
    });
    renderOutsideList();
    if (mapMarkers.length && !mapFittedOnce) {
      try {
        const group = L.featureGroup(mapMarkers);
        mapObj.fitBounds(group.getBounds().pad(0.15), { maxZoom: 10 });
        mapFittedOnce = true;
      } catch (e) {}
    }
  }

  function showJobDetail(job) {
    const el = document.getElementById("irf-map-detail");
    if (!el) return;
    const safeTitle = job.title.replace(/</g, "&lt;");
    const safeCompany2 = (job.company || "").replace(/</g, "&lt;");
    const safeLoc = job.location.replace(/</g, "&lt;");
    const safeReason = (job.reason || "").replace(/</g, "&lt;");
    const modeText2 = settings.openInNewPage === false ? "Open this job in this page" : "Open this job in a new tab";
    el.innerHTML = "<b>" + safeTitle + "</b> - " + (safeCompany2 ? safeCompany2 + ", " : "") + safeLoc + " - " + job.straightKm.toFixed(1) + " km straight. " + safeReason + " <button class=\"irf-open-job\" data-irf-id=\"" + job.id + "\">" + modeText2 + "</button>";
  }

  function renderOutsideList() {
    const el = document.getElementById("irf-map-outside");
    if (!el) return;
    const outside = jobLocations.filter(function (j) { return j.outsideCanada || j.noPlace; });
    if (!outside.length) { el.innerHTML = ""; return; }
    let html = "<details><summary>Outside the map or no place on the map (" + outside.length + ") - click to see the small list, no popup</summary>";
    outside.forEach(function (job) {
      html += "<div>" + job.title.replace(/</g, "&lt;") + " - " + job.location.replace(/</g, "&lt;") + " - " + job.source.replace(/</g, "&lt;") + " <button class=\"irf-open-job\" data-irf-id=\"" + job.id + "\">Open</button></div>";
    });
    html += "</details>";
    el.innerHTML = html;
  }

  function updateMapCircle() {
    if (!mapObj || !mapCircle) return;
    const center = effectiveCenter();
    mapCircle.setLatLng([center.lat, center.lng]);
    mapCircle.setRadius(settings.radiusKm * 1000);
    if (mapCenterMarker) mapCenterMarker.setLatLng([center.lat, center.lng]);
  }

  function getCurrentJobKey() {
    try {
      const params = new URLSearchParams(window.location.search);
      const vjk = params.get("vjk");
      if (vjk) return vjk;
    } catch (e) {}
    const sel = document.querySelector("[data-jk][aria-selected='true'], li[aria-selected='true'] [data-jk], .job_seen_beacon[data-jk], [data-jk].selected, [data-jk].active, li.selected [data-jk], li.active [data-jk]");
    if (sel) return sel.getAttribute("data-jk");
    const detail = document.querySelector("[data-testid='job-detail'], .jobsearch-JobComponent");
    if (detail) {
      const link = detail.querySelector("a[href*='jk=']");
      if (link) {
        const m = (link.getAttribute("href") || "").match(/[?&]jk=([A-Za-z0-9]+)/);
        if (m) return m[1];
      }
      const titleEl = detail.querySelector("h2, [data-testid='job-title']");
      if (titleEl) {
        const title = (titleEl.textContent || "").trim().slice(0, 60);
        const card = jobLocations.find(function (j) { return j.title && title && j.title.indexOf(title.slice(0, 30)) !== -1; });
        if (card && card.jk) return card.jk;
      }
    }
    return null;
  }

  function getDetailLocation(job) {
    const detail = document.querySelector("[data-testid='job-detail'], .jobsearch-JobComponent");
    if (!detail) return "";
    // Only use the detail pane if it is the same job. Otherwise we would take
    // the place of a different job, for example Toronto instead of Montreal.
    const titleEl = detail.querySelector("h2, [data-testid='job-title']");
    const detailTitle = titleEl ? textOf(titleEl).slice(0, 120) : "";
    if (job && job.title && detailTitle && detailTitle.indexOf(job.title.slice(0, 30)) === -1 && job.title.indexOf(detailTitle.slice(0, 30)) === -1) return "";
    const els = detail.querySelectorAll("[data-testid='text-location'], .companyLocation");
    for (let i = 0; i < els.length; i++) {
      const txt = textOf(els[i]).trim();
      if (txt && txt.length < 80 && /,\s*(QC|ON|BC|AB|MB|SK|NS|NB|NL|PE|YT|NT|NU)\b/.test(txt)) return txt;
    }
    // Fallback: header area only, first 10 lines. The location sits under the
    // title and company. A Town, QC line later in the pane is in the job
    // description (head office, other locations) and is not this job's city.
    const inner = (detail.innerText || "").split("\n").slice(0, 10).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 2 && s.length < 40; });
    const locLine = inner.find(function (s) { return /,\s*(QC|ON|BC|AB|MB|SK|NS|NB|NL|PE|YT|NT|NU)\b/.test(s); });
    return locLine || "";
  }

  async function fixJobPlaceFromDetail(job) {
    if (!job) return job;
    const loc = getDetailLocation(job);
    if (!loc) return job;
    // Already correct: same city, and it already has a place. Do not move it.
    if (!job.noPlace && job.location && norm(job.location) === norm(loc)) return job;
    let coords = townCoordsFor(loc);
    if (!coords) {
      const postal = loc.match(/\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d\b/i);
      if (postal) coords = await geocodeAddress(postal[0] + ", " + loc);
    }
    if (!coords) {
      const short = loc.split(",")[0].trim();
      if (short && !isGenericPlace(short)) coords = await geocodeTown(short);
    }
    if (!coords) return job;
    const center = effectiveCenter();
    job.location = loc;
    job.lat = coords.lat; job.lng = coords.lng;
    job.plotLat = coords.lat; job.plotLng = coords.lng;
    job.straightKm = haversineKm(center.lat, center.lng, coords.lat, coords.lng);
    job.inside = job.straightKm <= settings.radiusKm;
    job.noPlace = false; job.outsideCanada = false; job.source = "job detail";
    return job;
  }

  async function focusJobOnMap(job) {
    if (!job || !mapObj) return false;
    await fixJobPlaceFromDetail(job);
    if (job.outsideCanada || job.noPlace) {
      showJobDetail(job);
      setStatus("That job has no place on the map, it is in the small list below the map: " + job.title);
      return true;
    }

    // This map is opened from Indeed's job-detail pane. Wait for the overlay
    // to become visible, then let Leaflet recalculate its dimensions before
    // focusing the selected job and opening its normal marker popup.
    await new Promise(function (resolve) { setTimeout(resolve, 350); });
    if (!mapObj) return false;
    try { mapObj.invalidateSize({ pan: false }); } catch (e) {}
    try { mapObj.setView([job.plotLat, job.plotLng], 12, { animate: false }); } catch (e) {}

    showJobDetail(job);
    let marker = mapMarkers.find(function (m) { return m.jobId === job.id; });
    if (!marker && job.jk) {
      marker = mapMarkers.find(function (m) {
        const candidate = jobLocations.find(function (j) { return j.id === m.jobId; });
        return candidate && candidate.jk === job.jk;
      });
    }
    if (!marker) {
      plotJobMarkers();
      marker = mapMarkers.find(function (m) { return m.jobId === job.id; });
    }
    if (marker) {
      try {
        marker.setZIndexOffset(1000);
        marker.openPopup();
      } catch (e) {}
    } else {
      setStatus("The job was located, but its map pin could not be created: " + job.title);
      return false;
    }
    return true;
  }

  function setMapDetail(text) {
    const el = document.getElementById("irf-map-detail");
    if (el) el.textContent = text;
  }

  async function showCurrentJobOnMap() {
    if (!isJobListPage()) { setStatus("Show on map only works on an Indeed search list, not on a job detail page."); return { ok: false }; }
    // Identify the open job FIRST. showMap re-collects the list and rebuilds
    // jobLocations, so a job found after that can already carry a wrong city.
    let jk = getCurrentJobKey();
    await showMap(true);
    // Retry once after the map collect: the title fallback in
    // getCurrentJobKey needs jobLocations, which showMap just filled.
    if (!jk) jk = getCurrentJobKey();
    if (!jk) {
      setMapDetail("Could not tell which job is open. Click the job in the list first, then click Show on map again. The map is open with all loaded jobs, click any pin.");
      setStatus("Could not tell which job is open. Click the job in the list first, then click Show on map again.");
      return { ok: false, reason: "no jk" };
    }
    let job = jobLocations.find(function (j) { return j.jk === jk; });
    if (!job) {
      setMapDetail("Finding that job on the map, please wait. Job key: " + jk);
      await collectJobLocations(settings.loadMode === "auto");
      job = jobLocations.find(function (j) { return j.jk === jk; });
      plotJobMarkers();
      updateMapCount();
    }
    if (!job) {
      setMapDetail("That job is not in the loaded list yet. Scroll the list to load more jobs, then click Show on map again. Job key: " + jk);
      setStatus("That job is not in the loaded list yet. Scroll the list to load more jobs, then click Show on map again.");
      return { ok: false, reason: "job not in list" };
    }
    await fixJobPlaceFromDetail(job);
    plotJobMarkers();
    updateMapCount();
    await focusJobOnMap(job);
    setStatus("Showing on the map: " + job.title + ", " + job.location);
    return { ok: true, title: job.title };
  }

  function injectShowOnMapButton() {
    const old = document.getElementById("irf-show-on-map");
    if (old && old.isConnected) return;
    if (old && !old.isConnected) old.remove();
    const all = Array.from(document.querySelectorAll("a, button"));
    const applyBtn = all.find(function (el) {
      const txt = (el.textContent || "").trim().toLowerCase();
      return txt.indexOf("apply on company site") !== -1 || txt === "apply now" || txt === "apply";
    });
    if (!applyBtn) return;
    // Find the row that holds Apply plus the bookmark, thumbs down and share buttons.
    // Climb up from Apply until an ancestor holds at least 3 buttons, that is the row.
    let row = applyBtn.parentElement;
    for (let i = 0; i < 4 && row; i++) {
      const btns = row.querySelectorAll("a, button");
      if (btns.length >= 3) break;
      row = row.parentElement;
    }
    if (!row) row = applyBtn.parentElement;
    const btn = document.createElement("button");
    btn.id = "irf-show-on-map";
    btn.type = "button";
    btn.textContent = "Show on map";
    btn.title = "Show this job on the map";
    btn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); showCurrentJobOnMap(); });
    row.appendChild(btn);
  }

  function startShowOnMapWatcher() {
    injectShowOnMapButton();
    try {
      const obs = new MutationObserver(function () { injectShowOnMapButton(); });
      obs.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    setInterval(function () { injectShowOnMapButton(); }, 2000);
  }

  async function showMap(keepView) {
    if (typeof L === "undefined") {
      setStatus("Map library did not load. Check your internet connection, then reload Indeed and try Open map again.");
      return { ok: false, reason: "leaflet missing" };
    }
    let overlay = document.getElementById("irf-map-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "irf-map-overlay";
      overlay.innerHTML =
        '<div class="irf-map-head"><img src="' + (chrome.runtime && chrome.runtime.getURL ? chrome.runtime.getURL("icons/icon32.png") : "") + '" alt="Logo">' +
        '<h3>Jobs on OpenStreetMap<small>Drag the blue center pin, change the radius, then filter in the map</small></h3>' +
        '<button class="irf-map-close" id="irf-map-close" title="Close map">X</button></div>' +
        '<div class="irf-map-controls"><label>Radius: <span id="irf-map-radius-label">' + settings.radiusKm + ' km</span></label>' +
        '<input type="range" id="irf-map-radius" min="5" max="100" step="5" value="' + settings.radiusKm + '">' +
        '<span id="irf-map-count">Loading jobs for the map.</span>' +
        '<button id="irf-map-filter-circle">Filter by circle</button>' +
        '<button id="irf-map-filter-view" class="irf-secondary">Filter by map view</button>' +
        '<button id="irf-map-reset" class="irf-secondary">Reset center</button>' +
        '<button id="irf-map-fit" class="irf-secondary">Fit all pins</button>' +
        '<label>Open job: <select id="irf-map-open-mode"><option value="new">New page</option><option value="same">Same page</option></select></label>' +
        '<label>Load: <select id="irf-map-load-mode"><option value="page">Page by page</option><option value="auto">Automated, all pages</option></select></label>' +
        '<button id="irf-map-refresh" class="irf-secondary">Refresh map</button>' +
        '<button id="irf-map-reset-all" class="irf-secondary">Reset all results</button>' +
        '<button id="irf-map-showall" class="irf-secondary">Show all</button></div>' +
        '<div id="irf-map"></div><div id="irf-map-detail">Click a pin, or use Show on map in the Indeed job details, to open that job popup here.</div><div id="irf-map-outside"></div>' +
        '<div class="irf-map-foot">Map data: OpenStreetMap contributors, ODbL. Map stays inside Canada. Green pin is inside your radius, red pin is outside. Click a pin for a small popup with the job and an Open button. It opens in a new tab by default, change it in the settings in the popup, in the Indeed panel, or on the map. The map does not zoom out by itself when new pins are found, use Fit all pins if you want to see all of them.</div>';
      document.body.appendChild(overlay);
      document.getElementById("irf-map-close").addEventListener("click", function () { overlay.style.display = "none"; mapVisible = false; });
      document.getElementById("irf-map-radius").addEventListener("input", function (e) {
        const v = parseInt(e.target.value, 10);
        document.getElementById("irf-map-radius-label").textContent = v + " km";
        settings.radiusKm = v;
        saveSettingsPatch({ radiusKm: v });
        updateMapCircle();
        jobLocations.forEach(function (j) { j.inside = j.straightKm <= v; });
        plotJobMarkers();
      });
      document.getElementById("irf-map-filter-circle").addEventListener("click", async function () { await filterJobs(); await collectJobLocations(); plotJobMarkers(); updateMapCount(); });
      document.getElementById("irf-map-filter-view").addEventListener("click", function () { filterByMapView(); });
      document.getElementById("irf-map-reset").addEventListener("click", function () {
        saveSettingsPatch({ customLat: null, customLng: null });
        settings.customLat = null; settings.customLng = null;
        const c = CENTERS[settings.center] || CENTERS["saint-laurent"];
        if (mapObj) mapObj.setView([c.lat, c.lng], 8);
        updateMapCircle();
        jobLocations.forEach(function (j) { j.straightKm = haversineKm(c.lat, c.lng, j.lat, j.lng); j.inside = j.straightKm <= settings.radiusKm; });
        plotJobMarkers(); updateMapCount();
        setStatus("Center reset to " + c.name + ".");
      });
      document.getElementById("irf-map-fit").addEventListener("click", function () {
        if (mapMarkers.length) { try { const g = L.featureGroup(mapMarkers); mapObj.fitBounds(g.getBounds().pad(0.15), { maxZoom: 10 }); } catch (e) {} }
      });
      const openSel = document.getElementById("irf-map-open-mode");
      if (openSel) {
        openSel.value = settings.openInNewPage === false ? "same" : "new";
        openSel.addEventListener("change", function () { saveSettingsPatch({ openInNewPage: openSel.value === "new" }); settings.openInNewPage = openSel.value === "new"; });
      }
      const mapMode = document.getElementById("irf-map-load-mode");
      if (mapMode) {
        mapMode.value = settings.loadMode === "auto" ? "auto" : "page";
        mapMode.addEventListener("change", function () { saveSettingsPatch({ loadMode: mapMode.value === "auto" ? "auto" : "page" }); settings.loadMode = mapMode.value === "auto" ? "auto" : "page"; setStatus("Load mode set to: " + (mapMode.value === "auto" ? "Automated, all pages" : "Page by page") + "."); });
      }
      document.getElementById("irf-map-refresh").addEventListener("click", async function () { await refreshMapForCurrentPage(); });
      document.getElementById("irf-map-reset-all").addEventListener("click", function () { resetAllResults(); });
      document.getElementById("irf-map-showall").addEventListener("click", function () { showAllJobs(); plotJobMarkers(); updateMapCount(); });
      overlay.addEventListener("click", function (e) {
        const btn = e.target && e.target.closest ? (e.target.closest(".irf-open-job-popup") || e.target.closest(".irf-open-job")) : null;
        if (!btn) return;
        const jobId = btn.getAttribute("data-irf-id");
        const job = jobLocations.find(function (j) { return j.id === jobId; });
        if (!job) return;
        const card = job.card;
        if (card) { const row = card.closest("li") || card; row.style.display = ""; card.style.display = ""; }
        if (settings.openInNewPage !== false) {
          openJob(job);
        } else {
          overlay.style.display = "none"; mapVisible = false;
          if (card) { card.scrollIntoView({ behavior: "smooth", block: "center" }); try { card.click(); } catch (err) {} }
          setStatus("Opened job from the map: " + job.title);
        }
      });
    }
    overlay.style.display = "flex";
    mapVisible = true;
    const center = effectiveCenter();
    if (!mapObj) {
      mapObj = L.map("irf-map", { maxBounds: L.latLngBounds(CANADA_BOUNDS), maxBoundsViscosity: 1.0, minZoom: 4, maxZoom: 18, worldCopyJump: false }).setView([center.lat, center.lng], 8);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors" }).addTo(mapObj);
      mapCircle = L.circle([center.lat, center.lng], { radius: settings.radiusKm * 1000, color: "#2557a7", weight: 2, fillColor: "#2557a7", fillOpacity: 0.08 }).addTo(mapObj);
      mapCenterMarker = L.marker([center.lat, center.lng], { draggable: true, icon: makePinIcon("irf-pin-blue") }).addTo(mapObj);
      mapCenterMarker.bindTooltip("Your center. Drag me to move it.", { direction: "top" });
      mapCenterMarker.on("dragend", function () {
        const p = mapCenterMarker.getLatLng();
        saveSettingsPatch({ customLat: p.lat, customLng: p.lng });
        settings.customLat = p.lat; settings.customLng = p.lng;
        updateMapCircle();
        jobLocations.forEach(function (j) { j.straightKm = haversineKm(p.lat, p.lng, j.lat, j.lng); j.inside = j.straightKm <= settings.radiusKm; });
        plotJobMarkers();
        updateMapCount();
        setStatus("Center moved on the map to " + p.lat.toFixed(4) + ", " + p.lng.toFixed(4) + ". Click Filter by circle to re-filter the list.");
      });
      setTimeout(function () { if (mapObj) mapObj.invalidateSize(); }, 300);
    } else {
      if (!keepView) mapObj.setView([center.lat, center.lng], mapObj.getZoom());
      updateMapCircle();
      setTimeout(function () { if (mapObj) mapObj.invalidateSize(); }, 300);
    }
    setStatus("Loading jobs for the map.");
    await collectJobLocations();
    plotJobMarkers();
    updateMapCount();
    return { ok: true, total: jobLocations.length };
  }

  function updateMapCount() {
    const el = document.getElementById("irf-map-count");
    if (!el) return;
    const inside = jobLocations.filter(function (j) { return j.inside; }).length;
    const total = findJobCards().length;
    const outside = jobLocations.filter(function (j) { return j.outsideCanada || j.noPlace; }).length;
    el.textContent = "Jobs on map: " + (jobLocations.length - outside) + " of " + total + " loaded. Inside radius: " + inside + ". Outside radius: " + (jobLocations.length - inside - outside) + ". Outside Canada or no place: " + outside + ", see the small list below the map.";
  }

  function filterByMapView() {
    if (!mapObj) return { ok: false, reason: "map not open" };
    const bounds = mapObj.getBounds();
    let kept = 0, hidden = 0;
    jobLocations.forEach(function (job) {
      const row = job.card.closest("li") || job.card;
      if (bounds.contains([job.lat, job.lng])) { row.style.display = ""; job.card.style.display = ""; kept++; }
      else { row.style.display = "none"; hidden++; }
    });
    lastCounts = { total: jobLocations.length, kept: kept, hidden: hidden };
    isFiltered = true;
    updatePanelCounts();
    setStatus("Filtered by map view. Kept " + kept + " of " + jobLocations.length + " jobs in the area you can see on the map.");
    return { ok: true, total: jobLocations.length, kept: kept, hidden: hidden };
  }

  function createPanel() {
    if (document.getElementById("irf-panel")) return;
    const panel = document.createElement("div");
    panel.id = "irf-panel";
    const logoUrl = (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL("icons/icon32.png") : "";
    panel.innerHTML =
      '<div class="irf-head"><img src="' + logoUrl + '" alt="Logo">' +
      '<h3>Indeed Job Map Pro<small>v1.17</small></h3>' +
      '<button class="irf-close" id="irf-toggle" title="Hide panel">-</button></div>' +
      '<div class="irf-body">' +
      '<p class="irf-status" id="irf-status">Ready.</p>' +
      '<div class="irf-row"><button class="irf-btn" id="irf-load">Load all</button>' +
      '<button class="irf-btn" id="irf-filter">Filter by radius</button></div>' +
      '<div class="irf-row"><button class="irf-btn irf-secondary" id="irf-prev">Previous page</button>' +
      '<button class="irf-btn irf-secondary" id="irf-next">Next page</button></div>' +
      '<div class="irf-row"><button class="irf-btn irf-secondary" id="irf-pause">Pause</button>' +
      '<button class="irf-btn irf-secondary" id="irf-resume">Resume</button></div>' +
      '<div class="irf-row"><button class="irf-btn irf-secondary" id="irf-top">Top</button>' +
      '<button class="irf-btn irf-secondary" id="irf-bottom">Bottom</button>' +
      '<button class="irf-btn irf-secondary" id="irf-stop">Stop</button></div>' +
      '<div class="irf-row"><button class="irf-btn irf-secondary" id="irf-showall">Show all</button><button class="irf-btn irf-secondary" id="irf-showmap">Show map</button></div>' +
      '<div class="irf-row"><button class="irf-btn" id="irf-show-current">Show this job on map</button></div>' +
      '<div class="irf-row"><button class="irf-btn irf-secondary" id="irf-reset">Reset all results</button></div>' +
      '<p class="irf-setting">Open job from map: <select class="irf-select" id="irf-panel-open-mode"><option value="new">New page, default</option><option value="same">Same page</option></select></p>' +
      '<p class="irf-setting">Load mode: <select class="irf-select" id="irf-panel-load-mode"><option value="page">Page by page, default</option><option value="auto">Automated, all pages, up to 10</option></select></p>' +
      '<p class="irf-note">Center, radius, speed and rest are set in the extension popup. Default rest is 1 minute every 2 minutes. Next page uses the Indeed button when it is there, or the page number in the web address when it is not.</p>' +
      '</div>';
    document.body.appendChild(panel);

    document.getElementById("irf-load").addEventListener("click", async function () {
      if (settings.loadMode === "auto") {
        const r = await loadAllPagesAuto();
        if (r.ok) { await collectJobLocations(true); plotJobMarkers(); updateMapCount(); }
        return;
      }
      const r = await scrollToEnd();
      if (r.ok) { await filterJobs(); await collectJobLocations(false); plotJobMarkers(); updateMapCount(); }
    });
    document.getElementById("irf-filter").addEventListener("click", function () { filterJobs(); });
    document.getElementById("irf-next").addEventListener("click", function () { goToPage("next"); });
    document.getElementById("irf-prev").addEventListener("click", function () { goToPage("prev"); });
    document.getElementById("irf-top").addEventListener("click", function () { scrollListTo("top"); });
    document.getElementById("irf-bottom").addEventListener("click", function () { scrollListTo("bottom"); });
    document.getElementById("irf-pause").addEventListener("click", function () { isPaused = true; setStatus("Paused. Click Resume to continue from the same place. Nothing is lost."); });
    document.getElementById("irf-resume").addEventListener("click", function () { isPaused = false; const b = document.getElementById("irf-resume"); if (b) b.dataset.skipRest = "1"; setStatus("Resumed. Continuing from where it stopped."); });
    document.getElementById("irf-stop").addEventListener("click", function () { stopRequested = true; isPaused = false; setStatus("Stopped. Click Load all again to resume from the current place, it will not restart from the top."); });
    document.getElementById("irf-showall").addEventListener("click", function () { showAllJobs(); });
    document.getElementById("irf-reset").addEventListener("click", function () { resetAllResults(); });
    document.getElementById("irf-showmap").addEventListener("click", function () { showMap(); });
    const _sc = document.getElementById("irf-show-current"); if (_sc) _sc.addEventListener("click", function () { showCurrentJobOnMap(); });
    const panelOpen = document.getElementById("irf-panel-open-mode");
    if (panelOpen) {
      panelOpen.value = settings.openInNewPage === false ? "same" : "new";
      panelOpen.addEventListener("change", function () { saveSettingsPatch({ openInNewPage: panelOpen.value === "new" }); settings.openInNewPage = panelOpen.value === "new"; setStatus("Open job set to: " + (panelOpen.value === "new" ? "New page" : "Same page") + "."); });
    }
    const panelMode = document.getElementById("irf-panel-load-mode");
    if (panelMode) {
      panelMode.value = settings.loadMode === "auto" ? "auto" : "page";
      panelMode.addEventListener("change", function () { saveSettingsPatch({ loadMode: panelMode.value === "auto" ? "auto" : "page" }); settings.loadMode = panelMode.value === "auto" ? "auto" : "page"; setStatus("Load mode set to: " + (panelMode.value === "auto" ? "Automated, all pages, up to 10" : "Page by page") + "."); });
    }
    document.getElementById("irf-toggle").addEventListener("click", function () {
      panel.classList.toggle("irf-collapsed");
      document.getElementById("irf-toggle").textContent = panel.classList.contains("irf-collapsed") ? "+" : "-";
    });
  }

  function watchFirstJobClick() {
    document.addEventListener("click", function (e) {
      if (!isJobListPage()) return;
      if (!settings.autoStart || autoStartedForClick || isLoading) return;
      if (isJobDetailOpen()) return;
      const target = e.target;
      if (!target || !target.closest) return;
      const link = target.closest("a");
      if (link && (link.getAttribute("target") === "_blank" || e.metaKey || e.ctrlKey)) return;
      const card = target.closest("[data-jk], .job_seen_beacon, li[data-testid='job-card']");
      if (!card) return;
      autoStartedForClick = true;
      setStatus("You clicked the first job. Loading all jobs to the end now.");
      scrollToEnd().then(function (r) { if (r.ok) return filterJobs(); });
      setTimeout(function () { autoStartedForClick = false; }, 30000);
    }, true);
  }

  function resetAllResults() {
    stopRequested = true;
    isPaused = false;
    autoRunActive = false;
    isFiltered = false;
    jobLocations = [];
    lastCounts = { total: findJobCards().length, kept: 0, hidden: 0 };
    try { chrome.storage.local.remove(["irfAutoRun", "irfJobLocations"]); } catch (e) {}
    findJobCards().forEach(function (card) {
      const row = card.closest("li") || card;
      row.style.display = "";
      card.style.display = "";
      card.removeAttribute("data-irf-distance");
      card.removeAttribute("data-irf-id");
    });
    document.querySelectorAll(".irf-distance").forEach(function (el) { el.remove(); });
    if (mapObj) {
      mapMarkers.forEach(function (m) { mapObj.removeLayer(m); });
      mapMarkers = [];
      mapFittedOnce = false;
    }
    const outside = document.getElementById("irf-map-outside");
    if (outside) outside.innerHTML = "";
    const detail = document.getElementById("irf-map-detail");
    if (detail) detail.textContent = "Results reset. Click Load all to load jobs again, then Show map.";
    updateMapCount();
    updatePanelCounts();
    setStatus("All results reset. All jobs are shown again, the map is cleared, and automated mode is stopped. Your center, radius and other settings are kept.");
    return { ok: true, total: findJobCards().length };
  }

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || !msg.action) return;
    if (msg.action === "loadAllAndFilter") {
      if (settings.loadMode === "auto") {
        loadAllPagesAuto().then(function (r) { sendResponse(r); });
      } else {
        scrollToEnd().then(function (r) { if (r.ok) return filterJobs(); return r; }).then(function (r) { collectJobLocations(false); return r; }).then(function (r) { sendResponse(r); });
      }
      return true;
    }
    if (msg.action === "loadAllPages") {
      loadAllPagesAuto().then(function (r) { sendResponse(r); });
      return true;
    }
    if (msg.action === "refreshMap") {
      refreshMapForCurrentPage().then(function () { sendResponse({ ok: true, total: jobLocations.length }); });
      return true;
    }
    if (msg.action === "loadAll") {
      scrollToEnd().then(function (r) { sendResponse(r); });
      return true;
    }
    if (msg.action === "filter") {
      filterJobs().then(function (r) { sendResponse(r); });
      return true;
    }
    if (msg.action === "showAll") { sendResponse(showAllJobs()); return; }
    if (msg.action === "resetAll") { sendResponse(resetAllResults()); return; }
    if (msg.action === "showMap") { showMap().then(function (r) { sendResponse(r); }); return true; }
    if (msg.action === "showCurrentJobOnMap") { showCurrentJobOnMap().then(function (r) { sendResponse(r); }); return true; }
    if (msg.action === "filterByMapView") { sendResponse(filterByMapView()); return; }
    if (msg.action === "stopLoad") { stopRequested = true; isPaused = false; autoRunActive = false; saveAutoRun({ active: false, pagesDone: 0, maxPages: settings.maxAutoPages || 10 }); sendResponse({ ok: true }); return; }
    if (msg.action === "pauseLoad") { isPaused = true; sendResponse({ ok: true, paused: true }); return; }
    if (msg.action === "resumeLoad") { isPaused = false; stopRequested = false; const b = document.getElementById("irf-resume"); if (b) b.dataset.skipRest = "1"; sendResponse({ ok: true, paused: false }); return; }
    if (msg.action === "nextPage") { sendResponse(goToPage("next")); return; }
    if (msg.action === "prevPage") { sendResponse(goToPage("prev")); return; }
    if (msg.action === "goTop") { scrollListTo("top"); sendResponse({ ok: true }); return; }
    if (msg.action === "goBottom") { scrollListTo("bottom"); sendResponse({ ok: true }); return; }
    if (msg.action === "getStatus") {
      sendResponse({ ok: true, total: findJobCards().length, kept: lastCounts.kept, hidden: lastCounts.hidden, page: currentPageNumber(), hasNext: hasNextPage(), hasPrev: hasPrevPage(), filtered: isFiltered, speed: settings.speed, paused: isPaused, loading: isLoading });
      return;
    }
    if (msg.action === "settingsUpdated") {
      loadSettings().then(function () { updatePanelCounts(); const po = document.getElementById('irf-panel-open-mode'); if (po) po.value = settings.openInNewPage === false ? 'same' : 'new'; const pm = document.getElementById('irf-panel-load-mode'); if (pm) pm.value = settings.loadMode === 'auto' ? 'auto' : 'page'; const mm = document.getElementById('irf-map-load-mode'); if (mm) mm.value = settings.loadMode === 'auto' ? 'auto' : 'page'; sendResponse({ ok: true }); });
      return true;
    }
  });

  loadSettings().then(function () {
    if (!isJobListPage()) return;
    createPanel();
    watchFirstJobClick();
    updatePanelCounts();
    startPageWatcher();
    startShowOnMapWatcher();
    setInterval(function () { if (!isLoading) updatePanelCounts(); }, 5000);
    // If Automated mode was in the middle of going through pages and Indeed reloaded the page, continue it.
    try {
      chrome.storage.local.get({ irfAutoRun: null }, function (items) {
        const run = items && items.irfAutoRun;
        if (run && run.active && (run.pagesDone || 0) < (run.maxPages || 10) && !stopRequested) {
          setStatus("Automated mode: continuing on page " + currentPageNumber() + ".");
          setTimeout(function () { loadAllPagesAuto(); }, 2500);
        }
      });
    } catch (e) {}
  });
})();
