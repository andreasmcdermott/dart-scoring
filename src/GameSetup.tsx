import { createSignal, For } from 'solid-js';

export type Player = {
  id: string;
  name: string;
}

export type GameSettings =  {
  players: Player[];
  targetPoints: number;
  legs: number;
  sets: number;
  doubleOut: boolean;
}

interface GameSetupProps {
  onStartGame: (settings: GameSettings) => void;
}

export const GameSetup = (props: GameSetupProps) => {
  const loadSettings = (): GameSettings => {
    const saved = localStorage.getItem('dartGameSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    return {
      players: [{ id: '1', name: 'Player 1' }],
      targetPoints: 501,
      legs: 1,
      sets: 1,
      doubleOut: true
    };
  };

  const [settings, setSettings] = createSignal<GameSettings>(loadSettings());

  const addPlayer = () => {
    const currentSettings = settings();
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: `Player ${currentSettings.players.length + 1}`
    };
    setSettings({
      ...currentSettings,
      players: [...currentSettings.players, newPlayer]
    });
  };

  const removePlayer = (playerId: string) => {
    const currentSettings = settings();
    if (currentSettings.players.length <= 1) return;
    
    setSettings({
      ...currentSettings,
      players: currentSettings.players.filter(p => p.id !== playerId)
    });
  };

  const updatePlayerName = (playerId: string, name: string) => {
    const currentSettings = settings();
    setSettings({
      ...currentSettings,
      players: currentSettings.players.map(p => 
        p.id === playerId ? { ...p, name } : p
      )
    });
  };

  const updateTargetPoints = (points: number) => {
    setSettings({
      ...settings(),
      targetPoints: points
    });
  };

  const updateLegs = (legs: number) => {
    setSettings({
      ...settings(),
      legs: Math.max(1, legs)
    });
  };

  const updateSets = (sets: number) => {
    setSettings({
      ...settings(),
      sets: Math.max(1, sets)
    });
  };

  const updateDoubleOut = (doubleOut: boolean) => {
    setSettings({
      ...settings(),
      doubleOut
    });
  };

  const handleStartGame = () => {
    const gameSettings = settings();
    localStorage.setItem('dartGameSettings', JSON.stringify(gameSettings));
    props.onStartGame(gameSettings);
  };

  return (
    <div class="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h1 class="text-xl font-bold text-center mb-4">New Game</h1>
      
      {/* Players Section */}
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Players</h2>
        <For each={settings().players}>
          {(player) => (
            <div class="flex gap-2 mb-2">
              <input
                type="text"
                value={player.name}
                onInput={(e) => updatePlayerName(player.id, e.currentTarget.value)}
                class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Player name"
              />
              <button
                onClick={() => removePlayer(player.id)}
                disabled={settings().players.length <= 1}
                class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>
          )}
        </For>
        <button
          onClick={addPlayer}
          class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2"
        >
          Add Player
        </button>
      </div>

      {/* Target Points Section */}
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Target Points</h2>
        <div class="grid grid-cols-2 gap-2">
          <For each={[101, 301, 501, 701]}>
            {(points) => (
              <button
                onClick={() => updateTargetPoints(points)}
                class={`px-4 py-2 rounded border ${
                  settings().targetPoints === points
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {points}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Legs and Sets Section */}
      <div class="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Legs</label>
          <input
            type="number"
            min="1"
            value={settings().legs}
            onInput={(e) => updateLegs(parseInt(e.currentTarget.value) || 1)}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sets</label>
          <input
            type="number"
            min="1"
            value={settings().sets}
            onInput={(e) => updateSets(parseInt(e.currentTarget.value) || 1)}
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Double Out Rule Section */}
      <div class="mb-6">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings().doubleOut}
            onChange={(e) => updateDoubleOut(e.currentTarget.checked)}
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="text-sm font-medium text-gray-700">Double Out (must finish with double or bullseye)</span>
        </label>
      </div>

      {/* Start Game Button */}
      <button
        onClick={handleStartGame}
        class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
      >
        Start Game
      </button>
    </div>
  );
};
