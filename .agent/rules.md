# AI Operational Rules for Motrix

These rules help ensure code quality and consistency when working on this project.

## 1. Coding Style & Linting
- **Indentation**: ALWAYS use 2 spaces.
- **Semicolons**: NEVER use semicolons (Standard JS style).
- **Quotes**: Use single quotes `'` for strings.
- **Linting**: After making edits, if unsure about formatting, suggest running `yarn lint:fix`.

## 2. Vue.js Guidelines
- **Version**: Vue 2.7.x.
- **API Style**: Use the Options API (`data`, `methods`, `computed`, `watch`). Do NOT use Composition API (`<script setup>`) unless explicitly refactoring to it (requires `@vue/composition-api` or Vue 2.7+ setup, but keep consistency with existing codebase).
- **Components**:
  - Place components in `src/renderer/components`.
  - Use PascalCase for component filenames (e.g., `DownloadItem.vue`).
  - Use `mo-` prefix for custom icons/components if adhering to project convention.

## 3. Electron Guidelines
- **Security Check**: Be careful when using `remote` module. It is deprecated in newer Electron versions. Use `ipcRenderer` and `ipcMain` for communication.
- **Node Integration**: The project likely has `nodeIntegration: true` or uses preload scripts. Verify before adding Node.js specific code in Renderer.

## 4. State Management
- Use **Vuex** for global state.
- Actions/Mutations should be defined in `src/renderer/store`.

## 5. File System & paths
- Use `path.join` for file paths to ensure cross-platform compatibility (Windows/macOS/Linux).
- Be aware of `__static` global for static assets.
