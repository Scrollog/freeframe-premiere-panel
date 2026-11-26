/** Reads the result of rendering inside Premiere (`Sequence.exportAsMediaDirect`). */

export interface DirectRenderResult {
  ok: boolean;
  error?: string;
  /** What exportAsMediaDirect returned, as a string. */
  raw?: string;
  /** Where the render was written: the preset's extension may replace ours. */
  outputPath?: string;
  /** Whether that file exists once the call returns. */
  exists?: boolean;
}

export type DirectRenderOutcome =
  | { ok: true; outputPath: string }
  | { ok: false; error: string };

/** Return values that mean success across Premiere versions and typings. */
const SUCCESS = ["", "true", "0", "no error", "undefined"];

/**
 * Premiere's return value differs by version: the docs say `true`, the
 * typings a string, older builds 0 or "No Error". The file on disk settles it
 * whenever the host could check; the return value is only a fallback.
 */
export const directRenderOutcome = (
  result: DirectRenderResult,
  requestedPath: string
): DirectRenderOutcome => {
  if (!result.ok) return { ok: false, error: result.error || "unknown error" };
  const outputPath = result.outputPath || requestedPath;
  const raw = (result.raw ?? "").trim();
  const reportedSuccess = SUCCESS.includes(raw.toLowerCase());
  if (result.exists === true) return { ok: true, outputPath };
  if (result.exists === false) {
    return {
      ok: false,
      error: reportedSuccess
        ? `no file was written to ${outputPath}`
        : `${raw} (no file was written to ${outputPath})`,
    };
  }
  return reportedSuccess ? { ok: true, outputPath } : { ok: false, error: raw };
};
