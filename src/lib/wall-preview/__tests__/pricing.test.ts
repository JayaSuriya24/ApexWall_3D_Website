import { describe, expect, it } from "vitest";
import { estimatePrice, printPpi, resolutionVerdict } from "../pricing";

describe("estimatePrice", () => {
  it("uses siteConfig surface rate plus ink add-on", () => {
    const r = estimatePrice({ widthFt: 10, heightFt: 8, surface: "Bare Brick / Rough Plaster", ink: "3D Relief / Embossed Texture Print" });
    expect(r.areaSqFt).toBe(80);
    expect(r.ratePerSqFt).toBe(190);
    expect(r.total).toBe(15200);
    expect(r.printHours).toBeCloseTo(80 / 30);
  });

  it("prices only the printed part of a shaped artwork", () => {
    const r = estimatePrice({ widthFt: 10, heightFt: 10, surface: "Smooth Emulsion Wall", ink: "Standard CMYK", fillRatio: 0.5 });
    expect(r.areaSqFt).toBe(50);
    expect(r.total).toBe(6000);
  });
});

describe("resolution", () => {
  it("computes pixels per inch and a verdict", () => {
    expect(printPpi(4800, 10)).toBe(40);
    expect(resolutionVerdict(40)).toBe("good");
    expect(resolutionVerdict(25)).toBe("ok");
    expect(resolutionVerdict(10)).toBe("low");
  });
});
