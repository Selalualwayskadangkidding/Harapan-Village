import { useEffect, useState, useRef } from "react";
import TypingText from "../components/typingText";

const GameScene = ({ onBackHome, hasUsedKey, setHasUsedKey }) => {
  const [position, setPosition] = useState({ x: 300, y: 300 });
  const keysPressed = useRef({});
  const [showText, setShowText] = useState(false);
  const [textFinished, setTextFinished] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showTrashMenu, setShowTrashMenu] = useState(false);
  const [inventory, setInventory] = useState(["Kunci Rumah Tua"]);

  const maxTrash = 3;

  const portal = { x: 550, y: 150 };
  const trashBin = { x: 150, y: 100 };
  const interactable = { x: 320, y: 120 };

  const [trashItems, setTrashItems] = useState([
    { id: 1, name: "Botol Plastik", x: 400, y: 300, taken: false },
    { id: 2, name: "Kertas", x: 460, y: 350, taken: false },
    { id: 3, name: "Kaleng", x: 500, y: 250, taken: false },
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === "i") {
        setShowInventory((prev) => !prev);
      }

      if (key === "e") {
        // interaksi dengan portal
        const dxP = position.x - portal.x;
        const dyP = position.y - portal.y;
        const distP = Math.sqrt(dxP * dxP + dyP * dyP);

        if (distP < 50) {
          if (hasUsedKey) {
            onBackHome();
          } else {
            alert("Memerlukan kunci");
            setShowInventory(true);
          }
        }

        // interaksi tempat sampah
        const dxT = position.x - trashBin.x;
        const dyT = position.y - trashBin.y;
        const distT = Math.sqrt(dxT * dxT + dyT * dyT);

        if (distT < 50 && inventory.length > 0) {
          setShowTrashMenu(true);
        }

        // interaksi ambil sampah
        trashItems.forEach((trash) => {
          const dx = position.x - trash.x;
          const dy = position.y - trash.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 30 && !trash.taken && inventory.length < maxTrash + 1) {
            setTrashItems((prev) =>
              prev.map((item) =>
                item.id === trash.id ? { ...item, taken: true } : item
              )
            );
            setInventory((prev) => [...prev, trash.name]);
          }
        });
      }

      if (key === "q") {
        const dx = position.x - interactable.x;
        const dy = position.y - interactable.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50 && !showText) {
          setShowText(true);
          setTextFinished(false);
        }
      } else {
        keysPressed.current[key] = true;
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const interval = setInterval(() => {
      if (showText || showInventory || showTrashMenu) return;

      setPosition((prev) => {
        const speed = 3;
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.current["w"]) newY -= speed;
        if (keysPressed.current["s"]) newY += speed;
        if (keysPressed.current["a"]) newX -= speed;
        if (keysPressed.current["d"]) newX += speed;

        return { x: newX, y: newY };
      });
    }, 16);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [position, inventory, trashItems, showText, showInventory, showTrashMenu, hasUsedKey]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#222",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Titik interaksi dialog */}
      <div
        style={{
          position: "absolute",
          top: interactable.y,
          left: interactable.x,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "yellow",
          border: "2px solid black",
          zIndex: 1,
        }}
      />

      {/* Portal hijau */}
      <div
        style={{
          position: "absolute",
          top: portal.y,
          left: portal.x,
          width: "25px",
          height: "25px",
          borderRadius: "50%",
          backgroundColor: "lime",
          zIndex: 1,
        }}
      />

      {/* Tempat sampah */}
      <div
        style={{
          position: "absolute",
          top: trashBin.y,
          left: trashBin.x,
          width: "25px",
          height: "25px",
          borderRadius: "50%",
          backgroundColor: "red",
          zIndex: 1,
        }}
      />

      {/* Sampah */}
      {trashItems.map(
        (trash) =>
          !trash.taken && (
            <div
              key={trash.id}
              style={{
                position: "absolute",
                top: trash.y,
                left: trash.x,
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "gray",
              }}
            />
          )
      )}

      {/* Karakter */}
      <div
        style={{
          position: "absolute",
          top: position.y,
          left: position.x,
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: "#4af",
          zIndex: 2,
        }}
      />

      {/* Dialog interaksi */}
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

      {/* Inventory */}
      {showInventory && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "250px",
            backgroundColor: "rgba(0,0,0,0.85)",
            border: "2px solid white",
            borderRadius: "10px",
            padding: "1rem",
            color: "white",
            zIndex: 20,
          }}
        >
          <h3>🎒 Inventori</h3>
          <ul>
            {inventory.map((item, index) => (
              <li
                key={index}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (!hasUsedKey && item === "Kunci Rumah Tua") {
                    setHasUsedKey(true);
                    alert("Kunci digunakan!");
                  }
                }}
              >
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>Tekan I untuk tutup</p>
        </div>
      )}

      {/* Menu buang sampah */}
      {showTrashMenu && (
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            backgroundColor: "#000a",
            padding: "1rem",
            borderRadius: "10px",
            color: "pink",
            zIndex: 30,
          }}
        >
          <h3>Pilih sampah yang ingin dibuang:</h3>
          <ul>
            {inventory.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  if (item === "Kunci Rumah Tua") {
                    alert("Ini mah kunci rumah tua, gaboleh aku buang");
                  } else {
                    setInventory((prev) => prev.filter((_, i) => i !== index));
                    setShowTrashMenu(false);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GameScene;
