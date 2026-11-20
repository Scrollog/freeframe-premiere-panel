import { describe, expect, it } from "vitest";
import type { Asset, FolderNode } from "./types";
import { filterAndSortAssets, filterAndSortFolders } from "./browse-sort";

const folder = (id: string, name: string): FolderNode => ({ id, name, parent_id: null });

const asset = (name: string, created_at: string, duration = 0) =>
  ({
    id: name,
    name,
    created_at,
    latest_version: { files: [{ duration_seconds: duration }] },
  }) as unknown as Asset;

const names = (items: { name: string }[]) => items.map((item) => item.name);

describe("filterAndSortFolders", () => {
  const folders = [folder("b", "Batch 2"), folder("c", "Cuts"), folder("a", "Batch 10")];
  const createdAt = {
    a: "2026-03-01T00:00:00Z",
    b: "2026-01-01T00:00:00Z",
    c: "2026-02-01T00:00:00Z",
  };

  it("sorts by name", () => {
    expect(names(filterAndSortFolders(folders, "", "name", createdAt))).toEqual([
      "Batch 10",
      "Batch 2",
      "Cuts",
    ]);
  });

  it("sorts by date, newest or oldest first", () => {
    expect(names(filterAndSortFolders(folders, "", "newest", createdAt))).toEqual([
      "Batch 10",
      "Cuts",
      "Batch 2",
    ]);
    expect(names(filterAndSortFolders(folders, "", "oldest", createdAt))).toEqual([
      "Batch 2",
      "Cuts",
      "Batch 10",
    ]);
  });

  it("puts folders without a known date after the dated ones, by name", () => {
    expect(names(filterAndSortFolders(folders, "", "newest", { c: createdAt.c }))).toEqual([
      "Cuts",
      "Batch 10",
      "Batch 2",
    ]);
  });

  it("keeps folders by name when sorting by duration", () => {
    expect(names(filterAndSortFolders(folders, "", "duration", createdAt))).toEqual([
      "Batch 10",
      "Batch 2",
      "Cuts",
    ]);
  });

  it("filters by the search text, ignoring case", () => {
    expect(names(filterAndSortFolders(folders, "  batch ", "name"))).toEqual([
      "Batch 10",
      "Batch 2",
    ]);
  });

  it("does not reorder the folder tree it was given", () => {
    filterAndSortFolders(folders, "", "name");
    expect(names(folders)).toEqual(["Batch 2", "Cuts", "Batch 10"]);
  });
});

describe("filterAndSortAssets", () => {
  const assets = [
    asset("Intro", "2026-01-02T00:00:00Z", 30),
    asset("Outro", "2026-01-01T00:00:00Z", 90),
    asset("B-roll", "2026-01-03T00:00:00Z", 5),
  ];

  it("sorts by name, date and duration", () => {
    expect(names(filterAndSortAssets(assets, "", "name"))).toEqual(["B-roll", "Intro", "Outro"]);
    expect(names(filterAndSortAssets(assets, "", "newest"))).toEqual(["B-roll", "Intro", "Outro"]);
    expect(names(filterAndSortAssets(assets, "", "oldest"))).toEqual(["Outro", "Intro", "B-roll"]);
    expect(names(filterAndSortAssets(assets, "", "duration"))).toEqual(["Outro", "Intro", "B-roll"]);
  });

  it("filters by the search text", () => {
    expect(names(filterAndSortAssets(assets, "tro", "name"))).toEqual(["Intro", "Outro"]);
  });
});
