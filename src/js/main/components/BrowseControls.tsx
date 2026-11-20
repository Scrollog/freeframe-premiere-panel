/** The "Appearance" and "Sorted by" controls shared by both browse grids. */
import type { CSSProperties } from "react";
import { useApp } from "../state";
import { Dropdown, MenuRadio } from "./Dropdown";
import { IconAppearance, IconSortArrows } from "./Icons";
import type { Settings } from "../../lib/freeframe/settings";

type CardSize = Settings["cardSize"];
type CardAspect = Settings["cardAspect"];

const SIZES: { key: CardSize; label: string; width: number }[] = [
  { key: "small", label: "Small", width: 118 },
  { key: "medium", label: "Medium", width: 170 },
  { key: "large", label: "Large", width: 240 },
];

const ASPECTS: { key: CardAspect; label: string; ratio: string }[] = [
  { key: "landscape", label: "Landscape 16:9", ratio: "16 / 9" },
  { key: "square", label: "Square 1:1", ratio: "1 / 1" },
  { key: "portrait", label: "Portrait 9:16", ratio: "9 / 16" },
];

/** Grid track width for the chosen size — cards no longer size themselves. */
export const cardMinWidth = (size: CardSize): number =>
  SIZES.find((entry) => entry.key === size)?.width ?? 170;

/** Grid style for the chosen size and shape; `.poster` reads `--card-aspect`. */
export const cardGridStyle = (settings: Settings): CSSProperties =>
  ({
    gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${cardMinWidth(
      settings.cardSize
    )}px), 1fr))`,
    "--card-aspect": ASPECTS.find((entry) => entry.key === settings.cardAspect)?.ratio ?? "1 / 1",
  }) as CSSProperties;

export const AppearanceMenu = () => {
  const { settings, updateSettings } = useApp();
  return (
    <Dropdown
      align="left"
      triggerClass="bar-btn"
      trigger={
        <>
          <IconAppearance width={14} height={14} />
          Appearance
        </>
      }
    >
      {(close) => (
        <>
          <div className="menu-sep">Card size</div>
          {SIZES.map((size) => (
            <MenuRadio
              key={size.key}
              label={size.label}
              checked={settings.cardSize === size.key}
              onSelect={() => {
                updateSettings({ cardSize: size.key });
                close();
              }}
            />
          ))}
          <div className="menu-sep">Aspect ratio</div>
          {ASPECTS.map((aspect) => (
            <MenuRadio
              key={aspect.key}
              label={aspect.label}
              checked={settings.cardAspect === aspect.key}
              onSelect={() => {
                updateSettings({ cardAspect: aspect.key });
                close();
              }}
            />
          ))}
        </>
      )}
    </Dropdown>
  );
};

export const SortedByMenu = <Key extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: Key; label: string }[];
  value: Key;
  onChange: (key: Key) => void;
}) => (
  <Dropdown
    align="left"
    triggerClass="bar-btn"
    title="Sort by"
    trigger={
      <>
        <IconSortArrows width={14} height={14} />
        Sorted by <strong>{options.find((o) => o.key === value)?.label}</strong>
      </>
    }
  >
    {(close) =>
      options.map((option) => (
        <MenuRadio
          key={option.key}
          label={option.label}
          checked={value === option.key}
          onSelect={() => {
            onChange(option.key);
            close();
          }}
        />
      ))
    }
  </Dropdown>
);
