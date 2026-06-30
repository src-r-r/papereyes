
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get(["settings", "enabledDomains"]).then((result) => {
    const updates = {};
    if (!result.settings) {
      updates.settings = {
        opacity: 0.15,
        blurRadius: 1,
        mixMode: "multiply",
      };
    }
    if (!result.enabledDomains) {
      updates.enabledDomains = {};
    }
    if (Object.keys(updates).length > 0) {
      browser.storage.local.set(updates);
    }
  });
});
