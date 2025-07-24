// js/ui.js

import { state } from './state.js';
import * as Inventory from './inventory.js';
import { getSuccessesNeeded } from './skills.js';
import * as Save from './save.js';

// (All DOM element variables remain the same)
const skillCheckModal = document.getElementById('skill-check-modal');
const skillCheckTitle = document.getElementById('skill-check-title');
const skillCheckBonus = document.getElementById('skill-check-bonus');
const skillCheckDc = document.getElementById('skill-check-dc');
const skillCheckRollBtn = document.getElementById('skill-check-roll-btn');
const skillCheckResult = document.getElementById('skill-check-result');
const charSkills = document.getElementById('char-skills');
const charSheetModal = document.getElementById('character-sheet-modal');
const inventoryModal = document.getElementById('inventory-modal');
const inventoryList = document.getElementById('inventory-list');
const openCharSheetBtn = document.getElementById('open-char-sheet');
const closeCharSheetBtn = document.getElementById('close-char-sheet');
const openInventoryBtn = document.getElementById('open-inventory-btn');
const closeInventoryBtn = document.getElementById('close-inventory-btn');
const charName = document.getElementById('char-name');
const charRace = document.getElementById('char-race');
const charBackground = document.getElementById('char-background');
const charHp = document.getElementById('char-hp');
const charAr = document.getElementById('char-ar');
const attrCon = document.getElementById('attr-con');
const attrDex = document.getElementById('attr-dex');
const attrWis = document.getElementById('attr-wis');
const attrInt = document.getElementById('attr-int');
const attrCha = document.getElementById('attr-cha');
const charWeapon = document.getElementById('char-weapon');
const charArmor = document.getElementById('char-armor');
const charItems = document.getElementById('char-items');
const saveGameInventoryBtn = document.getElementById('save-game-inventory-btn');
const saveGameSheetBtn = document.getElementById('save-game-sheet-btn');
const resetGameBtn = document.getElementById('reset-game-btn');


// A new variable to hold the callback function from combat
let combatCallback = null;

export function init() {
    openCharSheetBtn.addEventListener('click', openCharacterSheet);
    closeCharSheetBtn.addEventListener('click', closeCharacterSheet);
    charSheetModal.querySelector('.modal-backdrop').addEventListener('click', closeCharacterSheet);
    openInventoryBtn.addEventListener('click', openInventory);
    closeInventoryBtn.addEventListener('click', closeInventory);
    inventoryModal.querySelector('.modal-backdrop').addEventListener('click', closeInventory);
    inventoryList.addEventListener('click', handleInventoryAction);
    saveGameInventoryBtn.addEventListener('click', handleSaveGame);
    saveGameSheetBtn.addEventListener('click', handleSaveGame);
    resetGameBtn.addEventListener('click', handleResetGame);
}

// (updateCharacterSheet remains unchanged)
export function updateCharacterSheet() {
    const player = state.player;
    if (!player) return;

    if(charName) charName.textContent = player.name || '...';
    if(charRace) charRace.textContent = player.race ? player.race.name : 'N/A';
    if(charBackground) charBackground.textContent = player.profession ? player.profession.name : 'N/A';
    if(charHp) charHp.textContent = `${player.hp} / ${player.maxHp}`;
    if(charAr) charAr.textContent = player.armorRating;

    const formatBonus = (bonus) => bonus >= 0 ? `+${bonus}` : String(bonus);
    if(attrCon) attrCon.textContent = formatBonus(player.attributeBonuses.Constitution);
    if(attrDex) attrDex.textContent = formatBonus(player.attributeBonuses.Dexterity);
    if(attrWis) attrWis.textContent = formatBonus(player.attributeBonuses.Wisdom);
    if(attrInt) attrInt.textContent = formatBonus(player.attributeBonuses.Intelligence);
    if(attrCha) attrCha.textContent = formatBonus(player.attributeBonuses.Charisma);

    if(charWeapon) charWeapon.textContent = player.weapon ? player.weapon.name : 'None';
    if(charArmor) charArmor.textContent = player.armor ? player.armor.name : 'None';
    
    if (charItems) {
        charItems.innerHTML = '';
        if (player.inventory.length === 0) {
            charItems.innerHTML = `<li>Empty</li>`;
        } else {
            player.inventory.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.name;
                charItems.appendChild(li);
            });
        }
    }
    
    if (charSkills) {
        charSkills.innerHTML = '';
        const skillsToDisplay = Object.entries(player.skills);

        if (skillsToDisplay.length === 0) {
            charSkills.innerHTML = `<p class="text-gray-400">No skills found.</p>`;
        } else {
            skillsToDisplay.sort((a, b) => a[0].localeCompare(b[0])).forEach(([name, data]) => {
                let progressHTML;
                if (data.level >= 5) {
                    progressHTML = `
                        <div class="w-full bg-yellow-600 rounded-full h-2.5"></div>
                        <p class="text-xs text-right text-yellow-400">Max Level</p>
                    `;
                } else {
                    const needed = getSuccessesNeeded(data.level); 
                    const progressPercent = needed ? Math.min((data.successes / needed) * 100, 100) : 100;
                    progressHTML = `
                        <div class="w-full bg-gray-700 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progressPercent}%"></div>
                        </div>
                        <p class="text-xs text-right text-gray-400">${data.successes} / ${needed}</p>
                    `;
                }

                const skillHTML = `
                    <div class="mb-2">
                        <div class="flex justify-between items-baseline">
                            <span>${name}</span>
                            <span class="text-sm text-yellow-400">Level ${data.level}</span>
                        </div>
                        ${progressHTML}
                    </div>
                `;
                charSkills.innerHTML += skillHTML;
            });
        }
    }
}


export function updateInventory(mode = 'normal') {
    const player = state.player;
    if (!player || !inventoryList) return;
    inventoryList.innerHTML = ''; 

    // Filter items based on the mode
    const itemsToShow = (mode === 'combat')
        ? player.inventory.filter(item => item.itemCategory === 'consumable')
        : player.inventory;

    if (itemsToShow.length === 0) {
        const message = (mode === 'combat')
            ? "You have no usable items for combat."
            : "Your inventory is empty.";
        inventoryList.innerHTML = `<p class="text-gray-400">${message}</p>`;
        return;
    }

    itemsToShow.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center bg-gray-900/50 p-3 rounded';
        
        let buttonHtml = '';
        if (item.itemCategory === 'consumable') {
            buttonHtml = `<button data-id="${item.instanceId}" class="use-btn bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded">Use</button>`;
        } else if (item.itemCategory === 'weapon' || item.itemCategory === 'armor') {
            buttonHtml = `<button data-id="${item.instanceId}" class="equip-btn bg-green-600 hover:bg-green-500 px-3 py-1 rounded">Equip</button>`;
        }
        
        itemDiv.innerHTML = `
            <span>${item.name}</span>
            <div class="flex gap-2">
                ${buttonHtml}
            </div>
        `;
        inventoryList.appendChild(itemDiv);
    });
}


function openCharacterSheet() {
    updateCharacterSheet();
    charSheetModal.classList.remove('modal-hidden');
}
function closeCharacterSheet() {
    charSheetModal.classList.add('modal-hidden');
}

function openInventory() {
  updateInventory('normal');
  inventoryModal.classList.remove('modal-hidden');
}

export function openCombatInventory(callback) {
    combatCallback = callback; 
    updateInventory('combat');
    inventoryModal.classList.remove('modal-hidden');
}

function closeInventory() {
    inventoryModal.classList.add('modal-hidden');
    if (combatCallback) {
        combatCallback();
        combatCallback = null; 
    }
}

function handleInventoryAction(event) {
    const button = event.target.closest('button');
    if (!button) return;
    
    const instanceId = button.dataset.id;
    if (!instanceId) return;
    
    document.getElementById('click-sound')?.play();

    if (button.classList.contains('use-btn')) {
        Inventory.useItem(instanceId);
        if (combatCallback) {
            closeInventory();
        }
    } else if (button.classList.contains('equip-btn')) {
        Inventory.equipItem(instanceId);
    }
    
    updateInventory(combatCallback ? 'combat' : 'normal');
    updateCharacterSheet();
}

function handleSaveGame(event) {
    const button = event.currentTarget;
    const originalIcon = button.innerHTML;
    if (Save.saveGame()) {
        button.innerHTML = 'Saved!';
        setTimeout(() => {
            button.innerHTML = originalIcon;
        }, 1500);
    } else {
        button.innerHTML = 'Error!';
        setTimeout(() => {
            button.innerHTML = originalIcon;
        }, 1500);
    }
}
function handleResetGame() {
    if (confirm("Are you sure you want to delete your save and restart the game? This action cannot be undone.")) {
        Save.deleteSave();
        location.reload(); 
    }
}