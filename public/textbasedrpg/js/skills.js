// js/skills.js

import { state } from './state.js';
import { log } from './logger.js';
import * as Player from './player.js';

const choicesDisplay = document.getElementById('choices-display');
const SUCCESS_THRESHOLDS = [0, 5, 10, 20, 30, 50];

/**
 * A public helper function used by the UI to display skill progression.
 * @param {number} currentLevel - The skill's current level.
 * @returns {number} - The number of successes required for the next level.
 */
export function getSuccessesNeeded(currentLevel) {
    // Return infinity if the skill is already at max level (5)
    if (currentLevel >= 5) {
        return Infinity;
    }
    return SUCCESS_THRESHOLDS[currentLevel + 1];
}


/**
 * Renders an interactive dice rolling UI and waits for the player's input.
 * This function is internal to this module.
 * @param {string} skillName - The name of the skill being checked.
 * @returns {Promise<{total: number, roll: number}>} - A promise that resolves with both the total roll value and the raw d20 roll.
 */
function getPlayerRoll(skillName) {
    return new Promise(resolve => {
        const player = state.player;
        
        // Handle skills that the player hasn't learned yet by treating them as level 0.
        const skill = player.skills[skillName] || { level: 0 };
        const attributeName = state.gameData.skills.find(s => s.name === skillName)?.attribute.split(' or ')[0]; 
        const attributeBonus = player.attributeBonuses[attributeName] || 0;
        const totalBonus = skill.level + attributeBonus;

        log(`You are attempting to use your ${skillName} skill. The bonus from your skill level (${skill.level}) and ${attributeName} attribute (${attributeBonus}) is +${totalBonus}.`);

        // Create the rolling UI in the choices display area
        choicesDisplay.innerHTML = `
            <div class="w-full col-span-1 md:col-span-2 flex flex-col items-center gap-4">
                <div id="dice-result" class="font-title text-6xl text-gray-500">?</div>
                <button id="roll-btn" class="w-1/2 p-4 bg-yellow-600 hover:bg-yellow-500 rounded-md transition-colors text-gray-900 font-bold">Roll d20</button>
                <div id="roll-calculation" class="text-gray-400 text-center"></div>
            </div>
        `;
        
        const rollBtn = document.getElementById('roll-btn');
        const diceResult = document.getElementById('dice-result');
        const rollCalculation = document.getElementById('roll-calculation');

        rollBtn.onclick = () => {
            document.getElementById('click-sound')?.play().catch(e => console.warn("Sound play failed.", e));
            rollBtn.disabled = true; // Prevent multiple clicks
            rollBtn.classList.add('opacity-50', 'cursor-not-allowed');

            const roll = Math.floor(Math.random() * 20) + 1;
            const total = roll + totalBonus;

            // Animate the dice result
            diceResult.textContent = roll;
            diceResult.classList.remove('text-gray-500');
            diceResult.classList.add('text-white', 'fade-in');

            // Show the breakdown of the roll after a short delay
            setTimeout(() => {
                rollCalculation.innerHTML = `
                    <p class="fade-in">Roll: ${roll}</p>
                    <p class="fade-in">Bonus: +${totalBonus} <span class="text-xs">(${skillName})</span></p>
                    <p class="fade-in font-bold text-xl text-yellow-400">Total: ${total}</p>
                `;
                // Resolve the promise with the final numbers after animations complete
                setTimeout(() => resolve({ total, roll }), 1500);
            }, 500);
        };
    });
}


/**
 * The core mechanic for all non-combat skill actions. This function orchestrates the 
 * interactive roll, determines the outcome, and grants skill successes to the player.
 * @param {string} skillName - The name of the skill to check (e.g., "Athlete").
 * @param {number} dc - The Difficulty Class (Challenge Rating) to beat.
 * @returns {Promise<boolean>} - A promise that resolves with true for success or false for failure.
 */
export async function performSkillCheck(skillName, dc) {
    const { total: totalRoll, roll: rawRoll } = await getPlayerRoll(skillName);
    
    let outcomeIsSuccess;
    let successAmount = 0;

    // Determine the amount of successes to grant based on the roll quality.
    // This is where critical successes and failures are handled.
    if (rawRoll === 20) {
        outcomeIsSuccess = true; // A natural 20 is always a success.
        log(`Critical Success! Your natural 20 ensures an outstanding result.`);
        successAmount = 2; // Grant 2 successes for a crit.
    } else if (rawRoll === 1) {
        outcomeIsSuccess = false; // A natural 1 is always a failure.
        log(`Critical Failure! A natural 1 spells disaster.`);
        successAmount = 0.5; // Still learn a little (0.5 successes) from a total failure.
    } else if (totalRoll >= dc) {
        outcomeIsSuccess = true;
        log(`Success! Your total of ${totalRoll} meets or exceeds the DC of ${dc}.`);
        successAmount = 1; // Grant 1 success for a standard success.
    } else {
        outcomeIsSuccess = false;
        log(`Failure. Your total of ${totalRoll} was not high enough to beat the DC of ${dc}.`);
        successAmount = 0.5; // Grant 0.5 successes for learning from a near-miss.
    }

    // Call the global function in player.js to add the calculated successes.
    // This will create the skill on the character sheet if it's the first time being used.
    Player.addSkillSuccess(skillName, successAmount);

    // Return the boolean result to the exploration module, which determines the story path.
    return outcomeIsSuccess;
}