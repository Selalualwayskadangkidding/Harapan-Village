// src/components/SpriteAnimator.jsx
import { useEffect, useRef, useState } from "react";

/**
 * SpriteAnimator
 * - Render 1 spritesheet (grid) dengan cara menggeser background-position
 * - Default layout: 4 arah (down/up/right/left), masing-masing 4 frame (64x64)
 *
 * Props penting:
 *  - sheetUrl: path ke spritesheet png (mis. "/assets/characters/hero_walk.png")
 *  - direction: "down" | "up" | "right" | "left"
 *  - moving: true saat berjalan, false saat idle (frame 0)
 *  - frameWidth, frameHeight: ukuran 1 frame (default 64)
 *  - framesPerDirection: jumlah kolom/frame per baris (default 4)
 *  - fps: kecepatan animasi (default 8)
 *  - mirrorLeft: kalau true, baris "left" diambil dari "right" lalu di-flip X
 */
export default function SpriteAnimator({
  sheetUrl,
  direction = "down",
  moving = false,
  frameWidth = 64,
  frameHeight = 64,
  framesPerDirection = 4,
  fps = 8,
  directionsMap = { down: 0, up: 1, right: 2, left: 3 },
  mirrorLeft = false,
  style = {},
  className = "",
}) {
  const [frame, setFrame] = useState(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const accRef = useRef(0);

  // reset ke frame 0 tiap ganti arah / berhenti
  useEffect(() => {
    setFrame(0);
  }, [direction, moving]);

  useEffect(() => {
    const stepDuration = 1000 / Math.max(1, fps);

    const loop = (t) => {
      // Simpan timestamp pertama
      if (!lastTimeRef.current) lastTimeRef.current = t;

      // Kalau tidak bergerak, tetap loop ringan supaya responsive,
      // tapi tidak menaikkan frame.
      if (!moving) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dt = t - lastTimeRef.current;
      lastTimeRef.current = t;
      accRef.current += dt;

      while (accRef.current >= stepDuration) {
        setFrame((f) => (f + 1) % framesPerDirection);
        accRef.current -= stepDuration;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      accRef.current = 0;
    };
  }, [moving, fps, framesPerDirection]);

  // Tentukan baris (row) dari arah
  let row = directionsMap[direction] ?? 0;

  // Opsi hemat baris: pakai row "right" untuk "left" lalu flipX
  let flipX = false;
  if (mirrorLeft && direction === "left") {
    row = directionsMap["right"] ?? row;
    flipX = true;
  }

  const bgX = -frame * frameWidth;
  const bgY = -row * frameHeight;

  return (
    <div
      className={className}
      style={{
        width: frameWidth,
        height: frameHeight,
        imageRendering: "pixelated", // biar tajem untuk pixel art
        backgroundImage: `url(${sheetUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: `${bgX}px ${bgY}px`,
        transform: flipX ? "scaleX(-1)" : "none",
        transformOrigin: "center center",
        ...style,
      }}
      // aksesibilitas opsional
      role="img"
      aria-label={`sprite ${direction} frame ${frame}`}
    />
  );
}
