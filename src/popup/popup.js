/* global browser, document */

const toggle = document.getElementById("toggle");
const opacitySlider = document.getElementById("opacity");
const opacityVal = document.getElementById("opacity-val");
const blurSlider = document.getElementById("blur");
const blurVal = document.getElementById("blur-val");
const statusEl = document.getElementById("status");
const controlsEl = document.getElementById("controls");

async function getActiveTab() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

async function loadState() {
  const tab = await getActiveTab();
  const domain = getDomain(tab.url);
  document.getElementById("domain").textContent = domain || "unknown";

  const result = await browser.storage.local.get(["enabledDomains", "settings"]);
  const enabledDomains = result.enabledDomains || {};
  const settings = result.settings || { opacity: 0.15, blurRadius: 1 };
  const isEnabled = enabledDomains[domain] === true;

  toggle.checked = isEnabled;
  opacitySlider.value = Math.round(settings.opacity * 100);
  opacityVal.textContent = `${opacitySlider.value}%`;
  blurSlider.value = settings.blurRadius;
  blurVal.textContent = `${settings.blurRadius}px`;

  updateUI(isEnabled);
}

function updateUI(isEnabled) {
  if (isEnabled) {
    statusEl.textContent = "Paper texture is on";
    controlsEl.classList.remove("disabled");
  } else {
    statusEl.textContent = "Paper texture is off";
    controlsEl.classList.add("disabled");
  }
}

async function refreshActiveTab() {
  const tab = await getActiveTab();
  if (tab.id) {
    const result = await browser.storage.local.get(["settings"]);
    const settings = result.settings || { opacity: 0.15, blurRadius: 1 };
    await browser.tabs.sendMessage(tab.id, {
      action: "refresh",
      settings,
    }).catch(() => {});
  }
}

toggle.addEventListener("change", async (e) => {
  const enabled = e.target.checked;
  const tab = await getActiveTab();
  const domain = getDomain(tab.url);

  const result = await browser.storage.local.get(["enabledDomains", "settings"]);
  const enabledDomains = result.enabledDomains || {};
  enabledDomains[domain] = enabled;
  await browser.storage.local.set({ enabledDomains });

  if (tab.id) {
    await browser.tabs.sendMessage(tab.id, {
      action: "toggle",
      enabled,
      settings: result.settings || {},
    }).catch(() => {});
  }

  updateUI(enabled);
});

opacitySlider.addEventListener("input", () => {
  opacityVal.textContent = `${opacitySlider.value}%`;
  saveAndApplySettings();
});

blurSlider.addEventListener("input", () => {
  blurVal.textContent = `${blurSlider.value}px`;
  saveAndApplySettings();
});

async function saveAndApplySettings() {
  const opacity = parseInt(opacitySlider.value, 10) / 100;
  const blurRadius = parseFloat(blurSlider.value);

  await browser.storage.local.set({
    settings: { opacity, blurRadius },
  });

  await refreshActiveTab();
}

document.getElementById("options-link").addEventListener("click", (e) => {
  e.preventDefault();
  browser.runtime.openOptionsPage();
});

loadState();
