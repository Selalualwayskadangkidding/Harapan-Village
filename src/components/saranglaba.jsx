import React, { useState, useEffect } from 'react';

const SarangLaba = ({ playerX, playerY, webX, webY, onCleaned }) => {
  const [nearWeb, setNearWeb] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCleaned, setIsCleaned] = useState(false);

  // Cek apakah pemain dekat dengan titik sarang
  useEffect(() => {
    const dx = playerX - webX;
    const dy = playerY - webY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    setNearWeb(distance < 50); // radius interaksi
  }, [playerX, playerY, webX, webY]);

  // Tekan Q untuk mulai membersihkan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'q' && nearWeb && !isCleaned) {
        setCleaning(true);
        setProgress(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nearWeb, isCleaned]);

  // Gerak mouse untuk naikkan progress
  useEffect(() => {
    const handleMouseMove = () => {
      if (cleaning) {
        setProgress((prev) => Math.min(prev + 1, 100));
      }
    };

    if (cleaning) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [cleaning]);

  // Jika progress penuh = bersih
  useEffect(() => {
    if (progress >= 100) {
      setIsCleaned(true);
      setCleaning(false);
      onCleaned && onCleaned(); // kirim callback
    }
  }, [progress, onCleaned]);

  return (
    <>
      {/* Titik Sarang Laba-Laba */}
      {!isCleaned && (
        <div
          style={{
            position: 'absolute',
            left: webX,
            top: webY,
            width: 40,
            height: 40,
            backgroundColor: 'black',
            borderRadius: '50%',
            border: '2px solid yellow',
            zIndex: 999,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* UI Cleaning */}
      {cleaning && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'black',
            padding: '20px',
            borderRadius: '10px',
            color: 'white',
            zIndex: 1000,
          }}
        >
          <p>Bersihkan sarang laba-laba! Gerakkan mouse!</p>
          <div
            style={{
              width: '200px',
              height: '10px',
              background: '#444',
              marginTop: '10px',
              borderRadius: '5px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'limegreen',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SarangLaba;
