import { describe, expect, it } from "vitest";
import { brandingReference } from "./branding";
describe("private branding authorization", () => {
  it("allows the business's own logo", () => {
    expect(brandingReference("tenant-a/logo.png", "tenant-a")).toBe("tenant-a/logo.png");
  });
  it("rejects another business's files", () => {
    expect(brandingReference("tenant-b/logo.png", "tenant-a")).toBeNull();
  });
  it("rejects encoded and nested paths", () => {
    for (const path of ["tenant-a/../tenant-b/logo.png", "tenant-a/%2e%2e", "tenant-a/logo.png?x=1"]) {
      expect(brandingReference(path, "tenant-a")).toBeNull();
    }
  });
  it("rejects executable and insecure URLs", () => {
    expect(brandingReference("javascript:alert(1)", "tenant-a")).toBeNull();
    expect(brandingReference("http://example.com/logo.png", "tenant-a")).toBeNull();
  });
});