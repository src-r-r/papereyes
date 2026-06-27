/**
 * Noise texture generation utilities.
 * Pure functions that can be tested independently of the browser environment.
 */

/**
 * Generate random noise data as a Uint8ClampedArray.
 * Each pixel gets a random grayscale value.
 *
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {number} opacity - Noise intensity (0.0 to 1.0), controls value range
 * @returns {Uint8ClampedArray} Flat array of [R, G, B, A] values per pixel
 */
function generateNoiseData(width, height, opacity) {
  const pixelCount = width * height;
  const data = new Uint8ClampedArray(pixelCount * 4);

  const maxAlpha = Math.round(opacity * 255);

  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4;
    const noiseValue = Math.random() * 255;
    data[idx] = noiseValue;
    data[idx + 1] = noiseValue;
    data[idx + 2] = noiseValue;
    data[idx + 3] = Math.random() * maxAlpha;
  }

  return data;
}

/**
 * Apply a box-blur approximation to noise data.
 * Uses a simple multi-pass box filter as a Gaussian approximation.
 * For extension use, CSS filter is preferred, but this is available
 * for offline/baked texture generation.
 *
 * @param {Uint8ClampedArray} data - Pixel data (RGBA)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} radius - Blur radius in pixels
 * @returns {Uint8ClampedArray} Blurred pixel data
 */
function boxBlur(data, width, height, radius) {
  const output = new Uint8ClampedArray(data.length);
  const temp = new Uint8ClampedArray(data.length);

  const size = radius * 2 + 1;

  for (let pass = 0; pass < 3; pass++) {
    const src = pass === 0 ? data : temp;
    const dst = pass < 2 ? temp : output;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
        let count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const ni = (ny * width + nx) * 4;
              rSum += src[ni];
              gSum += src[ni + 1];
              bSum += src[ni + 2];
              aSum += src[ni + 3];
              count++;
            }
          }
        }

        const idx = (y * width + x) * 4;
        dst[idx] = rSum / count;
        dst[idx + 1] = gSum / count;
        dst[idx + 2] = bSum / count;
        dst[idx + 3] = aSum / count;
      }
    }
  }

  return output;
}

/**
 * Generate a tiled noise texture suitable for repeating overlay.
 * Creates a small tile that tiles seamlessly.
 *
 * @param {number} tileSize - Tile dimension (square) in pixels
 * @param {number} opacity - Noise intensity (0.0 to 1.0)
 * @returns {Uint8ClampedArray} Tile pixel data
 */
function generateNoiseTile(tileSize, opacity) {
  return generateNoiseData(tileSize, tileSize, opacity);
}

/**
 * Compute the CSS filter string for Gaussian blur.
 *
 * @param {number} blurRadius - Blur radius in CSS pixels
 * @returns {string} CSS filter declaration value
 */
function getBlurFilter(blurRadius) {
  return `blur(${blurRadius}px)`;
}

/**
 * Build the complete overlay style object for a canvas element.
 *
 * @param {object} params
 * @param {number} params.opacity - Overlay opacity
 * @param {number} params.blurRadius - CSS blur radius
 * @param {number} params.pointerEvents - Whether to block mouse events ("none" or "auto")
 * @returns {object} Style properties
 */
function buildOverlayStyle({ opacity, blurRadius, pointerEvents = "none" }) {
  return {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: pointerEvents,
    zIndex: "2147483647",
    opacity: String(opacity),
    filter: getBlurFilter(blurRadius),
    mixBlendMode: "multiply",
  };
}

module.exports = { generateNoiseData, boxBlur, generateNoiseTile, getBlurFilter, buildOverlayStyle };
