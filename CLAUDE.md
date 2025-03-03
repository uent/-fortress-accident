# CLAUDE.md - Fortress Simulation Project Guidelines

## Build/Test/Lint Commands
- Install: `npm install`
- Generate Placeholder Assets: `npm run assets`
- Run Dev Server (Vite): `npm run dev` or `npm start`
- Run Dev Server (Webpack legacy): `npm run webpack:start`
- Build Production (Vite): `npm run build`
- Build Production (Webpack legacy): `npm run webpack:build`
- Preview Production Build: `npm run preview`
- Lint: `npm run lint`
- Test: `npm test`

## Code Style Guidelines
- Use 2-space indentation for JavaScript code
- Use ES6+ features (arrow functions, destructuring, template literals)
- Group imports in this order: libraries, game engine, local components, utils
- Use camelCase for variables and functions, PascalCase for classes
- Ensure proper game object cleanup in destroy() methods to prevent memory leaks
- Keep game scene methods focused and well-organized by functionality
- Use clear state machines for entity behavior (idle, moving, gathering, etc.)
- For UI components, prefer composition and clean separation from game logic
- Add meaningful comments for complex game mechanics or algorithms
- Use constants for game configuration values that might need adjustment

## Project Structure
- scenes: Game flow (Boot, Preload, MainMenu, Game)
- objects: Game entities (Colonist, Building, Resource)
- utils: Helper classes and functions
- assets: Game assets (sprites, sounds, images)