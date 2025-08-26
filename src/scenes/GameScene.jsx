import { useEffect, useRef, useState } from "react";
import TypingText from "../components/typingText";

const COLLISION_ENABLED = false; // set ke true kalau mau aktifkan collision dari Tiled

const GameScene = ({ onBackHome, hasUsedKey, setHasUsedKey }) => {
  // ====== UI STATES ======
  const [showText, setShowText] = useState(false);
  const [textFinished, setTextFinished] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [notification, setNotification] = useState("");
  const [direction, setDirection] = useState("down");
  const [step, setStep] = useState(1); // 1-2 buat animasi kaki
  const [inventory, setInventory] = useState(["Kunci Rumah Tua"]);
  const [trashItems, setTrashItems] = useState([
    { id: 1, name: "Botol Plastik", x: 400, y: 300, taken: false },
    { id: 2, name: "Kertas", x: 460, y: 350, taken: false },
    { id: 3, name: "Kaleng", x: 500, y: 250, taken: false },
  ]);

  // ====== REFS (tidak memicu re-render) ======
  const keysPressed = useRef({});
  const spriteRef = useRef(null);
  const posRef = useRef({ x: 300, y: 300 }); // posisi player (logika & visual)
  const movingRef = useRef(false); // status bergerak saat ini
  const obstaclesRef = useRef([]); // collision boxes

  // ====== KONSTAN/OBJECTS DUNIA ======
  const maxTrash = 3;
  const SPEED = 180; // px/detik (rasa jalan)
  const portal = { x: 550, y: 150 };
  const trashBin = { x: 150, y: 100 };
  const interactable = { x: 320, y: 120 };

  // ====== UTIL ======
  const showNotification = (text) => {
    setNotification(text);
    // reset timer: kalau ada notif sebelumnya, ganti yang baru dan reset waktu
    if (showNotification._tid) clearTimeout(showNotification._tid);
    showNotification._tid = setTimeout(() => setNotification(""), 2000);
  };

  const spriteFrames = {
    down: ["backleft.png"],
    up: ["frontleft.png"],
    right: ["kanan3rev.png"],
    left: ["kirifix.png"],
  };

  const getCharacterSprite = (dir, step) => {
    const frames = spriteFrames[dir] || spriteFrames.down;
    return frames[(step - 1) % frames.length];
  };

  const distance = (ax, ay, bx, by) => {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.hypot(dx, dy);
  };

  const isColliding = (x, y, width, height, obstaclesArr) => {
    return obstaclesArr.some(
      (ob) =>
        x < ob.x + ob.width &&
        x + width > ob.x &&
        y < ob.y + ob.height &&
        y + height > ob.y
    );
  };

  // ====== LOAD COLLISION (opsional) ======
  useEffect(() => {
    if (!COLLISION_ENABLED) {
      obstaclesRef.current = [];
      return;
    }
    fetch("/assets/maps/mainmap1.json")
      .then((res) => res.json())
      .then((data) => {
        const collisionLayer = data.layers.find((l) => l.name === "Collision");
        const parsed =
          collisionLayer?.objects.map((obj) => ({
            x: obj.x,
            y: obj.y,
            width: obj.width,
            height: obj.height,
          })) || [];
        obstaclesRef.current = parsed;
      })
      .catch((err) => {
        console.error("Gagal load JSON map:", err);
        obstaclesRef.current = [];
      });
  }, []);

  // ====== INPUT HANDLERS ======
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === "i") {
        setShowInventory((p) => !p);
        return;
      }

      if (key === "e") {
        // Interaksi E: portal / trashbin / pickup
        const { x, y } = posRef.current;

        // Portal
        if (distance(x, y, portal.x, portal.y) < 50) {
          if (hasUsedKey) {
            onBackHome();
          } else {
            showNotification("Memerlukan kunci");
            setShowInventory(true);
          }
        }

        // Trash Bin (buka inventory kalau ada item selain kunci)
        if (
          distance(x, y, trashBin.x, trashBin.y) < 50 &&
          inventory.some((item) => item !== "Kunci Rumah Tua")
        ) {
          setShowInventory(true);
        }

        // Pickup trash
        setTrashItems((prev) => {
          // salin dulu biar aman
          const next = prev.map((t) => ({ ...t }));
          for (const trash of next) {
            if (
              !trash.taken &&
              distance(x, y, trash.x, trash.y) < 30 &&
              inventory.length < maxTrash + 1 // +1 karena sudah ada "Kunci Rumah Tua"
            ) {
              trash.taken = true;
              setInventory((inv) => [...inv, trash.name]);
              showNotification(`${trash.name} diambil`);
            }
          }
          return next;
        });

        return;
      }

      if (key === "q") {
        const { x, y } = posRef.current;
        if (distance(x, y, interactable.x, interactable.y) < 50 && !showText) {
          setShowText(true);
          setTextFinished(false);
        }
        return;
      }

      // WASD untuk gerak
      keysPressed.current[key] = true;
    };

    const onKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [showText, showInventory, hasUsedKey, onBackHome, inventory]);

  // ====== GAME LOOP (RAF) ======
  useEffect(() => {
    let rafId;
    let last = performance.now();

    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      let dx = 0;
      let dy = 0;

      // ketika UI blocking (dialog atau inventory), tidak bergerak
      const canMove = !showText && !showInventory;

      if (canMove) {
        if (keysPressed.current["w"]) {
          dy -= 1;
          setDirection((d) => (d === "up" ? d : "up"));
        }
        if (keysPressed.current["s"]) {
          dy += 1;
          setDirection((d) => (d === "down" ? d : "down"));
        }
        if (keysPressed.current["a"]) {
          dx -= 1;
          setDirection((d) => (d === "left" ? d : "left"));
        }
        if (keysPressed.current["d"]) {
          dx += 1;
          setDirection((d) => (d === "right" ? d : "right"));
        }
      }

      // Normalisasi diagonal
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
      }

      // Hitbox untuk collision (disesuaikan dengan sprite)
      const hitboxOffsetX = 60;
      const hitboxOffsetY = 110;
      const hitboxWidth = 30;
      const hitboxHeight = 30;

      // Hitung next pos
      const curr = posRef.current;
      let nextX = curr.x + dx * SPEED * dt;
      let nextY = curr.y + dy * SPEED * dt;

      // Cek collision kalau aktif
      if (COLLISION_ENABLED && len > 0) {
        const willCollide = isColliding(
          nextX + hitboxOffsetX,
          nextY + hitboxOffsetY,
          hitboxWidth,
          hitboxHeight,
          obstaclesRef.current
        );
        if (willCollide) {
          // coba pecah per-aksi: prioritas tetap cegah tembus dinding
          nextX = curr.x;
          nextY = curr.y;
        }
      }

      // Commit pos
      if (len > 0 || nextX !== curr.x || nextY !== curr.y) {
        posRef.current = { x: nextX, y: nextY };

        // Update visual TANPA re-render
        if (spriteRef.current) {
          // Anchor di kaki: translate lalu geser anchor jika mau
          spriteRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
        }
      }

      // Update movingRef & sedikit kurangi re-render:
      const movingNow = len > 0 && canMove;
      if (movingRef.current !== movingNow) {
        movingRef.current = movingNow;
        // Trigger animasi kaki effect (di bawah akan baca movingRef.current)
        setToggleAnimFlag((f) => !f); // trik kecil agar effect re-run
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [showText, showInventory]);

  // ====== ANIMASI KAKI TERPISAH (8–10 fps) ======
  const [toggleAnimFlag, setToggleAnimFlag] = useState(false);
  useEffect(() => {
    let id;
    const tick = () => setStep((p) => (p === 1 ? 2 : 1));

    if (movingRef.current && !showText && !showInventory) {
      id = setInterval(tick, 130);
    } else {
      setStep(1);
    }

    return () => clearInterval(id);
  }, [toggleAnimFlag, showText, showInventory]);

  // ====== RENDER ======
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: 'url("/assets/maps/mainmapfix.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Marker dev (hapus bila pakai objek asli) */}
      <div
        style={{
          position: "absolute",
          top: interactable.y,
          left: interactable.x,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "yellow",
          border: "2px solid black",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: portal.y,
          left: portal.x,
          width: 25,
          height: 25,
          borderRadius: "50%",
          backgroundColor: "lime",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: trashBin.y,
          left: trashBin.x,
          width: 25,
          height: 25,
          borderRadius: "50%",
          backgroundColor: "red",
          zIndex: 1,
        }}
      />

      {trashItems.map(
        (trash) =>
          !trash.taken && (
            <div
              key={trash.id}
              style={{
                position: "absolute",
                top: trash.y,
                left: trash.x,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "gray",
              }}
            />
          )
      )}

      {/* SPRITE PLAYER: transform GPU */}
      <img
        ref={spriteRef}
        src={`/assets/characters/${getCharacterSprite(direction, step)}`}
        alt="player"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 150,
          height: 150,
          zIndex: 2,
          transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`,
          willChange: "transform",
          imageRendering: "pixelated",
          pointerEvents: "none",
          // (opsional) anchor di kaki:
          // transformOrigin: "50% 100%",
        }}
      />

      {/* DIALOG */}
      {showText && (
        <div
          onClick={() => {
            if (textFinished) setShowText(false);
          }}
          style={{
            position: "absolute",
            bottom: "5%",
            left: "5%",
            right: "5%",
            zIndex: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "1rem",
            borderRadius: "10px",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          <TypingText
            text="Hmm... sepertinya aku pernah ke tempat ini saat kecil..."
            speed={40}
            onDone={() => setTextFinished(true)}
          />
          {!textFinished && <p style={{ fontSize: "0.8rem" }}>...</p>}
          {textFinished && (
            <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>
              (Klik untuk lanjut)
            </p>
          )}
        </div>
      )}

      {/* INVENTORY */}
      {showInventory && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: 250,
            backgroundColor: "rgba(0,0,0,0.85)",
            border: "2px solid white",
            borderRadius: "10px",
            padding: "1rem",
            color: "white",
            zIndex: 20,
          }}
        >
          <h3>🎒 Inventori</h3>
          <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
            {inventory.map((item, index) => (
              <li
                key={index}
                style={{
                  cursor: "pointer",
                  padding: "4px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
                onClick={() => {
                  if (!hasUsedKey && item === "Kunci Rumah Tua") {
                    setHasUsedKey(true);
                    showNotification("Kunci digunakan!");
                  } else if (item !== "Kunci Rumah Tua") {
                    setInventory((prev) => prev.filter((_, i) => i !== index));
                    setShowInventory(false);
                    showNotification(`${item} dibuang!`);
                  }
                }}
              >
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: 8 }}>
            Tekan I untuk tutup
          </p>
        </div>
      )}

      {/* NOTIF */}
      {notification && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "10px",
            zIndex: 100,
            fontWeight: "bold",
          }}
        >
          {notification}
        </div>
      )}
    </div>
  );
};

export default GameScene;
