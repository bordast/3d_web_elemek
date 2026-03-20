"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface CameraControllerProps {
  modelUrl: string;
  activeCameraIndex: number; // -1 = free orbit
}

/**
 * Switches between the free-orbit camera and any cameras embedded in the GLTF.
 * When in orbit mode it also auto-fits the model into view.
 */
export function CameraController({ modelUrl, activeCameraIndex }: CameraControllerProps) {
  const { camera, set, size } = useThree();
  const gltf = useGLTF(modelUrl) as GLTF;
  const orbitRef = useRef<OrbitControlsImpl>(null);

  // ── Auto-fit on first load ─────────────────────────────────────────────────
  useEffect(() => {
    if (!gltf.scene) return;

    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const bsphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = bsphere.radius;

    const perspCam = camera as THREE.PerspectiveCamera;
    const fovRad = (perspCam.fov ?? 50) * (Math.PI / 180);
    const dist = (radius / Math.sin(fovRad / 2)) * 1.2;

    camera.position.set(center.x, center.y + radius * 0.5, center.z + dist);
    camera.lookAt(center);

    if (orbitRef.current) {
      orbitRef.current.target.copy(center);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf.scene]);

  // ── Switch to embedded GLTF camera ────────────────────────────────────────
  useEffect(() => {
    if (activeCameraIndex === -1) {
      // Restore default perspective camera
      const defaultCam = new THREE.PerspectiveCamera(50, size.width / size.height, 0.01, 1000);
      set({ camera: defaultCam });
      return;
    }

    const gltfCam = gltf.cameras?.[activeCameraIndex];
    if (!gltfCam) return;

    // Find the scene node that holds this camera and copy its world transform
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Camera) === gltfCam) {
        gltfCam.updateWorldMatrix(true, false);
      }
    });

    set({ camera: gltfCam as THREE.PerspectiveCamera | THREE.OrthographicCamera });
  }, [activeCameraIndex, gltf.cameras, gltf.scene, set, size]);

  // ── Orbit controls — only active in free-orbit mode ───────────────────────
  return activeCameraIndex === -1 ? (
    <OrbitControls
      ref={orbitRef}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      minDistance={0.5}
      maxDistance={50}
    />
  ) : null;
}
