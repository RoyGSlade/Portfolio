// js/main.js

import { state } from './state.js';
import * as Exploration from './exploration.js';
import * as Combat from './combat.js';
import * as Creation from './creation.js';
import * as UI from './ui.js';
import { PlayerCharacter } from './player.js';
import * as Save from './save.js'; // <-- IMPORT THE NEW MODULE
import { log } from './logger.js'; // <-- IMPORT LOGGER

async function loadGameData() {
    // Added 'enemies' to the list to ensure they are loaded for combat.
    const dataFiles = ['story', 'weapons', 'armor', 'items', 'races', 'professions', 'trainings', 'skills', 'personaPresets', 'powers', 'leveling', 'enemies'];
    for (const file of dataFiles) {
        try {
            const response = await fetch(`./data/${file}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            state.gameData[file] = await response.json();
        } catch (error) {
            console.error(`Failed to load ${file}.json:`, error);
        }
    }
    // Process skills into a more accessible key-value map.
    state.skills = state.gameData.skills.reduce((acc, skill) => {
        acc[skill.name] = skill;
        return acc;
    }, {});
}

async function initializeGame() {
    await loadGameData();
    UI.init(); // Initialize UI listeners early

    // --- NEW: ATTEMPT TO LOAD A SAVED GAME ---
    if (Save.loadGame()) {
        log("Save file found. Welcome back.");
        // The game state is now loaded.
        // We just need to update the UI and go to the correct scene.
        setTimeout(() => {
            UI.updateCharacterSheet();
            Exploration.goToScene(state.currentScene);
        }, 500);
    } else {
       // 1. Create the new player instance
        const newPlayer = new PlayerCharacter("TempName");
        
        // 2. IMMEDIATELY assign it to the global state. Now it's not null anymore.
        state.player = newPlayer;

        // 3. Initialize its data now that gameData is loaded and it's in the state
        state.player.initializeSkills();
        state.player.equipDefaultGear();

        // 4. Start the creation process. It will now modify state.player directly.
        await Creation.startCharacterCreation();
    }
}


// Custom event listeners (no changes)
document.addEventListener('startCombat', (event) => Combat.startCombat(event.detail.enemyId));
document.addEventListener('endCombat', (event) => {
    // Go to the correct scene based on victory or defeat.
    const nextScene = event.detail.victory ? 'combat_victory' : 'game_over';
    Exploration.goToScene(nextScene);
});




initializeGame();