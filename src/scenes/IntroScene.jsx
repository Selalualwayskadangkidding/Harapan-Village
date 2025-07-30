import { useState, useEffect, useRef } from "react";
import TypingText from "../components/typingText";

const IntroScene = ({ onDone }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef(null);

  const scenes = [
    {
      image: "/assets/resized_image_1.png",
      text: "SSeorang pria muda mengendarai mobil tuanya, menyusuri jalan berdebu yang berliku menuju sebuah tempat yang dulu ia sebut rumah.",
    },
    {
      image: "/assets/image5car.png",
      text: "DDi kejauhan, siluet sebuah gapura desa mulai terlihat.",
    },
    {
      image: "/assets/image6car.png",
      text: "SSaat gapura kampung mulai terlihat, langkah waktu seakan berhenti. Suara tawa masa kecil terngiang di kepalanya.",
    },
    {
      image: "/assets/kidsinriver.png",
      text: ".",
      audio: "/audio/kidslaugh.m4a",
    },
    {
      image: "/assets/image7car.png",
      text: " ''Fyuhh Home Sweet Home''. Dia menghela napas lega, merasakan beban di pundaknya sedikit berkurang.",
    },
    {
      image: "/assets/image8car.png",
      text: "Ia kembali menginjak gas, melaju pelan melewati jalan-jalan sempit kampung. Tak sadar, di pinggir jalan beberapa warga sibuk menebang pohon, Tapi Pikirannya terlalu penuh,matanya hanya tertuju pada tujuan rumahnya.",
    }

  ];

  // 🔊 Play audio saat sceneIndex berubah (jika ada)
  useEffect(() => {
    const currentScene = scenes[sceneIndex];

    // Stop audio sebelumnya
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Play audio baru jika ada
    if (currentScene.audio) {
      const newAudio = new Audio(currentScene.audio);
      audioRef.current = newAudio;
      newAudio.play().catch(() => {});
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [sceneIndex]);

  const handleNextScene = () => {
    if (isTransitioning) return;

    if (sceneIndex >= scenes.length - 1) {
      onDone(); // ⬅️ Panggil callback dari App.jsx
      return;
};
    

    setIsTransitioning(true);
    setTimeout(() => {
      setSceneIndex((prev) => prev + 1);
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        backgroundColor: "#111",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          transition: "opacity 0.5s ease",
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        <img
  src={scenes[sceneIndex].image}
  alt="Background Scene"
  style={{
    width: "100%",
    height: "100%",
    objectFit: sceneIndex === 3 ? "contain" : "cover", // zoom-out di scene 3
    objectPosition: sceneIndex === 3 ? "center center" : "center",
    transform: sceneIndex === 3 ? "scale(0.9)" : "scale(1)", // tambahan efek zoom-out halus
    transition: "transform 0.5s ease, object-fit 0.5s ease",
  }}
/>

        <div
          onClick={handleNextScene}
          style={{
            position: "absolute",
            bottom: "5%",
            left: "5%",
            right: "5%",
            zIndex: 2,
            color: "#fff",
            fontSize: "1.5rem",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "1rem",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          <TypingText text={scenes[sceneIndex].text} />
        </div>
      </div>
    </div>
  );
};

export default IntroScene;
