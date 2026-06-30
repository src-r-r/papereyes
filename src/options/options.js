
const opacitySlider = document.getElementById("opacity");
const opacityValue = document.getElementById("opacity-value");
const blurSlider = document.getElementById("blur");
const blurValue = document.getElementById("blur-value");
const mixModeSelect = document.getElementById("mix-mode");
const domainList = document.getElementById("domain-list");
const noDomains = document.getElementById("no-domains");

async function loadSettings() {
  const result = await browser.storage.local.get(["settings", "enabledDomains"]);
  const settings = result.settings || { opacity: 0.15, blurRadius: 1, mixMode: "multiply" };
  const enabledDomains = result.enabledDomains || {};

  opacitySlider.value = Math.round(settings.opacity * 100);
  opacityValue.textContent = `${opacitySlider.value}%`;

  blurSlider.value = settings.blurRadius;
  blurValue.textContent = `${settings.blurRadius}px`;

  mixModeSelect.value = settings.mixMode || "multiply";

  renderDomains(enabledDomains);
}

function renderDomains(enabledDomains) {
  const domains = Object.keys(enabledDomains).sort();
  domainList.innerHTML = "";

  if (domains.length === 0) {
    noDomains.style.display = "block";
    domainList.style.display = "none";
    return;
  }

  noDomains.style.display = "none";
  domainList.style.display = "block";

  for (const domain of domains) {
    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    nameSpan.className = "domain-name";
    nameSpan.textContent = domain;

    const label = document.createElement("label");
    label.className = "switch";
    label.setAttribute("role", "switch");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = enabledDomains[domain] === true;
    input.setAttribute("role", "switch");
    input.addEventListener("change", () => {
      label.setAttribute("aria-checked", String(input.checked));
      toggleDomain(domain, input.checked);
    });

    const slider = document.createElement("span");
    slider.className = "slider";

    label.appendChild(input);
    label.appendChild(slider);
    li.appendChild(nameSpan);
    li.appendChild(label);
    domainList.appendChild(li);
  }
}

async function toggleDomain(domain, enabled) {
  const result = await browser.storage.local.get(["enabledDomains"]);
  const enabledDomains = result.enabledDomains || {};
  enabledDomains[domain] = enabled;
  await browser.storage.local.set({ enabledDomains });

  if (!enabled) {
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      try {
        const tabDomain = new URL(tab.url).hostname;
        if (tabDomain === domain && tab.id) {
          await browser.tabs.sendMessage(tab.id, { action: "remove" });
        }
      } catch {
        /* ignore */
      }
    }
  }
}

async function saveSettings() {
  const opacity = parseInt(opacitySlider.value, 10) / 100;
  const blurRadius = parseFloat(blurSlider.value);
  const mixMode = mixModeSelect.value;

  await browser.storage.local.set({
    settings: { opacity, blurRadius, mixMode },
  });

  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    try {
      if (tab.id) {
        await browser.tabs.sendMessage(tab.id, {
          action: "refresh",
          settings: { opacity, blurRadius, mixMode },
        }).catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }
}

opacitySlider.addEventListener("input", () => {
  opacityValue.textContent = `${opacitySlider.value}%`;
  opacitySlider.setAttribute("aria-valuenow", opacitySlider.value);
  saveSettings();
});

blurSlider.addEventListener("input", () => {
  blurValue.textContent = `${blurSlider.value}px`;
  blurSlider.setAttribute("aria-valuenow", blurSlider.value);
  saveSettings();
});

mixModeSelect.addEventListener("change", () => {
  saveSettings();
});

loadSettings();
