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

/* ── Player Identity ── */
function getPlayerName() {
  try { return localStorage.getItem(GAMES_PREFIX + 'player_name') || 'Anonymous'; } catch(e) { return 'Anonymous'; }
}
function setPlayerName(name) {
  try { localStorage.setItem(GAMES_PREFIX + 'player_name', name.trim() || 'Anonymous'); } catch(e) {}
}
function getPlayerStats() {
  try { return JSON.parse(localStorage.getItem(GAMES_PREFIX + 'player_stats') || '{}'); } catch(e) { return {}; }
}
function updatePlayerStats(gameId, score) {
  const stats = getPlayerStats();
  if (!stats[gameId]) stats[gameId] = {plays:0,highScore:0,totalScore:0};
  stats[gameId].plays = (stats[gameId].plays || 0) + 1;
  stats[gameId].totalScore = (stats[gameId].totalScore || 0) + (score || 0);
  if (score > (stats[gameId].highScore || 0)) stats[gameId].highScore = score;
  try { localStorage.setItem(GAMES_PREFIX + 'player_stats', JSON.stringify(stats)); } catch(e) {}
}

/* ── High Score System ── */
function submitScore(gameId, score, playerName) {
  if (!gameId || score == null) return;
  const name = playerName || getPlayerName();
  const key = GAMES_PREFIX + 'scores_' + gameId;
  let scores = [];
  try { scores = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
  scores.push({
    name: name,
    score: Math.floor(score),
    date: Date.now(),
    id: Date.now().toString(36) + Math.random().toString(36).substr(2,4)
  });
  scores.sort((a,b) => b.score - a.score);
  scores = scores.slice(0, 50);
  localStorage.setItem(key, JSON.stringify(scores));
  updatePlayerStats(gameId, score);
  /* Check for new achievements after score */
  if (checkAchievements()) {
    const earned = getEarnedAchievements();
    /* Simple notification — in a full version, show a toast */
    console.log('🏅 Achievement unlocked!');
  }
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

/* ── Achievement System (Phase 5) ── */

const ACHIEVEMENTS = [
  {id:'first_play',title:'First Steps',desc:'Play your first game',icon:'🎮',check:s=>Object.keys(s).length>=1,reward:0},
  {id:'all_games',title:'Explorer',desc:'Play every game on the portal',icon:'🌍',check:s=>Object.keys(s).length>=7,reward:0},
  {id:'score_1k',title:'Bronze Tier',desc:'Score 1,000 total points',icon:'🥉',check:s=>Object.values(s).reduce((a,b)=>a+(b.totalScore||0),0)>=1000,reward:0},
  {id:'score_10k',title:'Silver Tier',desc:'Score 10,000 total points',icon:'🥈',check:s=>Object.values(s).reduce((a,b)=>a+(b.totalScore||0),0)>=10000,reward:0},
  {id:'score_100k',title:'Gold Tier',desc:'Score 100,000 total points',icon:'🥇',check:s=>Object.values(s).reduce((a,b)=>a+(b.totalScore||0),0)>=100000,reward:0},
  {id:'plays_10',title:'Dedicated',desc:'Play 10 games total',icon:'🔟',check:s=>Object.values(s).reduce((a,b)=>a+(b.plays||0),0)>=10,reward:0},
  {id:'plays_100',title:'Addicted',desc:'Play 100 games total',icon:'💯',check:s=>Object.values(s).reduce((a,b)=>a+(b.plays||0),0)>=100,reward:0},
  {id:'high_score_any',title:'Top Score',desc:'Get a high score in any game',icon:'🏆',check:s=>Object.values(s).some(b=>(b.highScore||0)>=100),reward:0},
];

function checkAchievements() {
  const stats = getPlayerStats();
  const earned = getEarnedAchievements();
  let changed = false;
  ACHIEVEMENTS.forEach(a => {
    if (!earned.includes(a.id) && a.check(stats)) {
      earned.push(a.id);
      changed = true;
    }
  });
  if (changed) {
    try { localStorage.setItem(GAMES_PREFIX + 'achievements', JSON.stringify(earned)); } catch(e) {}
  }
  return changed;
}

function getEarnedAchievements() {
  try { return JSON.parse(localStorage.getItem(GAMES_PREFIX + 'achievements') || '[]'); } catch(e) { return []; }
}

function getAchievementCount() {
  return getEarnedAchievements().length;
}

function renderAchievements(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const earned = getEarnedAchievements();
  const total = ACHIEVEMENTS.length;
  el.innerHTML = `
    <div style="font-size:11px;color:var(--text3);margin-bottom:8px;font-weight:600">🏅 ACHIEVEMENTS ${earned.length}/${total}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px">
    ${ACHIEVEMENTS.map(a => {
      const done = earned.includes(a.id);
      return `<div style="text-align:center;padding:8px 4px;border-radius:8px;background:${done?'rgba(52,211,153,0.08)':'rgba(255,255,255,0.02)'};border:1px solid ${done?'rgba(52,211,153,0.2)':'rgba(255,255,255,0.05)'};opacity:${done?1:0.4}">
        <div style="font-size:20px">${done?a.icon:'🔒'}</div>
        <div style="font-size:9px;color:${done?'var(--green)':'var(--text3)'};margin-top:2px;font-weight:600">${a.title}</div>
      </div>`;
    }).join('')}</div>`;
}
