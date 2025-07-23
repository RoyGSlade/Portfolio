// js/exploration.js

import { state } from './state.js';
import { log } from './logger.js';
import * as Inventory from './inventory.js';
import * as UI from './ui.js';
import { performSkillCheck } from './skills.js';
import { startBgm } from './bgm.js'; 

const choicesDisplay = document.getElementById('choices-display');

function renderChoices(choices) {
    choicesDisplay.innerHTML = '';
    if (!choices || choices.length === 0) {
        choicesDisplay.innerHTML = '<p class="text-gray-400">The path ends here for now.</p>';
        return;
    }

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.className = 'p-4 bg-gray-700 hover:bg-yellow-600 rounded-md transition-colors text-left text-lg';
        
        // Use data attributes to store what the button does
        if (choice.leadsTo) button.dataset.leadsTo = choice.leadsTo;
        if (choice.type) button.dataset.type = choice.type;
        if (choice.enemyId) button.dataset.enemyId = choice.enemyId;
        if (choice.skill) button.dataset.skill = choice.skill;
        if (choice.dc) button.dataset.dc = choice.dc;
        if (choice.onSuccess) button.dataset.onSuccess = choice.onSuccess;
        if (choice.onFailure) button.dataset.onFailure = choice.onFailure;
        if (choice.requires) {
            if (choice.requires.itemEquipped) {
                const armorMatch = state.player.armor.id === choice.requires.itemEquipped;
                const weaponMatch = state.player.weapon.id === choice.requires.itemEquipped;
                if (!armorMatch && !weaponMatch) {
                    button.disabled = true;
                    button.title = "You must equip the right item first.";
                    button.className += ' opacity-50 cursor-not-allowed';
                }
            }
        }
        choicesDisplay.appendChild(button);
    });
}

export function goToScene(sceneId) {
    const scene = state.gameData.story[sceneId];
    if (!scene) {
        log(`Error: Scene "${sceneId}" not found.`);
        return;
    }
    
    state.currentScene = sceneId;
    log(scene.text);

    // --- UPDATED ACTION HANDLING ---
    if (scene.actions) {
        scene.actions.forEach(action => {
            switch (action.type) {
                case 'addItem':
                    Inventory.addItem(action.itemId);
                    log(`You found: ${state.gameData.items[action.itemId].name}`);
                    break;
                case 'setHP':
                    state.player.hp = action.value;
                    if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
                    if (state.player.hp < 0) state.player.hp = 0;
                    log(`(Your health is now ${state.player.hp})`);
                    break;
                case 'setFlag':
                    // This assumes you will add a 'flags' object to the state
                    if (!state.flags) state.flags = {};
                    state.flags[action.flag] = action.value;
                    break;
            }
        });
        // We update the UI once after all actions are processed
        UI.updateCharacterSheet(); 
    }
    
    renderChoices(scene.choices);
}

choicesDisplay.addEventListener('click', async (event) => {

    if (!state.bgmStarted) {
        startBgm();
        state.bgmStarted = true;
    }
    // Guard clause to prevent this listener from firing during character creation
    if (state.mode !== 'exploration') return;

    const choice = event.target.closest('button');
    if (!choice) return;

    document.getElementById('click-sound')?.play().catch(e => console.warn("Sound play failed.", e));
    
    // Disable all buttons immediately to prevent multiple clicks
    choicesDisplay.querySelectorAll('button').forEach(b => b.disabled = true);

    const { leadsTo, type, enemyId, skill, dc, onSuccess, onFailure } = choice.dataset;

    if (type === 'startCombat') {
        const combatEvent = new CustomEvent('startCombat', { detail: { enemyId } });
        document.dispatchEvent(combatEvent);

    } else if (type === 'skillCheck') {
        // AWAIT the result of the player's roll
        const success = await performSkillCheck(skill, parseInt(dc));
        
        // The result message is now shown in skills.js, we just need to go to the next scene
        setTimeout(() => {
            if (success && onSuccess) {
                goToScene(onSuccess);
            } else if (!success && onFailure) {
                goToScene(onFailure);
            }
        }, 1000); // Shorter delay since the calculation is already shown
        
    } else if (leadsTo) {
        goToScene(leadsTo);
    }
});

export function refreshCurrentSceneUI() {
    const scene = state.gameData.story[state.currentScene];
    if (scene) {
        _renderChoices(scene.choices);
    }
}