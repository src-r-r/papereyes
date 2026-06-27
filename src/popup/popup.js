/* global browser, document */

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

  const result = await browser.storage.local.get(["enabledDomains"]);
  const enabledDomains = result.enabledDomains || {};
  const isEnabled = enabledDomains[domain] === true;

  document.getElementById("toggle").checked = isEnabled;
  document.getElementById("status").textContent = isEnabled
    ? "Paper texture is on"
    : "Paper texture is off";
}

document.getElementById("toggle").addEventListener("change", async (e) => {
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

  document.getElementById("status").textContent = enabled
    ? "Paper texture is on"
    : "Paper texture is off";
});

document.getElementById("options-link").addEventListener("click", (e) => {
  e.preventDefault();
  browser.runtime.openOptionsPage();
});

loadState();
