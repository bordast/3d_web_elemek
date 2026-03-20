"use client";

import dynamic from "next/dynamic";

const Viewer3D = dynamic(
  () => import("./Viewer3D").then((m) => ({ default: m.Viewer3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center text-white/30 text-sm">
        Loading viewer…
      </div>
    ),
  },
);

export { Viewer3D };
