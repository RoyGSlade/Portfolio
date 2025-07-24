// js/combat.js
import { state } from './state.js';
import { log } from './logger.js';
import { addSkillSuccess, takeDamage } from './player.js';
import * as UI from './ui.js';
import { interactiveRoll, rollExpr } from './dice.js';

const choicesDisplay = document.getElementById('choices-display');
const wait = (ms) => new Promise(res => setTimeout(res, ms));

export function startCombat(enemyId) {
  const base = state.gameData.enemies[enemyId];
  if (!base) {
    console.error(`Enemy with ID "${enemyId}" not found!`);
    return;
  }

  state.mode = 'combat';
  state.combat = {
    enemy: JSON.parse(JSON.stringify(base)),
    lastHit: false,
    awaitingDamage: false,
    isCrit: false, // <-- NEW: Track critical hits
  };

  log(`--- COMBAT START: A ${state.combat.enemy.name} appears! ---`);
  playerTurn();
}

/* =========================
   TURN FLOW
   ========================= */

async function playerTurn() {
  const e = state.combat.enemy;
  log(`Your HP: ${state.player.hp} | ${e.name} HP: ${e.hp}`);
  renderCombatChoices();
}

async function enemyTurn() {
  const e = state.combat.enemy;
  if (!e || state.player.hp <= 0) return;

  log(`${e.name} attacks!`);
  const atk = rollExpr('1d20').total;

  if (atk >= state.player.armorRating) {
    const dmg = rollExpr(e.damage).total;
    log(`${e.name} hits you for ${dmg} damage!`);
    takeDamage(dmg);
    UI.updateCharacterSheet();
  } else {
    log(`${e.name} misses!`);
  }

  if (state.player.hp <= 0) {
    log('You have been defeated.');
    endCombat(false);
    return;
  }

  await wait(400);
  playerTurn();
}

/* =========================
   BUTTON HANDLERS
   ========================= */

async function handleToHit() {
  const enemy = state.combat.enemy;
  if (!enemy) return;

  disableButtons();

  const weapon = state.player.weapon ?? state.gameData.weapons.unarmed;
  const { atkBonus, attrName, skillName } = calcAttackBonus(weapon);

  // Interactive roll for the attack
  const { total, core } = await interactiveRoll({
    label: 'Roll d20',
    base: '1d20',
    bonus: atkBonus,
    contextLabel: `${skillName}/${attrName}`
  });
  
  // FIX #2: Grant skill success for every attack roll
  addSkillSuccess(skillName);

  const rawRoll = core.rolls[0];
  const hit = rawRoll >= 19 || total >= enemy.armorRating;

  // FIX #3: Check for critical success
  if (rawRoll >= 19) {
    log(`CRITICAL HIT! (Rolled a ${rawRoll})`);
    state.combat.isCrit = true;
    addSkillSuccess(skillName); // Grant a second success for the crit
  } else {
    log(`To-Hit total ${total} vs AC ${enemy.armorRating} → ${hit ? 'HIT!' : 'MISS'}`);
  }

  state.combat.lastHit = hit;
  state.combat.awaitingDamage = hit;

  await wait(800);

  if (hit) {
    renderCombatChoices(); // To-Hit disabled, Damage enabled
  } else {
    await enemyReact();
  }
}

async function handleDamage() {
  const enemy = state.combat.enemy;
  if (!enemy || !state.combat.lastHit || !state.combat.awaitingDamage) return;

  disableButtons();

  const weapon = state.player.weapon ?? state.gameData.weapons.unarmed;
  const { dmgBonus, attrName } = calcDamageBonus(weapon);

  const { total, core } = await interactiveRoll({
    label: `Roll ${weapon.damage}`,
    base: weapon.damage,
    bonus: dmgBonus,
    contextLabel: attrName
  });
  
  let finalDamage = total;
  // FIX #3: Apply double damage on crits
  if (state.combat.isCrit) {
    finalDamage *= 2;
    log(`Critical damage bonus doubles the result!`);
  }

  enemy.hp -= finalDamage;
  log(`Damage dealt: ${finalDamage} (enemy HP now ${enemy.hp})`);

  state.combat.lastHit = false;
  state.combat.awaitingDamage = false;
  state.combat.isCrit = false; // Reset crit flag

  if (enemy.hp <= 0) {
    log(`The ${enemy.name} drops!`);
    endCombat(true);
    return;
  }

  await wait(600);
  await enemyReact();
}

async function enemyReact() {
  choicesDisplay.innerHTML = `<p class="text-gray-400">Enemy is reacting...</p>`;
  await wait(600);
  await enemyTurn();
}

// MODIFIED: This function now handles the logic for fleeing combat.
async function handleFlee() {
    disableButtons();
    log("You try to escape the fight...");
    await wait(1000);

    // If HP is low, fleeing is a desperate act and counts as a loss.
    if (state.player.hp <= state.player.maxHp / 2) {
        log("You barely get away, narrowly escaping a final blow. It feels like a defeat.");
        endCombat(false); // This will trigger the 'game_over' scene path.
    } else {
        // If HP is high, it's a successful tactical retreat.
        log("You successfully break away from the combat and retreat to safety.");
        endCombat(true); // This will trigger the 'combat_victory' scene path.
    }
}


/* =========================
   UI & END
   ========================= */

function renderCombatChoices() {
  choicesDisplay.innerHTML = '';

  // --- FIX: Determine weapon and skill name before rendering buttons ---
  const weapon = state.player.weapon ?? state.gameData.weapons.unarmed;
  const { skillName } = calcAttackBonus(weapon); // We only need the skill name here
  const toHitText = `Roll To-Hit ${weapon.name}`;

  makeBtn(
    'tohit-btn',
    toHitText,
    handleToHit,
    state.combat.awaitingDamage
  );
  makeBtn(
    'damage-btn',
    'Roll Damage',
    handleDamage,
    !state.combat.lastHit || !state.combat.awaitingDamage
  );
  makeBtn('useitem-btn', 'Use Item', () => UI.openCombatInventory(renderCombatChoices));
  makeBtn('flee-btn', 'Flee', handleFlee);
}

function endCombat(victory) {
  state.mode = 'exploration';
  document.dispatchEvent(new CustomEvent('endCombat', { detail: { victory } }));
  state.combat = null;
}

// (Helper functions makeBtn and disableButtons are unchanged)
function makeBtn(id, text, handler, disabled = false) {
  const b = document.createElement('button');
  b.id = id;
  b.textContent = text;
  b.disabled = disabled;
  b.className = 'p-4 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors m-1 disabled:opacity-40';
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('click-sound')?.play().catch(() => {});
    handler();
  });
  choicesDisplay.appendChild(b);
}

function disableButtons() {
  choicesDisplay.querySelectorAll('button').forEach((b) => (b.disabled = true));
}


function getBonus(weapon) {
    const p = state.player;
    const attrs = weapon.attribute.split(',');

    let bestBonus = -Infinity;
    let attrName = attrs[0];

    if (attrs.length > 1) {
        // Find the best attribute bonus among the choices
        attrs.forEach(attr => {
            if (p.attributeBonuses[attr] > bestBonus) {
                bestBonus = p.attributeBonuses[attr];
                attrName = attr;
            }
        });
    } else {
        bestBonus = p.attributeBonuses[attrName] || 0;
    }
    
    return { bonus: bestBonus, attrName };
}

function calcAttackBonus(weapon) {
    const player = state.player;
    let skillName;

    switch (weapon.type) {
        case 'ranged':
            skillName = 'Gunning';
            break;
        case 'melee':
            skillName = 'Melee';
            break;
        case 'unarmed':
            skillName = 'Unarmed';
            break;
        default:
            console.warn(`Unknown weapon.type "${weapon.type}", defaulting to Melee`);
            skillName = 'Melee';
    }

    const skillLevel = player.skills[skillName]?.level || 0;
    const { bonus: attrBonus, attrName } = getBonus(weapon);
    const atkBonus = skillLevel + attrBonus;

    return { atkBonus, attrName, skillName };
}


function calcDamageBonus(weapon) {
  const { bonus, attrName } = getBonus(weapon);
  return { dmgBonus: bonus, attrName };
}