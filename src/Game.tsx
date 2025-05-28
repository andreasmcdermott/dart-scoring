import { createSignal, createEffect, For } from 'solid-js';
import DartBoard from './DartBoard';
import { type GameSettings } from './GameSetup';
import { calculateFinishOptions } from './finishCalculator';

type DartThrow = {
  number: number;
  multiplier: number;
  playerId: string;
  timestamp: number;
}

type GameState = {
  settings: GameSettings;
  currentPlayerIndex: number;
  playerScores: number[];
  dartsThrown: number;
  currentThrow: number[];
  allThrows: DartThrow[];
}

type GameProps = {
  settings: GameSettings;
  onEndGame: () => void;
}

export const Game = (props: GameProps) => {
  const loadGameState = (): GameState | null => {
    const saved = localStorage.getItem('dartGameState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved game state:', e);
      }
    }
    return null;
  };

  const savedState = loadGameState();
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = createSignal(
    savedState?.currentPlayerIndex ?? 0
  );
  const [playerScores, setPlayerScores] = createSignal(
    savedState?.playerScores ?? props.settings.players.map(() => props.settings.targetPoints)
  );
  const [dartsThrown, setDartsThrown] = createSignal(
    savedState?.dartsThrown ?? 0
  );
  const [currentThrow, setCurrentThrow] = createSignal<number[]>(
    savedState?.currentThrow ?? []
  );
  const [allThrows, setAllThrows] = createSignal<DartThrow[]>(
    savedState?.allThrows ?? []
  );

  const saveGameState = () => {
    const state: GameState = {
      settings: props.settings,
      currentPlayerIndex: currentPlayerIndex(),
      playerScores: playerScores(),
      dartsThrown: dartsThrown(),
      currentThrow: currentThrow(),
      allThrows: allThrows()
    };
    localStorage.setItem('dartGameState', JSON.stringify(state));
  };

  createEffect(() => {
    saveGameState();
  });

  const currentPlayer = () => props.settings.players[currentPlayerIndex()];
  const currentScore = () => playerScores()[currentPlayerIndex()];

  const handleScore = (score: number, multiplier: number) => {
    const totalScore = score * multiplier;
    const newScores = [...playerScores()];
    const newScore = newScores[currentPlayerIndex()]! - totalScore;
    
    const dartThrow: DartThrow = {
      number: score,
      multiplier,
      playerId: currentPlayer()!.id,
      timestamp: Date.now()
    };
    
    const isValidFinish = !props.settings.doubleOut || multiplier === 2 || score === 50;
    
    if (newScore < 0 || newScore === 1 || (newScore === 0 && !isValidFinish)) {
      setAllThrows([...allThrows(), dartThrow]);
      nextPlayer();
      return;
    }

    newScores[currentPlayerIndex()] = newScore;
    setPlayerScores(newScores);
    setCurrentThrow([...currentThrow(), totalScore]);
    setAllThrows([...allThrows(), dartThrow]);
    setDartsThrown(dartsThrown() + 1);

    if (newScore === 0 && isValidFinish) {
      alert(`${currentPlayer()!.name} wins!`);
      localStorage.removeItem('dartGameState');
      return;
    }

    if (dartsThrown() >= 3) {
      nextPlayer();
    }
  };

  const nextPlayer = () => {
    setCurrentPlayerIndex((currentPlayerIndex() + 1) % props.settings.players.length);
    setDartsThrown(0);
    setCurrentThrow([]);
  };

  const undoLastDart = () => {
    if (currentThrow().length === 0) return;
    
    const lastScore = currentThrow()[currentThrow().length - 1];
    const newScores = [...playerScores()];
    newScores[currentPlayerIndex()]! += lastScore!;
    setPlayerScores(newScores);
    
    const newThrow = currentThrow().slice(0, -1);
    setCurrentThrow(newThrow);
    setDartsThrown(dartsThrown() - 1);
    
    const newAllThrows = allThrows().slice(0, -1);
    setAllThrows(newAllThrows);
  };

  const handleEndGame = () => {
    localStorage.removeItem('dartGameState');
    props.onEndGame();
  };

  return (
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center mb-4">
          <button
            onClick={handleEndGame}
            class="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            End Game
          </button>
          <div></div>
          <button
            onClick={undoLastDart}
            disabled={currentThrow().length === 0}
            class="px-3 py-1.5 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Undo
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scores Panel */}
          <div class="bg-white rounded-lg shadow p-3 max-h-[50vh] overflow-y-auto">
            <h2 class="text-base font-semibold mb-2">Scores</h2>
            <div class="space-y-2">
              {/* Current Player - Always Expanded */}
              <div class="p-2.5 rounded bg-blue-100 border-2 border-blue-500">
                <div class="flex justify-between items-center">
                  <span class="font-medium">{currentPlayer()!.name}</span>
                  <span class="text-lg font-bold">{currentScore()}</span>
                </div>
                <div class="mt-1 text-xs text-gray-600 min-h-12">
                  <div>This throw: {(() => {
                    const throwDisplay = [];
                    for (let i = 0; i < 3; i++) {
                      if (i < currentThrow().length) {
                        throwDisplay.push(currentThrow()[i]!.toString());
                      } else {
                        throwDisplay.push('-');
                      }
                    }
                    return throwDisplay.join(' ');
                  })()}</div>
                  {(() => {
                    const finishOptions = calculateFinishOptions(currentScore()!, props.settings.doubleOut);
                    if (finishOptions.length > 0) {
                      const optionsText = finishOptions.slice(0, 3).map(o => o.description).join(' or ');
                      return (
                        <div class="mt-1 text-xs text-green-700 bg-green-50 p-1 rounded">
                          <span class="font-semibold">Finish: </span>{optionsText}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              
              {/* Other Players - Collapsed */}
              {props.settings.players.length > 4 ? (
                <div class="grid grid-cols-2 gap-1">
                  {props.settings.players.filter((_, index) => index !== currentPlayerIndex()).map((player, filteredIndex) => {
                    const originalIndex = props.settings.players.findIndex(p => p.id === player.id);
                    return (
                      <div class="p-1.5 rounded bg-gray-50 text-center">
                        <div class="text-xs font-medium truncate">{player.name}</div>
                        <div class="text-sm font-bold">{playerScores()[originalIndex]}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {props.settings.players.filter((_, index) => index !== currentPlayerIndex()).map((player, filteredIndex) => {
                    const originalIndex = props.settings.players.findIndex(p => p.id === player.id);
                    return (
                      <div class="p-1.5 rounded bg-gray-50 flex justify-between items-center">
                        <span class="text-sm font-medium">{player.name}</span>
                        <span class="text-base font-bold">{playerScores()[originalIndex]}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Dart Board */}
          <div class="lg:col-span-2">
            <DartBoard onScore={handleScore} />
            <div class="flex justify-center mt-3">
              <button
                onClick={() => handleScore(0, 1)}
                class="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Miss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
