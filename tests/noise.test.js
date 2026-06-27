/** @jest-environment jsdom */

const {
  generateNoiseData,
  boxBlur,
  generateNoiseTile,
  getBlurFilter,
  buildOverlayStyle,
} = require("../src/lib/noise.js");

describe("generateNoiseData", () => {
  test("returns correct array length", () => {
    const width = 4;
    const height = 4;
    const data = generateNoiseData(width, height, 1.0);
    expect(data.length).toBe(width * height * 4);
  });

  test("returns Uint8ClampedArray", () => {
    const data = generateNoiseData(2, 2, 0.5);
    expect(data).toBeInstanceOf(Uint8ClampedArray);
  });

  test("alpha channel respects opacity parameter", () => {
    const data = generateNoiseData(10, 10, 0.0);
    for (let i = 3; i < data.length; i += 4) {
      expect(data[i]).toBe(0);
    }
  });

  test("alpha values are within range at full opacity", () => {
    const data = generateNoiseData(100, 100, 1.0);
    for (let i = 3; i < data.length; i += 4) {
      expect(data[i]).toBeGreaterThanOrEqual(0);
      expect(data[i]).toBeLessThanOrEqual(255);
    }
  });

  test("grayscale channels are equal per pixel", () => {
    const data = generateNoiseData(4, 4, 1.0);
    for (let i = 0; i < data.length; i += 4) {
      expect(data[i]).toBe(data[i + 1]);
      expect(data[i]).toBe(data[i + 2]);
    }
  });
});

describe("generateNoiseTile", () => {
  test("generates square tile data", () => {
    const tileSize = 8;
    const data = generateNoiseTile(tileSize, 0.5);
    expect(data.length).toBe(tileSize * tileSize * 4);
  });
});

describe("getBlurFilter", () => {
  test("returns correct CSS filter string", () => {
    expect(getBlurFilter(1)).toBe("blur(1px)");
    expect(getBlurFilter(0)).toBe("blur(0px)");
    expect(getBlurFilter(2.5)).toBe("blur(2.5px)");
  });
});

describe("buildOverlayStyle", () => {
  test("returns style with correct properties", () => {
    const style = buildOverlayStyle({ opacity: 0.3, blurRadius: 1 });
    expect(style.position).toBe("fixed");
    expect(style.opacity).toBe("0.3");
    expect(style.filter).toBe("blur(1px)");
    expect(style.pointerEvents).toBe("none");
    expect(style.mixBlendMode).toBe("multiply");
  });

  test("respects custom pointerEvents", () => {
    const style = buildOverlayStyle({
      opacity: 0.5,
      blurRadius: 0,
      pointerEvents: "auto",
    });
    expect(style.pointerEvents).toBe("auto");
  });

  test("uses max z-index", () => {
    const style = buildOverlayStyle({ opacity: 0.5, blurRadius: 0 });
    expect(style.zIndex).toBe("2147483647");
  });
});

describe("boxBlur", () => {
  test("returns same-length array", () => {
    const width = 4;
    const height = 4;
    const data = generateNoiseData(width, height, 1.0);
    const blurred = boxBlur(data, width, height, 1);
    expect(blurred.length).toBe(data.length);
  });

  test("returns Uint8ClampedArray", () => {
    const data = generateNoiseData(4, 4, 1.0);
    const blurred = boxBlur(data, 4, 4, 1);
    expect(blurred).toBeInstanceOf(Uint8ClampedArray);
  });

  test("blurs uniform input to same uniform output", () => {
    const width = 4;
    const height = 4;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i++) {
      data[i] = 128;
    }
    const blurred = boxBlur(data, width, height, 2);
    for (let i = 0; i < blurred.length; i++) {
      expect(blurred[i]).toBeCloseTo(128, 0);
    }
  });

  test("radius 0 returns unchanged data", () => {
    const width = 4;
    const height = 4;
    const data = generateNoiseData(width, height, 1.0);
    const blurred = boxBlur(data, width, height, 0);
    expect(Array.from(blurred)).toEqual(Array.from(data));
  });
});
