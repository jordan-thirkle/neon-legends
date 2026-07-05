/* ── Shared Game Portal Core ─────────────────────── */
/* Every game on games.byjtt.com uses this for scores, tracking, sharing */

const GAMES_PREFIX = 'byjtt_games_';
const GAME_IDS = {
  'glitchfront': 'Glitchfront 194x',
  'aethoria': 'Aethoria Online',
  'helix-hex': 'Helix Hex',
  'aura-depths': 'Aura Depths',
  'crown-chaser': 'Crown Chaser',
  'vibegame': 'VibeGame',
  'neon-legends': 'Neon Legends'
};

/* ── High Score System ── */
function submitScore(gameId, score, playerName) {
  if (!gameId || score == null) return;
  const key = GAMES_PREFIX + 'scores_' + gameId;
  let scores = [];
  try { scores = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
  scores.push({
    name: playerName || 'Anonymous',
    score: Math.floor(score),
    date: Date.now(),
    id: Date.now().toString(36) + Math.random().toString(36).substr(2,4)
  });
  scores.sort((a,b) => b.score - a.score);
  scores = scores.slice(0, 50); // keep top 50
  localStorage.setItem(key, JSON.stringify(scores));
}

function getLeaderboard(gameId, limit) {
  const key = GAMES_PREFIX + 'scores_' + gameId;
  try {
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    return scores.sort((a,b) => b.score - a.score).slice(0, limit || 10);
  } catch(e) { return []; }
}

function renderLeaderboard(gameId, containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const scores = getLeaderboard(gameId, limit);
  if (!scores.length) {
    el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text3);font-size:12px">No scores yet. Be the first!</div>';
    return;
  }
  el.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:6px;font-weight:600">🏆 HIGH SCORES</div>' +
    scores.map((s, i) => `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.04)">
      <span style="width:20px;font-weight:700;color:${i===0?'var(--gold)':i===1?'var(--text2)':i===2?'var(--text3)':'var(--text3)'}">#${i+1}</span>
      <span style="flex:1;color:var(--text)">${s.name}</span>
      <span style="font-weight:700;color:var(--violet)">${s.score.toLocaleString()}</span>
    </div>`).join('');
}

/* ── Play Counter ── */
function incrementPlays(gameId) {
  const key = GAMES_PREFIX + 'plays_' + gameId;
  let count = 0;
  try { count = parseInt(localStorage.getItem(key) || '0'); } catch(e) {}
  localStorage.setItem(key, String(count + 1));
  return count + 1;
}

function getPlays(gameId) {
  try { return parseInt(localStorage.getItem(GAMES_PREFIX + 'plays_' + gameId) || '0'); } catch(e) { return 0; }
}

/* ── Twitter Share ── */
function shareOnX(gameId, score) {
  const name = GAME_IDS[gameId] || gameId;
  const url = 'https://games.byjtt.com/games/' + gameId;
  const text = score
    ? `I scored ${score.toLocaleString()} in ${name}! 🎮 Play it here:`
    : `Check out ${name} — built by AI agents! 🎮 Play it here:`;
  window.open('https://x.com/intent/post?text=' + encodeURIComponent(text + ' ') + encodeURIComponent(url), '_blank', 'width=600,height=400');
}

/* ── Embed stats in portal ── */
function renderGameStats(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-bottom:24px">';
  Object.entries(GAME_IDS).forEach(([id, name]) => {
    const plays = getPlays(id);
    html += `<div style="text-align:center;padding:10px 6px;border-radius:8px;background:rgba(255,255,255,0.02);border:1px solid rgba(124,58,237,0.08)">
      <div style="font-size:20px;margin-bottom:2px">${id === 'neon-legends' ? '⚡' : id === 'glitchfront' ? '🔫' : id === 'aethoria' ? '🌍' : id === 'helix-hex' ? '🌀' : id === 'aura-depths' ? '⛏️' : id === 'crown-chaser' ? '👑' : '🎲'}</div>
      <div style="font-size:10px;color:var(--text3);font-weight:600">${name}</div>
      <div style="font-size:11px;color:var(--violet);font-weight:700">${plays.toLocaleString()} plays</div>
    </div>`;
  });
  html += '</div>';
  el.innerHTML = html;
}
