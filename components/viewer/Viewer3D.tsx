"use client";

import { Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useViewerStore } from "@/store/viewerStore";
import { Model } from "./Model";
import { SceneSetup } from "./SceneSetup";
import { CameraController } from "./CameraController";
import { ViewerUI } from "./ViewerUI";
import type { ScannedScene } from "@/types/viewer";

interface Viewer3DProps {
  /** Path or URL to the GLB/GLTF file */
  modelUrl: string;
  /** Optional fixed height class, defaults to h-[600px] */
  className?: string;
}

/**
 * Self-contained 3D viewer component.
 * Drop it anywhere in your Next.js app — it will scan the GLTF and
 * auto-populate texture / camera / light controls.
 *
 * Usage:
 *   <Viewer3D modelUrl="/kocka.glb" />
 */
export function Viewer3D({ modelUrl, className = "h-[600px]" }: Viewer3DProps) {
  const {
    setScannedScene,
    activeVariantIndex,
    activeCameraIndex,
    activeLightPreset,
    scannedScene,
  } = useViewerStore();

  const handleScanned = useCallback(
    (scene: ScannedScene) => setScannedScene(scene),
    [setScannedScene],
  );

  return (
    <div className={`relative w-full ${className} bg-neutral-950 rounded-2xl overflow-hidden`}>
      <Canvas
        shadows
        camera={{ fov: 50, near: 0.01, far: 1000, position: [3, 2, 5] }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
      >
        <color attach="background" args={["#0a0a0f"]} />

        <SceneSetup
          lightPreset={activeLightPreset}
          hasEmbeddedLights={scannedScene?.hasEmbeddedLights ?? false}
        />

        <CameraController
          modelUrl={modelUrl}
          activeCameraIndex={activeCameraIndex}
        />

        <Suspense fallback={null}>
          <Model
            url={modelUrl}
            activeVariantIndex={activeVariantIndex}
            onScanned={handleScanned}
          />
        </Suspense>
      </Canvas>

      {/* Overlay controls — rendered outside Canvas so normal React/DOM works */}
      <ViewerUI />

      {/* Loading indicator */}
      {!scannedScene && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
          Loading model…
        </div>
      )}
    </div>
  );
}
