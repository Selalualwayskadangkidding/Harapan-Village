import { useEffect, useState } from "react";

const TypingText = ({ text, speed = 50, onDone }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const audio = new Audio("/audio/typing.mp3");

    setDisplayedText("");

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));

      if (text.charAt(i) !== " ") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }

      i++;
      if (i >= text.length) {
        clearInterval(interval);
        audio.pause();
        audio.currentTime = 0;
        if (onDone) onDone();
      }
    }, speed);

    return () => {
      clearInterval(interval);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [text, speed, onDone]);

  return (
    <p
      style={{
        color: "#fff",
        fontSize: "1.2rem",
        marginTop: "1rem",
        textAlign: "center",
      }}
    >
      {displayedText}
    </p>
  );
};

export default TypingText;
