import { createSignal, onMount } from 'solid-js';
import { GameSetup, type GameSettings } from './GameSetup';
import { Game } from './Game';

export const App = () => {
  const [gameSettings, setGameSettings] = createSignal<GameSettings | null>(null);

  onMount(() => {
    const savedGameState = localStorage.getItem('dartGameState');
    if (savedGameState) {
      try {
        const state = JSON.parse(savedGameState);
        setGameSettings(state.settings);
      } catch (e) {
        console.error('Failed to parse saved game state:', e);
        localStorage.removeItem('dartGameState');
      }
    }
  });

  const handleStartGame = (settings: GameSettings) => {
    setGameSettings(settings);
  };

  const handleEndGame = () => {
    setGameSettings(null);
  };

  return (
    <div class="min-h-screen bg-gray-100">
      {gameSettings() ? (
        <Game settings={gameSettings()!} onEndGame={handleEndGame} />
      ) : (
        <div class="flex items-center justify-center min-h-screen">
          <GameSetup onStartGame={handleStartGame} />
        </div>
      )}
    </div>
  );
};