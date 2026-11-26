import { describe, expect, it } from "vitest";
import { directRenderOutcome } from "./render-result";

const requested = "C:/renders/cut.mp4";

describe("directRenderOutcome", () => {
  it.each(["true", "0", "No Error", "undefined", ""])(
    "treats %j with the file on disk as success",
    (raw) => {
      expect(directRenderOutcome({ ok: true, raw, exists: true }, requested)).toEqual({
        ok: true,
        outputPath: requested,
      });
    }
  );

  it("uploads from the path the host actually wrote", () => {
    expect(
      directRenderOutcome(
        { ok: true, raw: "true", exists: true, outputPath: "C:/renders/cut.mov" },
        requested
      )
    ).toEqual({ ok: true, outputPath: "C:/renders/cut.mov" });
  });

  it("trusts the file over an unexpected return value", () => {
    expect(directRenderOutcome({ ok: true, raw: "1", exists: true }, requested).ok).toBe(true);
  });

  it("fails when no file was written, even if Premiere reported success", () => {
    expect(directRenderOutcome({ ok: true, raw: "true", exists: false }, requested)).toEqual({
      ok: false,
      error: `no file was written to ${requested}`,
    });
    expect(directRenderOutcome({ ok: true, raw: "false", exists: false }, requested)).toEqual({
      ok: false,
      error: `false (no file was written to ${requested})`,
    });
  });

  it("falls back to the return value when the file could not be checked", () => {
    expect(directRenderOutcome({ ok: true, raw: "true" }, requested).ok).toBe(true);
    expect(directRenderOutcome({ ok: true, raw: "false" }, requested)).toEqual({
      ok: false,
      error: "false",
    });
  });

  it("passes host errors through", () => {
    expect(directRenderOutcome({ ok: false, error: "no_sequence" }, requested)).toEqual({
      ok: false,
      error: "no_sequence",
    });
  });
});
