import { useState } from "react";
import IntroScene from "./scenes/IntroScene";
import HomeScene from "./scenes/HomeScene";
import GameScene from "./scenes/GameScene";

const App = () => {
  const [currentScene, setCurrentScene] = useState("intro");
  const [hasUsedKey, setHasUsedKey] = useState(false);
  const [playerSpawn, setPlayerSpawn] = useState({ x: 100, y: 100 });

  const handleIntroDone = () => {
    setCurrentScene("game"); // ⬅️ LANGSUNG ke GameScene sesuai request terakhir
  };

  const goToGameScene = () => {
    setCurrentScene("game");
  };

  const goToHomeScene = () => {
    // Simpan spawn posisi saat keluar dari GameScene
    setPlayerSpawn({ x: 110, y: 100 });
    setCurrentScene("home");
  };

  return (
    <>
      {currentScene === "intro" && (
        <IntroScene onDone={handleIntroDone} />
      )}
      {currentScene === "home" && (
        <HomeScene onEnterGame={goToGameScene} spawnPoint={playerSpawn} />
      )}
      {currentScene === "game" && (
        <GameScene
          onBackHome={goToHomeScene}
          hasUsedKey={hasUsedKey}
          setHasUsedKey={setHasUsedKey}
        />
      )}
    </>
  );
};

export default App;
