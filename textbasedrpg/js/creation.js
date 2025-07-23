// js/creation.js

import { state } from './state.js';
import { log } from './logger.js';
import { startBgm } from './bgm.js';
import * as Inventory from './inventory.js';
import * as Save from './save.js';

const choicesDisplay = document.getElementById('choices-display');
let resolvePromise;

function renderChoices(prompt, choices, callback, key = 'name') {
    log(prompt);
    choicesDisplay.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        const buttonText = typeof choice === 'object' ? choice[key] : choice;
        button.textContent = buttonText;
        button.title = choice.description || '';
        button.className = 'p-4 bg-gray-700 hover:bg-yellow-600 rounded-md transition-colors text-left text-lg';
        button.onclick = () => {
            document.getElementById('click-sound')?.play().catch(e => console.warn("Sound play failed.", e));
            callback(buttonText);
        };
        choicesDisplay.appendChild(button);
    });
}

// MODIFIED: The function no longer needs to accept a player instance.
// It will now modify state.player which was already created in main.js.
export function startCharacterCreation() {
    return new Promise(resolve => {
        resolvePromise = resolve;
        step1_Name();
    });
}

function step1_Name() {
    log("Welcome to Infinite Ages. Please enter your name:");
    choicesDisplay.innerHTML = `
        <input type="text" id="name-input" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-center text-xl" placeholder="Enter your character name...">
        <button id="confirm-name" class="w-full p-4 bg-green-700 hover:bg-green-600 rounded-md transition-colors">Confirm</button>
    `;
    document.getElementById('confirm-name').onclick = () => {
        document.getElementById('click-sound')?.play();
        if (!state.bgmStarted) {
            startBgm();
            state.bgmStarted = true;
        }
        const name = document.getElementById('name-input').value.trim();
        if (name) {
            // MODIFIED: Update the global state directly.
            state.player.name = name;
            step2_Race();
        } else {
            log("A name is required to begin your legend.");
        }
    };
}

function step2_Race() {
    // MODIFIED: Use state.player to get the name.
    renderChoices(`Greetings, ${state.player.name}. From which lineage do you hail?\n(Hover for details)`, state.gameData.races, (raceName) => {
        // MODIFIED: Call setRace on the global player object.
        state.player.setRace(raceName);
        step2b_RaceBonuses();
    }, 'name');
}

function step2b_RaceBonuses() {
    // MODIFIED: Reference state.player.
    const raceData = state.player.race;
    const skillChoices = state.gameData.skills.filter(s => raceData.skillChoice.includes(s.name));

    if (raceData.name === "Human") {
        let points = 2;
        const allocated = {};
        // MODIFIED: Reference state.player.
        const attributes = Object.keys(state.player.attributes);
        attributes.forEach(attr => allocated[attr] = 0);

        function renderHumanAttrChoice() {
            log(`As a Human, you are versatile. Choose two attributes to increase by +1. (${points} remaining)`);
            choicesDisplay.innerHTML = `
                <div class="space-y-2">
                    ${attributes.map(attr => `
                        <div class="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                            <span>${attr}</span>
                            <button data-attr="${attr}" class="human-attr-btn bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded ${allocated[attr] > 0 ? 'opacity-50' : ''}">
                                ${allocated[attr] > 0 ? 'Selected' : 'Select'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            if (points === 0) {
                 choicesDisplay.innerHTML += `<button id="confirm-human-attr" class="w-full mt-4 p-4 bg-green-700 hover:bg-green-600 rounded-md">Confirm Attributes</button>`;
                 document.getElementById('confirm-human-attr').onclick = () => {
                    const finalChoices = {};
                    for(const attr in allocated) { if(allocated[attr] > 0) finalChoices[attr] = 1;}
                    renderSkillChoice(skillChoices, finalChoices);
                 };
            }
            
            document.querySelectorAll('.human-attr-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const attr = e.target.dataset.attr;
                    if (allocated[attr] === 0 && points > 0) {
                        allocated[attr] = 1;
                        points--;
                    } else if (allocated[attr] === 1) {
                        allocated[attr] = 0;
                        points++;
                    }
                    renderHumanAttrChoice();
                };
            });
        }
        renderHumanAttrChoice();
    } else {
        renderSkillChoice(skillChoices);
    }
}

function renderSkillChoice(skillChoices, attributeChoices = {}) {
     renderChoices("Your lineage grants you an innate talent. Choose one skill to reflect this:", skillChoices, (skillName) => {
        // MODIFIED: Update the global player object.
        state.player.applyRaceBonuses(skillName, attributeChoices);
        step3_Profession();
    });
}

function step3_Profession() {
    renderChoices("What was your life before this? Choose your Profession:", state.gameData.professions, (professionName) => {
        state.player.setProfession(professionName);
        step4_Training();
    });
}

function step4_Training() {
    renderChoices("Where did you hone your skills? Choose your Training background:", state.gameData.trainings, (trainingName) => {
        const training = state.gameData.trainings.find(t => t.name === trainingName);
        step4b_Major(training);
    });
}

function step4b_Major(training) {
    renderChoices(`You attended the ${training.name}. What was your Major?:`, training.majors, (majorName) => {
        state.player.setTraining(training.name, majorName);
        step5_AttributeAllocation();
    });
}

function step5_AttributeAllocation() {
    let points = 6;
    const allocatedPoints = { Constitution: 0, Dexterity: 0, Wisdom: 0, Intelligence: 0, Charisma: 0 };
    
    function render() {
        log(`You have ${points} points to allocate to your core attributes. (Max +2 per attribute)`);
        choicesDisplay.innerHTML = `
            <div class="space-y-4 text-xl">
                ${Object.keys(allocatedPoints).map(attr => `
                    <div class="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                        <span class="font-bold text-yellow-400">${attr}:</span>
                        <div class="flex items-center gap-4">
                            <!-- MODIFIED: Base attributes now come from state.player -->
                            <span class="text-gray-400 text-base">Base: ${state.player.attributes[attr]}</span>
                            <button data-attr="${attr}" class="attr-btn down bg-red-600 hover:bg-red-500 w-8 h-8 rounded">-</button>
                            <span class="w-4 text-center text-xl font-bold">${allocatedPoints[attr]}</span>
                            <button data-attr="${attr}" class="attr-btn up bg-green-600 hover:bg-green-500 w-8 h-8 rounded">+</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button id="confirm-attrs" class="w-full mt-6 p-4 bg-blue-700 rounded-md transition-colors ${points > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}">
                Confirm Attributes (${points} remaining)
            </button>
        `;

        document.querySelectorAll('.attr-btn').forEach(btn => {
            btn.onclick = (e) => {
                const attr = e.target.dataset.attr;
                if (e.target.classList.contains('up') && points > 0 && allocatedPoints[attr] < 2) {
                    points--;
                    allocatedPoints[attr]++;
                } else if (e.target.classList.contains('down') && allocatedPoints[attr] > 0) {
                    points++;
                    allocatedPoints[attr]--;
                }
                document.getElementById('click-sound')?.play();
                render();
            };
        });

        const confirmBtn = document.getElementById('confirm-attrs');
        if (points === 0) {
            confirmBtn.onclick = () => {
                document.getElementById('click-sound')?.play();
                // MODIFIED: Update the global player object.
                state.player.allocateAttributes(allocatedPoints);
                step6_Persona();
            };
        }
    }
    render();
}

function step6_Persona() {
    const persona = {};
    renderChoices("What is your primary Motivation?", state.gameData.personaPresets.motivations, (motivation) => {
        persona.motivation = motivation;
        renderChoices("What is your long-term Goal?", state.gameData.personaPresets.goals, (goal) => {
            persona.goals = goal;
            renderChoices("Choose a defining Trait:", [...state.gameData.personaPresets.traits.positive, ...state.gameData.personaPresets.traits.negative], (trait) => {
                persona.traits = [trait];
                // MODIFIED: Update the global player object.
                state.player.setPersona(persona);
                step7_PersonaSkill();
            }, null);
        }, 'long');
    });
}

function step7_PersonaSkill() {
    renderChoices("Your experiences have given you an edge. Choose one skill to improve:", state.gameData.skills, (skillName) => {
        // MODIFIED: Update the global player object.
        state.player.applyPersonaSkill(skillName);
        finalizeCharacter();
    });
}

function finalizeCharacter() {
    // MODIFIED: Finalize the global player object.
    state.player.finalize();

    // MODIFIED: Add items and save the game immediately.
    // These calls will now work because state.player is a valid object.
    Inventory.addItem('knife');
    Inventory.addItem('basic_clothes');
    Save.saveGame();

    choicesDisplay.innerHTML = '';
    log("Character creation complete. Your adventure begins now...");

    state.mode = 'exploration';
    setTimeout(() => {
        // MODIFIED: Resolve the promise without passing any data.
        // main.js is no longer waiting for the player object from here.
        resolvePromise();

        // This import can stay here, it correctly transitions to the game.
        import('./exploration.js').then(Exploration => {
            Exploration.goToScene('start_tutorial');
        });
    }, 2000);
}