import { create } from "zustand";
import type { ScannedScene } from "@/types/viewer";

interface ViewerState {
  // Scanned data from the GLTF file
  scannedScene: ScannedScene | null;
  setScannedScene: (scene: ScannedScene) => void;

  // Active selections
  activeVariantIndex: number;
  setActiveVariantIndex: (i: number) => void;

  activeCameraIndex: number; // -1 = orbit (default)
  setActiveCameraIndex: (i: number) => void;

  activeLightPreset: string;
  setActiveLightPreset: (id: string) => void;

  // UI
  activeTab: "texture" | "camera" | "light";
  setActiveTab: (tab: "texture" | "camera" | "light") => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  scannedScene: null,
  setScannedScene: (scene) => set({ scannedScene: scene }),

  activeVariantIndex: 0,
  setActiveVariantIndex: (i) => set({ activeVariantIndex: i }),

  activeCameraIndex: -1,
  setActiveCameraIndex: (i) => set({ activeCameraIndex: i }),

  activeLightPreset: "studio",
  setActiveLightPreset: (id) => set({ activeLightPreset: id }),

  activeTab: "texture",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
