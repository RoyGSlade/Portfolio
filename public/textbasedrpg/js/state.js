// The single source of truth for the entire game state.
export const state = {
    bgmStarted: false,
    mode: 'creation', // or 'exploration', 'combat'
    player: null, 
    currentScene: 'start',
    gameData: {}, 
    skills: {}, // Will hold the processed skills list for easy lookup
    combat: null, // Holds current combat state: { target: object, lastHitSuccess: boolean }
    flags: {}, // NEW: To store story flags
};