// js/player.js

import { state } from './state.js';
import * as UI from './ui.js';

const SUCCESS_THRESHOLDS = [0, 5, 10, 20, 30, 50];

export class PlayerCharacter {
    // (Constructor and other methods are unchanged)
    constructor(name) {
        this.name = name;
        this.race = null;
        this.profession = null;
        this.training = null;
        this.major = null;
        this.level = 1;
        this.totalSkillLevels = 0;
        this.attributes = { Constitution: 10, Dexterity: 10, Wisdom: 10, Intelligence: 10, Charisma: 10 };
        this.attributeBonuses = { Constitution: 0, Dexterity: 0, Wisdom: 0, Intelligence: 0, Charisma: 0 };
        this.skills = {}; // Starts empty
        this.inventory = [];
        this.credits = 0;
        this.weapon = null; 
        this.armor = null;  
        this.persona = {};
        this.hp = 0;
        this.maxHp = 0;
        this.armorRating = 0;
        this.initiative = 0;
    }
    
    initializeSkills() {
        for (const skillData of state.gameData.skills) {
            this.skills[skillData.name] = { level: 0, successes: 0 };
        }
    }
    
    equipDefaultGear() {
        this.weapon = state.gameData.weapons.unarmed;
        this.armor = state.gameData.armor.jumpsuit;
    }

    setRace(raceName) {
        const raceData = state.gameData.races.find(r => r.name === raceName);
        if (!raceData) return;
        this.race = raceData;
        for (const attrKey in raceData.attributeBonus) {
            if (attrKey !== 'choice') {
                const attrName = attrKey.charAt(0).toUpperCase() + attrKey.slice(1);
                this.attributes[attrName] += raceData.attributeBonus[attrKey];
            }
        }
    }
    
    applyRaceBonuses(skillChoice, attributeChoices = {}) {
        // FIX: Ensure skill exists before trying to modify it
        if (!this.skills[skillChoice]) {
             this.skills[skillChoice] = { level: 0, successes: 0 };
        }
        this.skills[skillChoice].level = 1;

        for (const attr in attributeChoices) {
            this.attributes[attr] += attributeChoices[attr];
        }
    }
    
    allocateAttributes(points) {
        for (const attr in points) {
            this.attributes[attr] += points[attr];
        }
    }

    setProfession(professionName) {
        const profData = state.gameData.professions.find(p => p.name === professionName);
        if (!profData) return;
        this.profession = profData;
        this.credits = profData.startingCredits;
    }

    setTraining(trainingName, majorName) {
        const trainData = state.gameData.trainings.find(t => t.name === trainingName);
        const majorData = trainData.majors.find(m => m.name === majorName);
        if (!trainData || !majorData) return;
        this.training = trainData;
        this.major = majorData;
        this.attributes[majorData.attribute] += 1;
        if (!this.skills[majorData.skill]) {
             this.skills[majorData.skill] = { level: 0, successes: 0 };
        }
        this.skills[majorData.skill].level += 1; 
    }
    
    setPersona(personaDetails) { this.persona = personaDetails; }
    applyPersonaSkill(skillName) { 
        if (!this.skills[skillName]) {
             this.skills[skillName] = { level: 0, successes: 0 };
        }
        this.skills[skillName].level += 1; 
    }

    checkForCharacterLevelUp() {
        this.totalSkillLevels = Object.values(this.skills).reduce((sum, skill) => sum + (skill.level || 0), 0);
        const nextLevelData = state.gameData.leveling.find(l => l.level === this.level + 1);

        if (nextLevelData && this.totalSkillLevels >= nextLevelData.totalSkillLevels) {
            this.levelUpCharacter(nextLevelData);
        }
    }
    
    levelUpCharacter(levelData) {
        this.level = levelData.level;
        let levelUpMessage = `\nCongratulations! You reached Level ${this.level}!\n\n`;

        if (levelData.attribute) levelUpMessage += `+ You gain ${levelData.attribute} attribute point(s) to spend!\n`;
        if (levelData.hp) levelUpMessage += `+ Hit Points increased!\n`;
        if (levelData.profession) levelUpMessage += `+ Your Profession abilities have improved!\n`;

        alert(levelUpMessage);
        this.recalculateStats();
        UI.updateCharacterSheet();
    }

    recalculateStats() {
        for(const attr in this.attributes) {
            this.attributeBonuses[attr] = Math.floor((this.attributes[attr] - 10) / 2);
        }
        
        const conBonus = this.attributeBonuses.Constitution;
        const oldMaxHp = this.maxHp;
        this.maxHp = (this.training?.hitPoints || 8) + conBonus + this.level; // Add level to HP

        if (this.hp === oldMaxHp || oldMaxHp === 0) {
            this.hp = this.maxHp;
        } else {
             this.hp = Math.min(this.hp + (this.maxHp - oldMaxHp), this.maxHp);
        }

        const dexBonus = this.attributeBonuses.Dexterity;
        const baseArmorRating = this.armor ? this.armor.armorRating : 10;
        this.armorRating = baseArmorRating + dexBonus;
        this.initiative = (this.training?.initiative || 0) + dexBonus;
    }
    
    finalize() { this.recalculateStats(); }
}

// --- Global Player Management functions ---

/**
 * Adds successes to a skill, creating it if it doesn't exist, and checks for level up.
 * @param {string} skillName The name of the skill to credit.
 * @param {number} amount The number of successes to add (can be a float).
 */
export function addSkillSuccess(skillName, amount = 1) {
    const player = state.player;
    if (!player) return;

    // FIX: If player uses a skill they don't have, add it to their sheet at level 0.
    if (!player.skills[skillName]) {
        player.skills[skillName] = { level: 0, successes: 0 };
    }

    const skill = player.skills[skillName];
    // Don't add successes if the skill is max level (level 5)
    if (skill.level >= 5) return;

    skill.successes += amount;
    
    const needed = SUCCESS_THRESHOLDS[skill.level + 1];

    if (skill.successes >= needed) {
        levelUpSkill(skillName);
    }
    
    // Always update the UI to show the new success value
    UI.updateCharacterSheet();
}


function levelUpSkill(skillName) {
    const player = state.player;
    const skill = player.skills[skillName];
    const needed = SUCCESS_THRESHOLDS[skill.level + 1];
    
    skill.level++;
    // Carry over any extra successes
    skill.successes = skill.successes - needed; 
    
    alert(`SKILL INCREASED!\n\nYour ${skillName} skill is now Level ${skill.level}!`);
    player.checkForCharacterLevelUp();
}

export function takeDamage(amount) {
    state.player.hp -= amount;
    if (state.player.hp < 0) state.player.hp = 0;
    UI.updateCharacterSheet();
}

export function heal(amount) {
    state.player.hp += amount;
    if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
    UI.updateCharacterSheet();
}