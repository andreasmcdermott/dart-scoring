# Dart Scoring App

A modern, mobile-first dart scoring application built with Solid.js, TypeScript, and Tailwind CSS.

## 🎯 Overview

This is a complete dart scoring app that supports professional tournament rules with an intuitive mobile interface. Players can configure games, track scores, and manage complex tournament formats with multiple legs and sets.

## 🏗️ Tech Stack

- **Framework**: Solid.js (reactive UI library)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Deployment**: Static SPA (client-only)

## 📱 Key Features

### Game Setup
- **Multi-player support**: Add/remove players with auto-generated names ("Player 1", "Player 2", etc.)
- **Target points**: 101, 301, 501, or 701 points
- **Tournament formats**: Configurable legs and sets (e.g., best of 5 legs, best of 3 sets)
- **Game rules**: 
  - Double Out (must finish with double or bullseye)
  - Double In (must start with double or bullseye)
- **Persistent settings**: All settings saved to localStorage

### Interactive Dart Board
- **SVG-based dart board**: Scalable, pixel-perfect rendering
- **Mobile-optimized**: Large touch targets for doubles/triples
- **Authentic layout**: Correct dart board number sequence and proportions
- **Visual feedback**: Hover effects and proper color coding
- **Click handling**: Accurate hit detection for all scoring areas

### Game Management
- **Real-time scoring**: Instant score updates with validation
- **Turn management**: Automatic player rotation with visual indicators
- **Throw tracking**: Shows current throw as "14 20 -" format
- **Undo functionality**: Reverse last dart thrown
- **Miss button**: Record missed throws
- **Game state persistence**: Resume games after page refresh

### Tournament Features
- **Legs/Sets progression**: Proper tournament scoring with rotation
- **Starting player rotation**: Fair alternation each leg
- **Win condition tracking**: Visual progress for legs and sets won
- **Match completion**: Proper alerts and game ending

### Advanced Rules
- **Double Out**: Must finish with double or bullseye (configurable)
- **Double In**: Must start scoring with double or bullseye (configurable)  
- **Bust detection**: Invalid throws (negative, exactly 1 point, invalid finish)
- **Finish suggestions**: Smart recommendations like "D9 or 16→D1"

## 🎮 Game Flow

### Setup Phase
1. Configure players (minimum 1, auto-naming with manual override)
2. Select target points (101/301/501/701)
3. Set legs and sets (default 1 each)
4. Choose game rules (Double In/Out)
5. Start game (button disabled until all players named)

### Playing Phase
1. Current player highlighted with score and throw status
2. Click dart board segments or use Miss button
3. Scores update automatically with validation
4. Turn rotates after 3 darts or bust
5. Leg/set progression with proper alerts
6. Finish suggestions appear when possible

### Game Completion
- Leg win → Alert → Reset scores → Next leg
- Set win → Alert → Reset legs → Next set  
- Match win → Alert → Return to setup

## 🏛️ Architecture

### Component Structure
```
App.tsx                 # Main app container, handles setup vs game modes
├── GameSetup.tsx       # Player management, game configuration
├── Game.tsx           # Main game logic and UI
├── DartBoard.tsx      # Interactive SVG dart board
└── finishCalculator.ts # Finish suggestion algorithms
```

### State Management
- **Solid.js signals**: Reactive state for UI updates
- **localStorage**: Persistent game state and settings
- **Game state**: Comprehensive tracking of all game data

### Key State Objects
```typescript
GameSettings {
  players: Player[]
  targetPoints: number
  legs: number
  sets: number
  doubleOut: boolean
  doubleIn: boolean
}

GameState {
  settings: GameSettings
  currentPlayerIndex: number
  playerScores: number[]
  dartsThrown: number
  currentThrow: number[]
  allThrows: DartThrow[]
  legsWon: number[]
  setsWon: number[]
  currentLeg: number
  currentSet: number
  playersStarted: boolean[]
}
```

## 📱 Mobile Optimization

### Layout
- **Responsive grid**: Adapts to screen size
- **Compact UI**: Minimized headers, optimized spacing
- **Stable layout**: Fixed heights prevent jumping
- **Touch targets**: Large buttons and dart board segments

### Player Display
- **Current player**: Expanded with full details
- **Inactive players**: Collapsed format
- **Many players**: Grid layout for >4 players
- **Adaptive content**: Legs/sets only shown when >1

### Controls
- **Touch-friendly**: Large dart board, +/- buttons
- **No keyboard**: Avoid number inputs on mobile
- **Smart defaults**: Auto-select default player names
- **Gesture support**: Proper touch handling

## 🎯 Dart Board Implementation

### Technical Details
- **SVG rendering**: 390x390 viewBox with mathematical precision
- **Segment calculation**: Polar coordinate math for perfect arcs
- **Optimized rings**: Moved doubles/triples inward for easier tapping
- **Color coding**: 
  - Red/Green: Doubles and triples
  - Black/White alternating: Singles
  - Beige: Off-white for better contrast

### Scoring Areas
- **Singles**: Outer ring and inner area
- **Doubles**: Thin outer ring (30px wide)
- **Triples**: Thin inner ring (30px wide)  
- **Outer Bull**: 25 points (green)
- **Bullseye**: 50 points (red)

## 🧮 Game Logic

### Scoring Rules
- **Valid throws**: Any dart board hit
- **Bust conditions**: 
  - Score goes negative
  - Score equals exactly 1
  - Reach 0 without valid finish (if Double Out enabled)
- **Double In**: Must hit double/bullseye before scoring starts
- **Double Out**: Must finish with double/bullseye

### Finish Calculations
- **1-dart finishes**: Doubles 1-20, Bullseye
- **2-dart finishes**: Any combination ending with double/bullseye
- **3-dart finishes**: Common high finishes (170, 167, 160)
- **Smart display**: Top 3 options, compact notation (D9, T20→D8)

## 💾 Data Persistence

### localStorage Keys
- `dartGameSettings`: Player setup and game configuration
- `dartGameState`: Complete game state for resuming

### State Recovery
- **Automatic resume**: Games restore exactly where left off
- **Settings memory**: Setup form remembers last configuration
- **Clean state**: Completed games clear saved state

## 🚀 Development

### Setup
```bash
bun install
bun run dev      # Development server on port 8000
bun run build    # Production build
bun run preview  # Preview production build
```

### Build Output
- **Size**: ~8KB JS gzipped, ~3KB CSS gzipped
- **Performance**: Fast loading, smooth interactions
- **Compatibility**: Modern browsers with ES modules

## 📋 Validation & UX

### Input Validation
- **Player names**: Required before game start
- **Game settings**: Minimum values enforced
- **Scoring**: Real-time validation with visual feedback

### User Experience
- **No alerts**: UI feedback instead of popups
- **Smart defaults**: Sensible starting configuration
- **Progressive disclosure**: Advanced options when needed
- **Consistent interaction**: Predictable behavior throughout

## 🎲 Game Variants Supported

### Standard Games
- **501 Double Out**: Classic pub/tournament format
- **301 Double Out**: Shorter games
- **101**: Quick games
- **701**: Long format games

### Tournament Formats
- **Best of 3 legs**: First to 2 legs wins
- **Best of 5 legs, 3 sets**: First to 3 legs wins set, first to 2 sets wins match
- **Custom combinations**: Any legs/sets configuration

### Rule Variations
- **Double In + Double Out**: Traditional tournament rules
- **Straight in/out**: Casual play (disabled double rules)
- **Mixed rules**: Any combination of in/out rules

## 🔧 Technical Notes

### Performance Optimizations
- **Efficient updates**: Minimal re-renders with Solid.js
- **Lazy evaluation**: Finish calculations only when needed
- **Compact state**: Optimized data structures

### Browser Compatibility
- **Modern browsers**: ES2020+ features
- **Mobile Safari**: Tested and optimized
- **PWA-ready**: Meta tags for mobile web app

### Code Quality
- **TypeScript**: Full type safety
- **Named exports**: Consistent import patterns
- **No comments**: Self-documenting code
- **Clean architecture**: Separation of concerns

---

This app provides a complete, professional-grade dart scoring experience with mobile-first design and tournament-ready features.
