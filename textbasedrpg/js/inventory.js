// js/inventory.js

import { state } from './state.js';
import { log } from './logger.js';
import { heal } from './player.js';
import * as Exploration from './exploration.js';
  


let nextInstanceId = 1; // To give each item a unique ID

export function addItem(itemId) {
    let itemData;
    // Check all data sources for the item
    if (state.gameData.weapons[itemId]) {
        const src = state.gameData.weapons[itemId];
        itemData = { ...src, itemCategory: 'weapon' };   // keep src.type = melee/ranged/unarmed
    } else if (state.gameData.armor[itemId]) {
        const src = state.gameData.armor[itemId];
        itemData = { ...src, itemCategory: 'armor' };    // keep armor.type if you have one
    } else if (state.gameData.items[itemId]) {
        const src = state.gameData.items[itemId];
        itemData = { ...src, itemCategory: 'consumable' };
    }

    if (itemData) {
        itemData.instanceId = `item-${nextInstanceId++}`;
        state.player.inventory.push(itemData);
    } else {
        console.error(`Item with ID "${itemId}" not found in any data file.`);
    }
}

export function useItem(instanceId) {
    const itemIndex = state.player.inventory.findIndex(i => i.instanceId === instanceId);
    if (itemIndex === -1) return;

    const item = state.player.inventory[itemIndex];

    // Handle effects
    if (item.effect?.action === 'heal') {
        heal(item.effect.amount);
        log(`You use the ${item.name} and recover ${item.effect.amount} HP.`);
    }

    // Remove from inventory
    state.player.inventory.splice(itemIndex, 1);
}

export function equipItem(instanceId) {
    const itemIndex = state.player.inventory.findIndex(i => i.instanceId === instanceId);
    if (itemIndex === -1) return;

    const itemToEquip = state.player.inventory[itemIndex];
    
    if (itemToEquip.itemCategory === 'weapon') {
        // Unequip current weapon by adding it back to inventory (if it's not 'Fists')
        if (state.player.weapon.id !== 'unarmed') {
            state.player.inventory.push(state.player.weapon);
        }
        // Equip new weapon
        state.player.weapon = itemToEquip;
        // Remove new weapon from inventory
        state.player.inventory.splice(itemIndex, 1);
        log(`You equip the ${itemToEquip.name}.`);

    } else if (itemToEquip.itemCategory === 'armor') {
        // Unequip current armor by adding it back to inventory
        state.player.inventory.push(state.player.armor);
        // Equip new armor
        state.player.armor = itemToEquip;
        // Remove new armor from inventory
        state.player.inventory.splice(itemIndex, 1);
        log(`You equip the ${itemToEquip.name}.`);
    }
    if (state.currentScene === 'start_tutorial' && itemToEquip.id === 'basic_clothes') {
    // Player did the right thing! Move them to the next part of the story.
    import('./exploration.js').then(Exploration => {
        Exploration.goToScene('start'); // 'start' is the scene with the locker
    });
    }
    
    // Recalculate stats after changing equipment
    
    state.player.recalculateStats();
     setTimeout(() => {
        // Special check for the tutorial to advance the story
        if (state.currentScene === 'start_tutorial' && itemToEquip.id === 'basic_clothes') {
            Exploration.goToScene('start');
        } else {
            Exploration.goToScene(state.currentScene);
        }
    }, 2000); // 2-second delay
}

// In this MVP, crafting is a placeholder. A full system would be very complex.
export function craftItem(recipeId) {
    log("Crafting system not yet implemented.");
    // 1. Check if player has recipe and materials.
    // 2. Perform skill checks based on recipe difficulty.
    // 3. If successful, add the crafted item to inventory.
}