// js/save.js
import { state } from './state.js';
import { PlayerCharacter } from './player.js';

const SAVE_KEY = 'infiniteAgesSave';

/**
 * Gathers the current game state and saves it to Local Storage.
 */
export function saveGame() {
    if (!state.player) return; // Can't save if there's no player

    const saveState = {
        player: state.player,
        currentScene: state.currentScene,
        flags: state.flags || {},
        mode: state.mode, // <-- FIX: Add the current mode to the save file
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
        console.log('Game Saved!', saveState);
        return true;
    } catch (error) {
        console.error("Failed to save game:", error);
        return false;
    }
}

/**
 * Loads the game state from Local Storage.
 * @returns {boolean} - True if a save was successfully loaded, false otherwise.
 */
export function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return false;

    try {
        const loadedState = JSON.parse(savedData);

        // CRITICAL: Re-hydrate the player object to restore its methods.
        const rehydratedPlayer = new PlayerCharacter(loadedState.player.name);
        Object.assign(rehydratedPlayer, loadedState.player);
        state.player = rehydratedPlayer;
        
        state.currentScene = loadedState.currentScene;
        state.flags = loadedState.flags;
        // FIX: Restore the game mode from the save file. Fallback to exploration.
        state.mode = loadedState.mode || 'exploration';

        console.log('Game Loaded!', loadedState);
        return true;
    } catch (error) {
        console.error("Failed to load game:", error);
        return false;
    }
}

/**
 * Deletes the save file from Local Storage.
 */
export function deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    console.log('Save data deleted.');
}