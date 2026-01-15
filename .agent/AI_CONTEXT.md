# AI Context for Motrix (hq-downloader)

## Project Overview
- **Name**: Motrix (Forked/Customized as hq-downloader)
- **Description**: A full-featured download manager built with Electron and Vue.js.
- **Key Features**: HTTP/FTP/BitTorrent support, multi-threaded downloading, messy-free UI.

## Architecture
The project follows the standard `electron-vue` boilerplate structure:
- **`src/main`**: Main process code (Node.js environment).
    - Entry point for Electron.
    - Handles window creation, native menus, tray, and system integrations.
- **`src/renderer`**: Renderer process code (Vue.js environment).
    - **Entry Point**: `src/renderer/pages/index/main.js`
    - **Framework**: Vue 2.7.14
    - **UI Library**: Element UI (`element-ui` ^2.15.13)
    - **State Management**: Vuex
    - **Routing**: Vue Router
    - **Network**: Axios
- **`src/shared`**: Code shared between main and renderer processes.
    - Constants, utils, locales.

## Technology Stack
- **Languages**: JavaScript (ES6+), SASS
- **Build Tools**: Webpack, electron-builder
- **Linting**: ESLint (Standard Config + Vue Essential)
- **Package Manager**: Yarn (preferred) or NPM

## Key Conventions
- **Vue Components**: Options API (Vue 2 style). File names usually PascalCase.
- **Indentation**: 2 spaces (enforced by ESLint).
- **Import Aliases**:
    - `@` -> `src/renderer`
    - `@shared` -> `src/shared` (Check webpack config if this alias exists, standard in electron-vue)
- **Icons**: Custom `mo-icon` component wrapping SVG icons.

## Development Commands
- `yarn dev`: Start development server (Main + Renderer hot reload).
- `yarn build`: Build application for production.
- `yarn lint:fix`: Fix linting errors.

## Application Lifecycle
1.  **Main Process** starts, initializes `Application` class.
2.  **Window** created, loads `src/renderer/pages/index/index.ejs`.
3.  **Renderer** initializes Vue, stores, and connects to OS primitives via IPC.
