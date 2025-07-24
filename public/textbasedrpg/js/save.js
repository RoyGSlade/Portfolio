// js/save.js
import { state } from './state.js';
import { PlayerCharacter } from './player.js';

const SAVE_KEY = 'infiniteAgesSave';

/**
 * Gathers the current game state and saves it to Local Storage.
 */
export function saveGame() {
    if (!state.player) {
        console.error("Attempted to save without a player object.");
        return false;
    }

    const saveState = {
        player: state.player,
        currentScene: state.currentScene,
        flags: state.flags || {},
        mode: state.mode, // Save the current game mode (e.g., 'exploration', 'combat')
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
        console.log('Game Saved!', saveState);
        return true;
    } catch (error) {
        // This can happen if the player object has circular references or other non-serializable data.
        console.error("Failed to save game due to a serialization error:", error);
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

        // CRITICAL: Re-hydrate the player object to restore its class methods.
        const rehydratedPlayer = new PlayerCharacter(loadedState.player.name);
        Object.assign(rehydratedPlayer, loadedState.player);
        state.player = rehydratedPlayer;
        
        state.currentScene = loadedState.currentScene;
        state.flags = loadedState.flags || {};

        // A save file should never be in 'combat' or 'creation' mode, as the
        // state for those modes isn't fully serialized. If we find one, we revert
        // to 'exploration' to prevent the game from loading into a broken state where
        // UI doesn't respond.
        let loadedMode = loadedState.mode;
        if (loadedMode === 'combat' || loadedMode === 'creation') {
            console.warn(`Save file loaded with invalid mode "${loadedMode}". Defaulting to "exploration".`);
            state.mode = 'exploration';
        } else {
            state.mode = loadedMode || 'exploration';
        }

        console.log('Game Loaded!', loadedState);
        return true;
    } catch (error) {
        console.error("Failed to load corrupted or outdated save data:", error);
        // If loading fails, it's safest to clear the broken save to prevent future errors.
        deleteSave();
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