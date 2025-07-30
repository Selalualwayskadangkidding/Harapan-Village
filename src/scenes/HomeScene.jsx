import { useEffect, useState, useRef } from "react";

const HomeScene = ({ onEnterGame }) => {
  const [position, setPosition] = useState({ x: 300, y: 300 });
  const keysPressed = useRef({});
  const portal = { x: 100, y: 100 };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (key === "e") {
        const dx = position.x - portal.x;
        const dy = position.y - portal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40) {
          onEnterGame(); // Balik ke GameScene
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
      setPosition((prev) => {
        const speed = 4;
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
  }, [position]);

  return (
    <div
      style={{
        backgroundColor: "#3a3",
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* Portal balik */}
      <div
        style={{
          position: "absolute",
          top: portal.y,
          left: portal.x,
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: "red",
          border: "2px solid white",
        }}
      />

      {/* Karakter */}
      <div
        style={{
          position: "absolute",
          top: position.y,
          left: position.x,
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: "cyan",
        }}
      />
    </div>
  );
};

export default HomeScene;
