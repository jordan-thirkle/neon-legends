/* ── NEON LEGENDS REAL AUDIO ENGINE ── */
/* Replaces Web Audio API oscillator sounds with CC0 Kenney assets */
/* Call preloadAssets() once, then playReal(type) instead of playSfx(type) */

const ASSET_BASE = 'assets/';
const AUDIO_FILES = {
  attack:  ['rpg-audio/Audio/metalClick.ogg',           'rpg-audio/Audio/chop.ogg'],
  ult:     ['rpg-audio/Audio/metalPot1.ogg',             'rpg-audio/Audio/metalPot3.ogg'],
  victory: ['interface-sounds/Audio/confirmation_001.ogg','interface-sounds/Audio/maximize_001.ogg'],
  coin:    ['rpg-audio/Audio/handleCoins.ogg'],
  error:   ['interface-sounds/Audio/error_001.ogg'],
  select:  ['interface-sounds/Audio/select_001.ogg'],
  click:   ['ui/Sounds/click-a.ogg'],
  tap:     ['ui/Sounds/tap-a.ogg'],
  toggle:  ['ui/Sounds/switch-a.ogg'],
  open:    ['interface-sounds/Audio/open_001.ogg'],
  rare:    ['interface-sounds/Audio/maximize_001.ogg',   'interface-sounds/Audio/confirmation_003.ogg'],
  footstep:['rpg-audio/Audio/footstep00.ogg'],
};

let audioCache = {};

function preloadAssets(callback) {
  let total = 0, loaded = 0;
  for (const key in AUDIO_FILES) total += AUDIO_FILES[key].length;
  if (total === 0) { if (callback) callback(); return; }

  for (const key in AUDIO_FILES) {
    AUDIO_FILES[key].forEach((path, idx) => {
      const fullPath = ASSET_BASE + path;
      const audio = new Audio();
      audio.preload = 'auto';
      audio.oncanplaythrough = () => {
        if (!audioCache[key]) audioCache[key] = [];
        audioCache[key][idx] = audio;
        loaded++;
        if (loaded >= total && callback) callback();
      };
      audio.onerror = () => { loaded++; if (loaded >= total && callback) callback(); };
      audio.src = fullPath;
      audio.load();
    });
  }
}

function playReal(type, volume) {
  const pool = audioCache[type];
  if (!pool || pool.length === 0) {
    /* Fallback: try to create on-demand */
    const files = AUDIO_FILES[type];
    if (!files) return;
    const path = files[Math.floor(Math.random() * files.length)];
    try {
      const a = new Audio(ASSET_BASE + path);
      if (volume != null) a.volume = Math.min(1, Math.max(0, volume));
      a.play().catch(() => {});
    } catch(e) {}
    return;
  }
  const audio = pool[Math.floor(Math.random() * pool.length)];
  if (!audio) return;
  try {
    const clone = audio.cloneNode();
    if (volume != null) clone.volume = Math.min(1, Math.max(0, volume));
    clone.play().catch(() => {});
  } catch(e) {}
}

function playSfxReal(type) {
  if (!save || !save.settings || !save.settings.sound) return;
  playReal(type, 0.5);
}

/* Example usage:
   preloadAssets(() => { console.log('Audio ready'); });
   Then replace playSfx('attack') with playSfxReal('attack')
*/
