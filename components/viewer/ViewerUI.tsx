"use client";

import { useViewerStore } from "@/store/viewerStore";
import { LIGHT_PRESETS } from "@/types/viewer";
import { CameraIcon, SunIcon, SwatchIcon } from "./icons";

export function ViewerUI() {
  const {
    scannedScene,
    activeTab, setActiveTab,
    activeVariantIndex, setActiveVariantIndex,
    activeCameraIndex, setActiveCameraIndex,
    activeLightPreset, setActiveLightPreset,
  } = useViewerStore();

  if (!scannedScene) return null;

  const tabs = [
    { id: "texture" as const, label: "Texture", Icon: SwatchIcon },
    { id: "camera"  as const, label: "Camera",  Icon: CameraIcon },
    { id: "light"   as const, label: "Light",   Icon: SunIcon    },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">

      {/* Option pills */}
      <div className="pointer-events-auto bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 flex gap-2 flex-wrap justify-center max-w-[90vw]">
        {activeTab === "texture" &&
          scannedScene.variants.map((v) => (
            <OptionPill
              key={v.index}
              label={v.name}
              active={activeVariantIndex === v.index}
              onClick={() => setActiveVariantIndex(v.index)}
            />
          ))}

        {activeTab === "camera" &&
          scannedScene.cameras.map((c) => (
            <OptionPill
              key={c.index}
              label={c.name}
              active={activeCameraIndex === c.index}
              onClick={() => setActiveCameraIndex(c.index)}
            />
          ))}

        {activeTab === "light" &&
          LIGHT_PRESETS.map((p) => (
            <OptionPill
              key={p.id}
              label={p.label}
              active={activeLightPreset === p.id}
              onClick={() => setActiveLightPreset(p.id)}
            />
          ))}
      </div>

      {/* Tab bar */}
      <div className="pointer-events-auto bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl flex overflow-hidden">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-white/15 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-white text-black shadow-lg scale-105"
          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
