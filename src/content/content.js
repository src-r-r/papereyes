

const OVERLAY_ID = "paper4eyes-overlay";
const TILE_SIZE = 256;
const MIX_MODES = ["multiply", "overlay", "soft-light", "screen", "color-dodge", "hard-light"];

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function createOverlayCanvas(settings) {
  const canvas = document.createElement("canvas");
  canvas.id = OVERLAY_ID;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "2147483647";
  canvas.style.filter = NoiseUtils.getBlurFilter(settings.blurRadius);
  canvas.style.mixBlendMode = settings.mixMode;
  canvas.style.opacity = String(settings.opacity);
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  return canvas;
}

function renderNoise(canvas, opacity) {
  const ctx = canvas.getContext("2d");
  const srcData = NoiseUtils.generateNoiseData(TILE_SIZE, TILE_SIZE, opacity);
  const imageData = ctx.createImageData(TILE_SIZE, TILE_SIZE);
  const dstData = imageData.data;
  for (let i = 0; i < srcData.length; i++) {
    dstData[i] = srcData[i];
  }
  ctx.putImageData(imageData, 0, 0);
}

function removeOverlay() {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) {
    existing.remove();
  }
}

let settings = {
  opacity: 0.15,
  blurRadius: 1,
  mixMode: "multiply",
};

async function init() {
  const domain = getDomain(window.location.href);

  const result = await browser.storage.local.get(["enabledDomains", "settings"]);
  const enabledDomains = result.enabledDomains || {};
  const storedSettings = result.settings || {};

  if (storedSettings.opacity !== undefined) settings.opacity = storedSettings.opacity;
  if (storedSettings.blurRadius !== undefined) settings.blurRadius = storedSettings.blurRadius;
  if (storedSettings.mixMode && MIX_MODES.includes(storedSettings.mixMode)) {
    settings.mixMode = storedSettings.mixMode;
  }

  const isEnabled = enabledDomains[domain] === true;

  if (isEnabled) {
    const canvas = createOverlayCanvas(settings);
    renderNoise(canvas, settings.opacity);
    document.documentElement.appendChild(canvas);
  }
}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "refresh") {
    const canvas = document.getElementById(OVERLAY_ID);
    if (canvas) {
      settings.opacity = message.settings.opacity;
      settings.blurRadius = message.settings.blurRadius;
      settings.mixMode = message.settings.mixMode;
      renderNoise(canvas, message.settings.opacity);
      canvas.style.opacity = String(message.settings.opacity);
      canvas.style.filter = NoiseUtils.getBlurFilter(message.settings.blurRadius);
      canvas.style.mixBlendMode = message.settings.mixMode;
    }
    sendResponse({ ok: true });
  }

  if (message.action === "toggle") {
    const domain = getDomain(window.location.href);
    const canvas = document.getElementById(OVERLAY_ID);

    if (message.enabled) {
      if (!canvas) {
        const currentOpacity = message.settings ? message.settings.opacity : settings.opacity;
        const currentBlur = message.settings ? message.settings.blurRadius : settings.blurRadius;
        const currentMode = message.settings ? message.settings.mixMode : settings.mixMode;
        settings.opacity = currentOpacity;
        settings.blurRadius = currentBlur;
        settings.mixMode = currentMode;
        const newCanvas = createOverlayCanvas(settings);
        renderNoise(newCanvas, currentOpacity);
        document.documentElement.appendChild(newCanvas);
      }
    } else {
      removeOverlay();
    }

    browser.storage.local.get(["enabledDomains"]).then((result) => {
      const domains = result.enabledDomains || {};
      domains[domain] = message.enabled;
      browser.storage.local.set({ enabledDomains: domains });
    });

    sendResponse({ ok: true });
  }

  if (message.action === "remove") {
    removeOverlay();
    sendResponse({ ok: true });
  }

  return false;
});

init();
