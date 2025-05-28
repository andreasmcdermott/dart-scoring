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
  legsWon: number[]; // legs won by each player
  setsWon: number[]; // sets won by each player
  currentLeg: number;
  currentSet: number;
  playersStarted: boolean[]; // track which players have started scoring
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
  const [legsWon, setLegsWon] = createSignal<number[]>(
    savedState?.legsWon ?? props.settings.players.map(() => 0)
  );
  const [setsWon, setSetsWon] = createSignal<number[]>(
    savedState?.setsWon ?? props.settings.players.map(() => 0)
  );
  const [currentLeg, setCurrentLeg] = createSignal(
    savedState?.currentLeg ?? 1
  );
  const [currentSet, setCurrentSet] = createSignal(
    savedState?.currentSet ?? 1
  );
  const [playersStarted, setPlayersStarted] = createSignal<boolean[]>(
    savedState?.playersStarted ?? props.settings.players.map(() => !props.settings.doubleIn)
  );

  const saveGameState = () => {
    const state: GameState = {
      settings: props.settings,
      currentPlayerIndex: currentPlayerIndex(),
      playerScores: playerScores(),
      dartsThrown: dartsThrown(),
      currentThrow: currentThrow(),
      allThrows: allThrows(),
      legsWon: legsWon(),
      setsWon: setsWon(),
      currentLeg: currentLeg(),
      currentSet: currentSet(),
      playersStarted: playersStarted()
    };
    localStorage.setItem('dartGameState', JSON.stringify(state));
  };

  createEffect(() => {
    saveGameState();
  });

  const currentPlayer = () => props.settings.players[currentPlayerIndex()];
  const currentScore = () => playerScores()[currentPlayerIndex()];

  const formatDartNotation = (number: number, multiplier: number): string => {
    if (number === 50) return 'Bull';
    if (number === 25) return '25';
    if (multiplier === 1) return number.toString();
    if (multiplier === 2) return `D${number}`;
    if (multiplier === 3) return `T${number}`;
    return number.toString();
  };

  const getCurrentThrowDisplay = () => {
    const currentPlayerThrows = allThrows().filter(t => t.playerId === currentPlayer()!.id);
    const turnStartIndex = currentPlayerThrows.length - dartsThrown();
    const currentTurnThrows = currentPlayerThrows.slice(turnStartIndex);
    
    const throwDisplay = [];
    for (let i = 0; i < 3; i++) {
      if (i < currentTurnThrows.length) {
        const dart = currentTurnThrows[i]!;
        if (dart.number === 0) {
          throwDisplay.push('0');
        } else {
          throwDisplay.push(formatDartNotation(dart.number, dart.multiplier));
        }
      } else {
        throwDisplay.push('-');
      }
    }
    return throwDisplay.join(' ');
  };

  const handleScore = (score: number, multiplier: number) => {
    const totalScore = score * multiplier;
    const playerIndex = currentPlayerIndex();
    const hasStarted = playersStarted()[playerIndex];
    
    const dartThrow: DartThrow = {
      number: score,
      multiplier,
      playerId: currentPlayer()!.id,
      timestamp: Date.now()
    };
    
    // Check if player needs to start with double-in
    const isValidStart = !props.settings.doubleIn || multiplier === 2 || score === 50;
    
    if (!hasStarted && !isValidStart && totalScore > 0) {
      // Player hasn't started and this isn't a valid starting throw
      setAllThrows([...allThrows(), dartThrow]);
      setCurrentThrow([...currentThrow(), 0]); // Show 0 for invalid start
      setDartsThrown(dartsThrown() + 1);
      
      if (dartsThrown() >= 3) {
        nextPlayer();
      }
      return;
    }
    
    // If this is a valid starting throw and player hasn't started, mark them as started
    if (!hasStarted && isValidStart && totalScore > 0) {
      const newPlayersStarted = [...playersStarted()];
      newPlayersStarted[playerIndex] = true;
      setPlayersStarted(newPlayersStarted);
    }
    
    // Only apply score if player has started or is starting now
    const scoreToApply = (hasStarted || isValidStart) ? totalScore : 0;
    
    // Calculate what the new score would be
    const currentPlayerScore = playerScores()[playerIndex]!;
    const newScore = currentPlayerScore - scoreToApply;
    
    const isValidFinish = !props.settings.doubleOut || multiplier === 2 || score === 50;
    
    // Check for bust conditions
    if (newScore < 0 || newScore === 1 || (newScore === 0 && !isValidFinish)) {
      // BUST: Revert to score at start of turn
      const turnStartScore = currentPlayerScore + currentThrow().reduce((sum, dart) => sum + dart, 0);
      const newScores = [...playerScores()];
      newScores[playerIndex] = turnStartScore;
      setPlayerScores(newScores);
      
      setAllThrows([...allThrows(), dartThrow]);
      setCurrentThrow([...currentThrow(), scoreToApply]);
      nextPlayer();
      return;
    }

    // Valid throw - apply the score
    const newScores = [...playerScores()];
    newScores[playerIndex] = newScore;
    setPlayerScores(newScores);
    setCurrentThrow([...currentThrow(), scoreToApply]);
    setAllThrows([...allThrows(), dartThrow]);
    setDartsThrown(dartsThrown() + 1);

    if (newScore === 0 && isValidFinish) {
      handleLegWin();
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

  const handleLegWin = () => {
    const playerIndex = currentPlayerIndex();
    const newLegsWon = [...legsWon()];
    newLegsWon[playerIndex]!++;
    setLegsWon(newLegsWon);

    const legsToWin = Math.ceil(props.settings.legs / 2);
    
    if (newLegsWon[playerIndex]! >= legsToWin) {
      handleSetWin();
    } else {
      startNewLeg();
    }
  };

  const handleSetWin = () => {
    const playerIndex = currentPlayerIndex();
    const newSetsWon = [...setsWon()];
    newSetsWon[playerIndex]!++;
    setSetsWon(newSetsWon);

    const setsToWin = Math.ceil(props.settings.sets / 2);
    
    if (newSetsWon[playerIndex]! >= setsToWin) {
      alert(`${currentPlayer()!.name} wins the match!`);
      localStorage.removeItem('dartGameState');
      props.onEndGame();
    } else {
      startNewSet();
    }
  };

  const startNewLeg = () => {
    alert(`${currentPlayer()!.name} wins leg ${currentLeg()}!`);
    setCurrentLeg(currentLeg() + 1);
    resetLegScores();
  };

  const startNewSet = () => {
    alert(`${currentPlayer()!.name} wins set ${currentSet()}!`);
    setCurrentSet(currentSet() + 1);
    setCurrentLeg(1);
    setLegsWon(props.settings.players.map(() => 0));
    resetLegScores();
  };

  const resetLegScores = () => {
    setPlayerScores(props.settings.players.map(() => props.settings.targetPoints));
    // Rotate starting player: (currentLeg - 1) % numberOfPlayers
    const startingPlayer = (currentLeg() - 1) % props.settings.players.length;
    setCurrentPlayerIndex(startingPlayer);
    setDartsThrown(0);
    setCurrentThrow([]);
    // Reset double-in status for new leg
    setPlayersStarted(props.settings.players.map(() => !props.settings.doubleIn));
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
            <div class="flex justify-between items-center mb-2">
              <h2 class="text-base font-semibold">Scores</h2>
              {(props.settings.sets > 1 || props.settings.legs > 1) && (
                <div class="text-xs text-gray-600">
                  {props.settings.sets > 1 && `Set ${currentSet()}`}
                  {props.settings.sets > 1 && props.settings.legs > 1 && ", "}
                  {props.settings.legs > 1 && `Leg ${currentLeg()}`}
                </div>
              )}
            </div>
            <div class="space-y-2">
              {props.settings.players.length > 4 ? (
                <>
                  {/* Current Player - Expanded for many players */}
                  <div class="p-2.5 rounded bg-blue-100 border-2 border-blue-500">
                    <div class="flex justify-between items-center">
                      <div>
                        <span class="font-medium">{currentPlayer()!.name}</span>
                        {(props.settings.sets > 1 || props.settings.legs > 1) && (
                          <div class="text-xs text-gray-600">
                            {props.settings.sets > 1 && `Sets: ${setsWon()[currentPlayerIndex()]}`}
                            {props.settings.sets > 1 && props.settings.legs > 1 && " | "}
                            {props.settings.legs > 1 && `Legs: ${legsWon()[currentPlayerIndex()]}`}
                          </div>
                        )}
                      </div>
                      <span class="text-lg font-bold">{currentScore()}</span>
                    </div>
                    <div class="mt-1 text-xs text-gray-600">
                      <div>This throw: {getCurrentThrowDisplay()}</div>
                      {(() => {
                        const finishOptions = calculateFinishOptions(currentScore()!, props.settings.doubleOut, 3 - dartsThrown());
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
                  
                  {/* Other Players - Collapsed Grid */}
                  <div class="grid grid-cols-2 gap-1">
                    {props.settings.players.filter((_, index) => index !== currentPlayerIndex()).map((player, filteredIndex) => {
                      const originalIndex = props.settings.players.findIndex(p => p.id === player.id);
                      return (
                        <div class="p-1.5 rounded bg-gray-50 text-center">
                          <div class="text-xs font-medium truncate">{player.name}</div>
                          <div class="text-sm font-bold">{playerScores()[originalIndex]}</div>
                          {(props.settings.sets > 1 || props.settings.legs > 1) && (
                            <div class="text-xs text-gray-500">
                              {props.settings.sets > 1 && `S:${setsWon()[originalIndex]}`}
                              {props.settings.sets > 1 && props.settings.legs > 1 && " "}
                              {props.settings.legs > 1 && `L:${legsWon()[originalIndex]}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* All Players - Full Width Rows with Active Highlighting */}
                  {props.settings.players.map((player, playerIndex) => {
                    const isActive = playerIndex === currentPlayerIndex();
                    return (
                      <div class={`p-2.5 rounded ${isActive ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50'}`}>
                        <div class="flex justify-between items-center">
                          <div>
                            <span class={`font-medium ${isActive ? 'font-semibold' : ''}`}>{player.name}</span>
                            {(props.settings.sets > 1 || props.settings.legs > 1) && (
                              <div class="text-xs text-gray-600">
                                {props.settings.sets > 1 && `Sets: ${setsWon()[playerIndex]}`}
                                {props.settings.sets > 1 && props.settings.legs > 1 && " | "}
                                {props.settings.legs > 1 && `Legs: ${legsWon()[playerIndex]}`}
                              </div>
                            )}
                          </div>
                          <span class={`font-bold ${isActive ? 'text-lg' : 'text-base'}`}>{playerScores()[playerIndex]}</span>
                        </div>
                        {isActive && (
                          <div class="mt-1 text-xs text-gray-600">
                            <div>This throw: {getCurrentThrowDisplay()}</div>
                            {(() => {
                              const finishOptions = calculateFinishOptions(currentScore()!, props.settings.doubleOut, 3 - dartsThrown());
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
                        )}
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
