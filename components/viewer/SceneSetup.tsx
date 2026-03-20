"use client";

import { useRef } from "react";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface SceneSetupProps {
  lightPreset: string;
  hasEmbeddedLights: boolean;
}

/**
 * Manages environment + dynamic lights based on the active preset.
 * If the GLTF has embedded lights we skip adding extra ones.
 */
export function SceneSetup({ lightPreset, hasEmbeddedLights }: SceneSetupProps) {
  const keyRef  = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef  = useRef<THREE.DirectionalLight>(null);

  // Slowly animate key-light position for a polished feel
  useFrame(({ clock }) => {
    if (!keyRef.current) return;
    const t = clock.getElapsedTime() * 0.15;
    keyRef.current.position.x = Math.sin(t) * 5;
    keyRef.current.position.z = Math.cos(t) * 5;
  });

  const presets: Record<string, {
    envPreset: "studio" | "sunset" | "dawn" | "city";
    envIntensity: number;
    ambientIntensity: number;
    keyColor: string;
    keyIntensity: number;
    fillIntensity: number;
    rimIntensity: number;
  }> = {
    studio: {
      envPreset: "studio",
      envIntensity: 0.6,
      ambientIntensity: 0.4,
      keyColor: "#ffffff",
      keyIntensity: 1.4,
      fillIntensity: 0.5,
      rimIntensity: 0.8,
    },
    outdoor: {
      envPreset: "sunset",
      envIntensity: 1.0,
      ambientIntensity: 0.6,
      keyColor: "#fff8e1",
      keyIntensity: 2.0,
      fillIntensity: 0.4,
      rimIntensity: 0.3,
    },
    dramatic: {
      envPreset: "dawn",
      envIntensity: 0.3,
      ambientIntensity: 0.1,
      keyColor: "#ffd580",
      keyIntensity: 3.0,
      fillIntensity: 0.1,
      rimIntensity: 1.5,
    },
    soft: {
      envPreset: "city",
      envIntensity: 0.8,
      ambientIntensity: 1.0,
      keyColor: "#e8eaf6",
      keyIntensity: 0.6,
      fillIntensity: 0.8,
      rimIntensity: 0.3,
    },
  };

  const cfg = presets[lightPreset] ?? presets.studio;

  return (
    <>
      <Environment preset={cfg.envPreset} environmentIntensity={cfg.envIntensity} />
      <ContactShadows
        position={[0, -1.1, 0]}
        opacity={0.35}
        scale={6}
        blur={2}
        far={3}
      />

      {!hasEmbeddedLights && (
        <>
          <ambientLight intensity={cfg.ambientIntensity} />

          {/* Key light */}
          <directionalLight
            ref={keyRef}
            position={[4, 5, 4]}
            intensity={cfg.keyIntensity}
            color={cfg.keyColor}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Fill light */}
          <directionalLight
            ref={fillRef}
            position={[-4, 2, -2]}
            intensity={cfg.fillIntensity}
            color="#cce8ff"
          />

          {/* Rim light */}
          <directionalLight
            ref={rimRef}
            position={[0, -2, -5]}
            intensity={cfg.rimIntensity}
            color="#ffffff"
          />
        </>
      )}
    </>
  );
}
