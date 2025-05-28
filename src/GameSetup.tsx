import { createSignal, For, Index } from 'solid-js';

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
  doubleIn: boolean;
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
      doubleOut: true,
      doubleIn: false
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
    setSettings(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, name } : p
      )
    }));
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

  const updateDoubleIn = (doubleIn: boolean) => {
    setSettings({
      ...settings(),
      doubleIn
    });
  };

  const canStartGame = () => {
    return settings().players.every(player => player.name.trim().length > 0);
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
        <Index each={settings().players}>
          {(player, index) => (
            <div class="flex gap-2 mb-2">
              <input
                type="text"
                value={player().name}
                onInput={(e) => updatePlayerName(player().id, e.currentTarget.value)}
                onFocus={(e) => {
                  const input = e.currentTarget;
                  const name = player().name;
                  if (name.startsWith('Player ') && /^Player \d+$/.test(name)) {
                    input.select();
                  }
                }}
                class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Player name"
                autocomplete="off"
                data-lpignore="true"
                data-form-type="other"
              />
              <button
                onClick={() => removePlayer(player().id)}
                disabled={settings().players.length <= 1}
                class="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>
          )}
        </Index>
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
          <div class="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => updateLegs(Math.max(1, settings().legs - 1))}
              class="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              −
            </button>
            <span class="flex-1 text-center py-2 font-medium">{settings().legs}</span>
            <button
              onClick={() => updateLegs(settings().legs + 1)}
              class="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sets</label>
          <div class="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => updateSets(Math.max(1, settings().sets - 1))}
              class="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              −
            </button>
            <span class="flex-1 text-center py-2 font-medium">{settings().sets}</span>
            <button
              onClick={() => updateSets(settings().sets + 1)}
              class="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Game Rules Section */}
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-3">Game Rules</h2>
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings().doubleOut}
              onChange={(e) => updateDoubleOut(e.currentTarget.checked)}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">Double Out (must finish with double or bullseye)</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings().doubleIn}
              onChange={(e) => updateDoubleIn(e.currentTarget.checked)}
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">Double In (must hit double or bullseye to start scoring)</span>
          </label>
        </div>
      </div>

      {/* Start Game Button */}
      <button
        onClick={handleStartGame}
        disabled={!canStartGame()}
        class={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
          canStartGame()
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Start Game
      </button>
    </div>
  );
};
