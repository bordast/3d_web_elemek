export interface MaterialVariant {
  name: string;
  index: number;
}

export interface SceneCamera {
  name: string;
  index: number;
  /** "perspective" | "orthographic" | "orbit" (the default free-roam camera) */
  type: "perspective" | "orthographic" | "orbit";
}

export interface LightPreset {
  id: string;
  label: string;
}

export interface ScannedScene {
  variants: MaterialVariant[];
  cameras: SceneCamera[];
  hasEmbeddedLights: boolean;
}

export const LIGHT_PRESETS: LightPreset[] = [
  { id: "studio",   label: "Studio"   },
  { id: "outdoor",  label: "Outdoor"  },
  { id: "dramatic", label: "Dramatic" },
  { id: "soft",     label: "Soft"     },
];
