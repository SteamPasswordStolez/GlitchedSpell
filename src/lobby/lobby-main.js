import { LobbyScene } from './LobbyScene.js';
import { MenuManager } from './MenuManager.js';

window.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize the 3D Showroom background
    const canvas = document.getElementById('lobby-canvas');
    if (canvas) {
        const lobbyScene = new LobbyScene(canvas);
        console.log("3D Lobby Scene Initialized");
    } else {
        console.error("Failed to find lobby-canvas element.");
    }

    // 2. Initialize the DOM Sidebar Menu Management
    const menuManager = new MenuManager();
    console.log("Menu Manager Initialized");
});
