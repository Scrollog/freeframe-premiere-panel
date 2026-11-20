/** Search and "Sorted by" for the asset grid, applied to folders and assets alike. */
import type { Asset, FolderNode } from "./types";

export type BrowseSortKey = "name" | "newest" | "oldest" | "duration";

const matches = (name: string, query: string) => {
  const needle = query.trim().toLowerCase();
  return !needle || name.toLowerCase().includes(needle);
};

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

export const durationOf = (asset: Asset) =>
  asset.latest_version?.files?.[0]?.duration_seconds ?? 0;

export const filterAndSortAssets = (assets: Asset[], query: string, sort: BrowseSortKey): Asset[] =>
  assets
    .filter((asset) => matches(asset.name, query))
    .sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.created_at.localeCompare(a.created_at);
        case "oldest":
          return a.created_at.localeCompare(b.created_at);
        case "duration":
          return durationOf(b) - durationOf(a);
        default:
          return byName(a, b);
      }
    });

/**
 * Folders follow the same search and sort as the assets below them. The folder
 * tree carries no dates, so `createdAt` maps folder id → created_at from the
 * folder list; a folder missing from it sorts after the dated ones. Folders
 * have no duration, so that sort keeps them by name.
 */
export const filterAndSortFolders = (
  folders: FolderNode[],
  query: string,
  sort: BrowseSortKey,
  createdAt: Record<string, string> = {}
): FolderNode[] =>
  folders
    .filter((folder) => matches(folder.name, query))
    .sort((a, b) => {
      if (sort === "newest" || sort === "oldest") {
        const left = createdAt[a.id];
        const right = createdAt[b.id];
        if (left && right && left !== right) {
          return sort === "newest" ? right.localeCompare(left) : left.localeCompare(right);
        }
        if (left && !right) return -1;
        if (!left && right) return 1;
      }
      return byName(a, b);
    });
