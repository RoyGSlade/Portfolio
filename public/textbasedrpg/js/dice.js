// js/dice.js
import { state } from './state.js';
import { log } from './logger.js';

const choicesDisplay = document.getElementById('choices-display');

export function rollExpr(expr) {
  // basic parser (2d6+3 etc). keep your earlier roll() if you like
  const m = /^(?:(\d*)d)?(\d+)([+-]\d+)?$/i.exec(expr.trim());
  if (!m) throw new Error(`Bad dice: ${expr}`);
  const [, c, f, modStr] = m;
  const count = c ? +c : 1;
  const faces = +f;
  const mod = modStr ? +modStr : 0;
  const rolls = Array.from({ length: count }, () => 1 + Math.random() * faces | 0);
  return { total: rolls.reduce((a,b)=>a+b,0) + mod, rolls, mod, faces, count, expr };
}

/**
 * Show a single “press to roll” UI and resolve with the rolled total.
 * label = text on button ("Roll d20", "Roll Damage", etc.)
 * base = baseRoll string like "1d20", "2d6+3"
 * bonus = number to add afterward (skill+attr)
 */
export function interactiveRoll({ label, base, bonus = 0, contextLabel = '' }) {
  return new Promise(resolve => {
    choicesDisplay.innerHTML = `
      <div class="w-full flex flex-col items-center gap-4">
        <div id="dice-result" class="font-title text-6xl text-gray-500">?</div>
        <button id="roll-btn" class="w-1/2 p-4 bg-yellow-600 hover:bg-yellow-500 rounded-md transition-colors text-gray-900 font-bold">${label}</button>
        <div id="roll-calculation" class="text-gray-400 text-center"></div>
      </div>
    `;
    const rollBtn = document.getElementById('roll-btn');
    const diceResult = document.getElementById('dice-result');
    const rollCalc = document.getElementById('roll-calculation');

    rollBtn.onclick = () => {
      document.getElementById('click-sound')?.play().catch(()=>{});
      rollBtn.disabled = true;
      rollBtn.classList.add('opacity-50','cursor-not-allowed');

      const core = rollExpr(base);
      diceResult.textContent = core.total - core.mod; // show raw d20 etc.
      diceResult.classList.replace('text-gray-500','text-white');
      diceResult.classList.add('fade-in');

      const total = core.total + bonus;
      setTimeout(() => {
        rollCalc.innerHTML = `
          <p class="fade-in">Roll: ${core.rolls.join(', ')}</p>
          ${core.mod ? `<p class="fade-in">Dice Mod: ${core.mod >=0 ? '+' : ''}${core.mod}</p>` : ''}
          ${bonus ? `<p class="fade-in">Bonus: +${bonus} <span class="text-xs">${contextLabel}</span></p>` : ''}
          <p class="fade-in font-bold text-xl text-yellow-400">Total: ${total}</p>
        `;
        setTimeout(() => resolve({ total, core }), 1200);
      }, 400);
    };
  });
}
