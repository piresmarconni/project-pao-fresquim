"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const cameras = [
  { id: "CAM1", name: "Entrada Principal", src: "/entradaprincipal.png" },
  { id: "CAM2", name: "Balcao", src: "/balcao.png" },
  { id: "CAM3", name: "Cozinha | Estoque", src: "/estoque.png" },
  { id: "CAM4", name: "Caixa", src: "/caixa.png" },
];

export default function CameraPage() {
  const [tempo, setTempo] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTempo(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const horarioAtual = tempo.toLocaleTimeString("pt-BR");

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-2">
        {cameras.map((camera, index) => (
          <div
            key={camera.id}
            className="relative aspect-video overflow-hidden rounded-lg bg-zinc-950 shadow-md ring-1 ring-zinc-200"
          >
            <Image
              src={camera.src}
              alt={`Imagem da camera ${camera.id}`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 45vw, 90vw"
              className={`camera-feed object-cover grayscale contrast-125 ${
                index % 2 === 0 ? "camera-feed-left" : "camera-feed-right"
              }`}
            />

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:100%_4px] opacity-40" />
            <div className="camera-scan absolute inset-0 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
            <div className="absolute inset-0 bg-black/10" />

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-sm bg-black/80 px-3 py-1 text-sm font-bold uppercase text-white">
              <span className="h-3 w-3 animate-pulse rounded-full bg-red-600" />
              REC
            </div>

            <div className="absolute bottom-4 left-4 rounded-sm bg-black/80 px-3 py-1 font-mono text-xl font-bold text-white">
              {horarioAtual}
            </div>

            <div className="absolute bottom-4 right-4 rounded-sm bg-black/80 px-3 py-1 text-xl font-bold text-white">
              {camera.id}
            </div>

            <div className="absolute left-4 right-4 top-14 text-sm font-semibold uppercase tracking-wide text-white/80">
              {camera.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
