import { describe, expect, it } from "vitest";
import { fitWithin, MAX_FILE_BYTES, validateImageFile } from "../image";

const file = (name: string, type: string, size = 1000) => ({ name, type, size });

describe("validateImageFile", () => {
  it("accepts JPG, PNG and WebP", () => {
    for (const t of ["image/jpeg", "image/png", "image/webp"]) expect(validateImageFile(file("a", t)).ok).toBe(true);
  });

  it("explains HEIC photos", () => {
    const r = validateImageFile(file("IMG_0001.HEIC", ""));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatch(/HEIC/);
  });

  it("rejects other types, oversize files and no file", () => {
    const pdf = validateImageFile(file("a.pdf", "application/pdf"));
    expect(!pdf.ok && pdf.error).toMatch(/JPG, PNG or WebP/);
    const big = validateImageFile(file("a.jpg", "image/jpeg", MAX_FILE_BYTES + 1));
    expect(!big.ok && big.error).toMatch(/limit/);
    expect(validateImageFile(null).ok).toBe(false);
  });
});

describe("fitWithin", () => {
  it("only ever shrinks", () => {
    expect(fitWithin(4000, 3000, 2048)).toEqual({ width: 2048, height: 1536 });
    expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 });
  });
});
