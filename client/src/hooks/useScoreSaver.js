import { useEffect, useRef } from 'react';
import axios from 'axios';

const useScoreSaver = (gameType, score, gameActive) => {
  const lastSavedScore = useRef(0);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const saveScore = async () => {
      if (score > lastSavedScore.current && score > 0) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/update-game-points`,
            {
              gameType,
              points: score - lastSavedScore.current
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          lastSavedScore.current = score;
        } catch (error) {
          console.error('Failed to save score:', error);
        }
      }
    };

    // Save score when it changes (debounced)
    if (gameActive && score > lastSavedScore.current) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(saveScore, 2000); // Save after 2 seconds of inactivity
    }

    // Save immediately when game ends
    if (!gameActive && score > lastSavedScore.current) {
      saveScore();
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [gameType, score, gameActive]);

  // Save on component unmount (when leaving the game)
  useEffect(() => {
    return () => {
      if (score > lastSavedScore.current && score > 0) {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Use sendBeacon for reliable unmount saving
        const data = JSON.stringify({
          gameType,
          points: score - lastSavedScore.current
        });

        navigator.sendBeacon(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/users/update-game-points`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };
  }, [gameType, score]);
};

export default useScoreSaver;
