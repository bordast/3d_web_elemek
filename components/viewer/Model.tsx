"use client";

import { useEffect, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import type { ScannedScene, MaterialVariant, SceneCamera } from "@/types/viewer";

// ─── GLTF variants extension types ───────────────────────────────────────────
interface KHRMaterialsVariantsExtension {
  variants: { name: string }[];
}

interface KHRMappingValue {
  material: number;
  variants: number[];
}

interface KHRMappingExtension {
  mappings: KHRMappingValue[];
}

// ─── Built-in fallback variant names ─────────────────────────────────────────
const FALLBACK_VARIANTS: MaterialVariant[] = [
  { name: "Default",   index: 0 },
  { name: "Wireframe", index: 1 },
  { name: "UV Grid",   index: 2 },
];

/** Cache for generated UV-grid and wireframe materials so we don't recreate them on every render */
let uvGridMaterial: THREE.MeshStandardMaterial | null = null;
let wireframeMaterial: THREE.MeshStandardMaterial | null = null;

function getUvGridMaterial(): THREE.MeshStandardMaterial {
  if (!uvGridMaterial) {
    // Procedural UV grid via canvas texture
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const divisions = 8;
    const cellSize = size / divisions;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i <= divisions; i++) {
      const pos = i * cellSize;
      const isMajor = i % 2 === 0;
      ctx.strokeStyle = isMajor ? "#00d4ff" : "#004466";
      ctx.lineWidth   = isMajor ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(pos, 0); ctx.lineTo(pos, size); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos); ctx.lineTo(size, pos); ctx.stroke();
    }

    // Coloured corner markers
    const corners = [
      { x: 0,    y: 0,    color: "#ff4444" },
      { x: size, y: 0,    color: "#44ff44" },
      { x: 0,    y: size, color: "#4444ff" },
      { x: size, y: size, color: "#ffff44" },
    ];
    corners.forEach(({ x, y, color }) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, cellSize * 0.18, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    uvGridMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.0,
    });
  }
  return uvGridMaterial;
}

function getWireframeMaterial(): THREE.MeshStandardMaterial {
  if (!wireframeMaterial) {
    wireframeMaterial = new THREE.MeshStandardMaterial({
      color: "#00ff88",
      wireframe: true,
      emissive: "#00ff88",
      emissiveIntensity: 0.3,
    });
  }
  return wireframeMaterial;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ModelProps {
  url: string;
  activeVariantIndex: number;
  onScanned: (scene: ScannedScene) => void;
}

export function Model({ url, activeVariantIndex, onScanned }: ModelProps) {
  const gltf = useGLTF(url) as GLTF & {
    parser?: {
      json: { extensions?: { KHR_materials_variants?: KHRMaterialsVariantsExtension } };
      getDependency: (type: string, index: number) => Promise<THREE.Material>;
    };
  };

  const scannedRef = useRef(false);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());

  // ── 1. Scan the scene once after load ──────────────────────────────────────
  const { variants, hasKHRVariants } = useMemo(() => {
    const ext = gltf.parser?.json?.extensions?.KHR_materials_variants;
    if (ext?.variants?.length) {
      return {
        variants: ext.variants.map((v: { name: string }, i: number) => ({ name: v.name, index: i })) as MaterialVariant[],
        hasKHRVariants: true,
      };
    }
    return { variants: FALLBACK_VARIANTS, hasKHRVariants: false };
  }, [gltf.parser]);

  const cameras = useMemo<SceneCamera[]>(() => {
    const list: SceneCamera[] = [{ name: "Free Orbit", index: -1, type: "orbit" }];
    gltf.cameras?.forEach((cam, i) => {
      list.push({
        name: cam.name || `Camera ${i + 1}`,
        index: i,
        type: cam.type === "OrthographicCamera" ? "orthographic" : "perspective",
      });
    });
    return list;
  }, [gltf.cameras]);

  const hasEmbeddedLights = useMemo(() => {
    let found = false;
    gltf.scene?.traverse((obj) => {
      if ((obj as THREE.Light).isLight) found = true;
    });
    return found;
  }, [gltf.scene]);

  useEffect(() => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    onScanned({ variants, cameras, hasEmbeddedLights });
  }, [variants, cameras, hasEmbeddedLights, onScanned]);

  // ── 2. Save original materials on first render ─────────────────────────────
  useEffect(() => {
    gltf.scene?.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && !originalMaterialsRef.current.has(mesh)) {
        originalMaterialsRef.current.set(mesh, mesh.material);
      }
    });
  }, [gltf.scene]);

  // ── 3. Apply material variant when selection changes ───────────────────────
  useEffect(() => {
    if (!gltf.scene) return;

    const applyKHRVariant = async (variantIndex: number) => {
      if (!gltf.parser) return;

      const meshes: THREE.Mesh[] = [];
      gltf.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
      });

      for (const mesh of meshes) {
        const mappingExt = (mesh.userData as { gltfExtensions?: { KHR_materials_variants?: KHRMappingExtension } })
          .gltfExtensions?.KHR_materials_variants;
        if (!mappingExt) continue;

        for (const mapping of mappingExt.mappings) {
          if (mapping.variants.includes(variantIndex)) {
            const mat = await gltf.parser!.getDependency("material", mapping.material);
            mesh.material = mat;
            break;
          }
        }
      }
    };

    const applyFallbackVariant = (index: number) => {
      gltf.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;

        const original = originalMaterialsRef.current.get(mesh);

        if (index === 0) {
          // Default — restore original
          if (original) mesh.material = original;
        } else if (index === 1) {
          // Wireframe
          mesh.material = getWireframeMaterial();
        } else if (index === 2) {
          // UV Grid
          mesh.material = getUvGridMaterial();
        }
      });
    };

    if (hasKHRVariants) {
      applyKHRVariant(activeVariantIndex);
    } else {
      applyFallbackVariant(activeVariantIndex);
    }
  }, [activeVariantIndex, hasKHRVariants, gltf.scene, gltf.parser]);

  return <primitive object={gltf.scene} />;
}
