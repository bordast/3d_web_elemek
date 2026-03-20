import { Viewer3D } from "@/components/viewer/ViewerLoader";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold text-white tracking-tight">3D Viewer</h1>
        <p className="text-white/40 text-sm mt-1">
          Drag to orbit · Scroll to zoom · Switch textures, cameras and lights below
        </p>
      </header>

      <div className="w-full max-w-4xl h-[600px]">
        <Viewer3D modelUrl="/kocka.glb" className="h-[600px]" />
      </div>
    </main>
  );
}
