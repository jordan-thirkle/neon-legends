(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const STORAGE_KEY = 'neon_legends_save_v2';

  /* ── DATA ───────────────────────────────────── */
  const RARITY_COLORS = {common:'#9ca3af',rare:'#60a5fa',epic:'#a78bfa',legendary:'#fbbf24',mythic:'#f472b6'};
  const RARITY_WEIGHTS = {common:50,rare:30,epic:14,legendary:5,mythic:1};
  const RARITY_MUL = {common:1,rare:1.4,epic:1.9,legendary:2.7,mythic:3.5};

  const HERO_TEMPLATES = [
    {key:'ember',name:'Ember',icon:'🔥',cls:'Warrior',hpG:.8,atkG:1.2,skill:'Flame Slash'},
    {key:'frost',name:'Frost',icon:'❄️',cls:'Mage',hpG:.5,atkG:1.5,skill:'Ice Barrage'},
    {key:'storm',name:'Storm',icon:'⚡',cls:'Ranger',hpG:.6,atkG:1.3,skill:'Chain Lightning'},
    {key:'terra',name:'Terra',icon:'🌿',cls:'Guardian',hpG:1.4,atkG:.9,skill:'Quake'},
    {key:'nova',name:'Nova',icon:'🌌',cls:'Sorcerer',hpG:.55,atkG:1.6,skill:'Supernova'},
    {key:'shadow',name:'Shadow',icon:'👤',cls:'Assassin',hpG:.5,atkG:1.7,skill:'Vanish Strike'},
    {key:'luna',name:'Luna',icon:'🌙',cls:'Priest',hpG:.7,atkG:1.1,skill:'Moonlight'},
    {key:'volt',name:'Volt',icon:'💥',cls:'Brawler',hpG:1.1,atkG:1.3,skill:'Thunder Fist'},
    {key:'cinder',name:'Cinder',icon:'🌋',cls:'Warlock',hpG:.6,atkG:1.4,skill:'Inferno'},
    {key:'glacier',name:'Glacier',icon:'🧊',cls:'Paladin',hpG:1.2,atkG:1.0,skill:'Frozen Oath'},
    {key:'neon',name:'Neon',icon:'👾',cls:'Hacker',hpG:.7,atkG:1.5,skill:'Glitch'},
    {key:'aurora',name:'Aurora',icon:'🌈',cls:'Druid',hpG:.9,atkG:1.2,skill:'Aurora Beam'},
  ];

  const BOSSES = [
    {name:'Slime King',icon:'👾',hp:60,atk:1,gold:15},
    {name:'Dark Knight',icon:'🖤',hp:180,atk:2,gold:30},
    {name:'Venom Queen',icon:'🐍',hp:500,atk:4,gold:90},
    {name:'Iron Titan',icon:'🤖',hp:1200,atk:7,gold:220},
    {name:'Void Wraith',icon:'👻',hp:3000,atk:12,gold:480},
    {name:'Inferno Dragon',icon:'🐉',hp:7500,atk:20,gold:1050},
    {name:'Neon Overlord',icon:'👿',hp:18000,atk:35,gold:2250},
  ];

  const SKINS = [
    {id:'ember_fire',hero:'ember',name:'Fire Emperor',color:'#ef4444',price:500},
    {id:'frost_ice',hero:'frost',name:'Ice Queen',color:'#22d3ee',price:500},
    {id:'storm_wind',hero:'storm',name:'Storm God',color:'#fbbf24',price:800},
    {id:'shadow_dark',hero:'shadow',name:'Night Reaper',color:'#a855f7',price:1200},
    {id:'neon_punk',hero:'neon',name:'Synthwave Hero',color:'#ec4899',price:1500},
  ];

  const ACHIEVEMENTS = [
    {id:'first_kill',title:'First Blood',desc:'Defeat your first boss',check:s=>s.attackCount>=1,reward:10},
    {id:'click_100',title:'Clicker',desc:'100 attacks',check:s=>s.attackCount>=100,reward:10},
    {id:'click_1000',title:'Smasher',desc:'1000 attacks',check:s=>s.attackCount>=1000,reward:20},
    {id:'pull_10',title:'Recruiter',desc:'Perform 10 summons',check:s=>s.pulls>=10,reward:15},
    {id:'reach_ch5',title:'Voyager',desc:'Reach chapter 5',check:s=>s.stage>=5,reward:25},
    {id:'big_wallet',title:'Big Wallet',desc:'Hold 5000 gold',check:s=>s.gold>=5000,reward:10},
    {id:'legendary',title:'Legendary',desc:'Pull a legendary hero',check:s=>s.heroes.some(h=>h.rarity==='legendary'||h.rarity==='mythic'),reward:30},
    {id:'first_ult',title:'Ultimate',desc:'Unleash an ultimate attack',check:s=>s.ultsUsed>=1,reward:15},
  ];

  const SHOP_ITEMS = [
    {id:'gem_sm',name:'Small Gem Pack',desc:'100 gems',icon:'💎',price:'$0.99',currency:'usd',give:{gems:100},type:'gem'},
    {id:'gem_md',name:'Medium Gem Pack',desc:'500 gems',icon:'💎',price:'$4.99',currency:'usd',give:{gems:500},type:'gem'},
    {id:'starter',name:'Starter Pack',desc:'Gold + Hero shard',icon:'🎁',price:'$0.99',currency:'usd',give:{gold:2000,gems:50},type:'pack'},
    {id:'shard_frost',name:'Hero Shard: Frost',desc:'Unlock Frost',icon:'❄️',price:'$1.99',currency:'usd',give:{shard:'frost'},type:'shard'},
    {id:'no_ads',name:'Remove Ads',desc:'No more ad placeholders',icon:'🚫',price:'$2.99',currency:'usd',type:'no_ads'},
    {id:'promo_gold',name:'Quick Gold',desc:'1000 gold promo',icon:'⚡',price:'$0.49',currency:'promo',give:{gold:1000},type:'promo'},
    {id:'promo_gems',name:'Gem Sprinkle',desc:'20 gems promo',icon:'💎',price:'Watch Ad',currency:'promo',give:{gems:20},type:'promo'},
  ];

  const EVENTS = [
    {id:'click_boom',name:'Click Surge',desc:'+200% attack power 24h',ttl:24*60*60*1000,active:true},
    {id:'gold_rush',name:'Gold Rush',desc:'+150% gold from bosses 48h',ttl:48*60*60*1000,active:true},
    {id:'double_gems',name:'Gem Mirage',desc:'+100% gem gains 6h',ttl:6*60*60*1000,active:true},
    {id:'hero_fest',name:'Hero Fest',desc:'+70% rare+ rate 72h',ttl:72*60*60*1000,active:true},
  ];
  const LIMITED_BANNER = {id:'lunar_spark',name:'Lunar Spark',desc:'Mythic chance x3 24h',endsAt:Date.now()+24*60*60*1000,active:true};

  /* ── SAVE ───────────────────────────────────── */
  let save = load();
  const limitedBanner = LIMITED_BANNER;

  function load() {
    try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : fresh(); }
    catch (e) { return fresh(); }
  }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); }

  function fresh() {
    return {
      gold:0,gems:150,energy:100,maxEnergy:100,energyTs:Date.now(),
      trophies:0,stage:0,bossHp:null,bossMaxHp:null,attackCount:0,ultsUsed:0,
      heroes:[],squad:[],owned:false,pity:0,pulls:0,
      passLvl:1,passXp:0,lastDaily:null,streak:0,
      achievements:{},settings:{sound:true,music:true},
      firstRun:true,offlineEarningsShown:false,skins:{},skinEquipped:{},
    };
  }

  /* ── BOSS / COMBAT ──────────────────────────── */
  function currentBoss() {
    const i = save.stage % BOSSES.length;
    const c = Math.floor(save.stage / 7) + 1;
    const b = {...BOSSES[i]};
    const s = Math.pow(1.22, save.stage);
    b.hp = Math.floor(b.hp * s);
    b.atk = Math.floor(b.atk * s);
    b.gold = Math.floor(b.gold * s);
    b.maxHp = b.hp;
    b.chapter = c;
    return b;
  }

  function squadPower() {
    const sq = save.squad.slice(0,4);
    if (!sq.length) return 1;
    let p = 0;
    sq.forEach(k => {
      const h = save.heroes.find(x => x.key === k);
      if (!h) return;
      const t = HERO_TEMPLATES.find(x => x.key === k.split('_')[0]);
      if (!t) return;
      const l = h.level || 1;
      const m = RARITY_MUL[h.rarity] || 1;
      p += t.atkG * 5 * l * m;
    });
    const bonus = (currentBoss()?.chapter || 1) >= 4 ? 1.25 : 1;
    return Math.max(1, p * bonus);
  }

  function remainingEnergy() {
    const now = Date.now();
    const d = now - save.energyTs;
    if (d > 999) { save.energy = Math.min(save.maxEnergy, save.energy + Math.floor(d/1000)); save.energyTs = now; persist(); }
    return save.energy;
  }

  function energyRefillAt() { return Math.max(0, (save.maxEnergy - save.energy) * 1000 - (Date.now() - save.energyTs)); }
  function energyPct() { return Math.floor((save.energy / save.maxEnergy) * 100); }

  /* ── HERO ROLL / GACHA ──────────────────────── */
  function rollHero() {
    save.pity++;
    const sum = Object.values(RARITY_WEIGHTS).reduce((a,b)=>a+b,0);
    let r = Math.random() * sum, acc = 0, rarity = 'common';
    for (const [k,w] of Object.entries(RARITY_WEIGHTS)) { acc += w; if (r <= acc) { rarity = k; break; } }
    if (EVENTS.find(e=>e.id==='hero_fest')?.active) {
      const rr = Math.random();
      if (rr < 0.6) rarity = 'rare';
      if (rr < 0.9) rarity = 'epic';
    }
    if (limitedBanner.active && Date.now() < limitedBanner.endsAt && (rarity==='legendary'||rarity==='mythic')) {
      if (Math.random() < 0.75) rarity = 'mythic';
    }
    const t = HERO_TEMPLATES[Math.floor(Math.random() * HERO_TEMPLATES.length)];
    return {key:t.key+'_'+Date.now()+'_'+Math.floor(Math.random()*9999),base:t.key,name:t.name,icon:t.icon,cls:t.cls,rarity,level:1,xp:0,owned:true};
  }

  function giveHero(baseKey, forcedRarity) {
    const t = HERO_TEMPLATES.find(x => x.key === baseKey);
    if (!t) return;
    const h = {key:t.key+'_'+Date.now(),base:t.key,name:t.name,icon:t.icon,cls:t.cls,rarity:forcedRarity||'common',level:1,xp:0,owned:true};
    save.heroes.push(h);
    return h;
  }

  /* ── SQUAD ──────────────────────────────────── */
  function assignToSquad(key) {
    if (save.squad.length >= 4) return notify('Squad full!');
    save.squad.push(key); persist(); renderHeroes();
    notify(`${HERO_TEMPLATES.find(t=>t.key===key.split('_')[0])?.name||'Hero'} added`);
  }
  function unequipSquad(key) { save.squad = save.squad.filter(k => k !== key); persist(); renderHeroes(); }

  /* ── SUMMON ─────────────────────────────────── */
  function doPull(premium) {
    const cost = premium ? 10 : 100;
    const cur = premium ? 'gems' : 'gold';
    if (save[cur] < cost) return notify('Not enough ' + cur);
    save[cur] -= cost;
    save.pulls++;
    const count = premium ? 1 : 5;
    const results = [];
    for (let i = 0; i < count; i++) { const h = rollHero(); save.heroes.push(h); results.push(h); }
    if (premium) {
      save.pity++;
      if (save.pity >= 10) { for (let i = 0; i < 5; i++) { const h = rollHero(); save.heroes.push(h); results.push(h); } save.pity = 0; }
    } else { save.pity = 0; }
    const best = results.reduce((a,b) => ['mythic','legendary','epic','rare','common'].indexOf(a.rarity) < ['mythic','legendary','epic','rare','common'].indexOf(b.rarity) ? a : b, results[0]);
    notify(best.rarity==='legendary'||best.rarity==='mythic' ? '⭐ ' + best.name + ' (' + best.rarity + ')!' : 'Best: ' + best.rarity);
    persist(); renderHeroes(); renderSummonResults(results); renderHud(); updatePity();
  }

  function updatePity() {
    const el = $('#pityCount'); if (el) el.textContent = save.pity;
    const el2 = $('#pityProgress'); if (el2) el2.textContent = Math.min(100, Math.floor((save.pity / 10) * 100));
  }

  /* ── SHOP ───────────────────────────────────── */
  function buyItem(item) {
    if (item.type === 'gem') { save.gems += item.give.gems; persist(); renderShop(); renderHud(); notify('Gems added!'); return; }
    if (item.type === 'pack') { save.gold = (save.gold||0) + (item.give.gold||0); save.gems = (save.gems||0) + (item.give.gems||0); persist(); renderShop(); renderHud(); notify('Pack claimed!'); return; }
    if (item.type === 'shard') {
      const base = item.give.shard;
      if (save.heroes.some(h=>h.base===base)) return notify('Already owned');
      giveHero(base, 'rare'); persist(); renderHeroes(); renderHud(); notify('Hero unlocked!');
      return;
    }
    if (item.type === 'no_ads') { save.settings.noAds = true; persist(); notify('No ads enabled!'); renderShop(); return; }
    if (item.type === 'promo') {
      if (item.give.gems) save.gems += item.give.gems;
      if (item.give.gold) save.gold += item.give.gold;
      persist(); renderShop(); renderHud(); notify('Promo redeemed!'); return;
    }
  }

  /* ── DAILY ──────────────────────────────────── */
  function claimDaily() {
    const now = new Date();
    const today = now.toDateString();
    if (save.lastDaily === today) return notify('Already claimed today');
    save.lastDaily = today;
    save.streak = (save.streak || 0) + 1;
    const rewards = [
      {gold:100,gems:10},{gold:200,gems:5},{gold:300,gems:0,shard:'random'},
      {gold:400,gems:25},{gold:0,gems:50},{gold:600,gems:20},{gold:0,gems:100}
    ];
    const r = rewards[(save.streak - 1) % rewards.length] || rewards[0];
    if (r.gold) save.gold += r.gold;
    if (r.gems) save.gems += r.gems;
    if (r.shard === 'random') {
      const k = HERO_TEMPLATES[Math.floor(Math.random()*HERO_TEMPLATES.length)].key;
      if (!save.heroes.some(h=>h.base===k)) giveHero(k);
    }
    persist(); notify('Daily reward claimed!'); renderDaily();
  }

  function renderDaily() {
    const c = $('#calendar');
    if (!c) return;
    let html = '<div style="display:flex;gap:6px;flex-wrap:wrap">';
    for (let i = 1; i <= 7; i++) {
      const claimed = (save.lastDaily ? new Date(save.lastDaily).getDate() : -1) === i;
      html += '<div class="card" style="flex:1;min-width:52px;text-align:center;padding:10px 4px">'
        + '<div style="font-size:10px;color:rgba(255,255,255,0.5)">Day ' + i + '</div>'
        + '<div style="font-size:22px;margin-top:4px">' + (claimed ? '✅' : '🎁') + '</div></div>';
    }
    html += '</div>';
    c.innerHTML = html;
  }

  /* ── ACHIEVEMENTS ───────────────────────────── */
  function checkAchievements() {
    let changed = false;
    ACHIEVEMENTS.forEach(a => {
      if (!save.achievements[a.id] && a.check(save)) {
        save.achievements[a.id] = true;
        save.trophies += a.reward || 5;
        notify('🏅 ' + a.title + ' +' + (a.reward||5) + '🏆');
        changed = true;
      }
    });
    if (changed) { persist(); renderHud(); renderAchievements(); }
  }

  /* ── ATTACK ─────────────────────────────────── */
    function attack() {
      const now = Date.now();
      if (remainingEnergy() < 1) return notify('No energy ⏳');
      const rage = save.bossHp && save.bossMaxHp && save.bossHp < save.bossMaxHp * 0.25;
      const cost = rage ? 2 : 1;
      if (save.energy < cost) return notify('Boss rage drains double energy!');
      save.energy -= cost;
      save.energyTs = now;
      save.attackCount++;
      save.passXp += 2;
      incCombo();
      let boss = currentBoss();
      if (!save.bossHp) { save.bossMaxHp = boss.hp; save.bossHp = boss.hp; }
      const isCrit = Math.random() < 0.15;
      let dmg = Math.floor(squadPower() * comboBonus() * (1 + Math.random() * 0.3));
      if (isCrit) { dmg = Math.floor(dmg * 2); notify('💥 CRIT! x2'); vibrate(30); playSfx('ult'); }
      save.bossHp -= dmg;
      spawnDmg(dmg, isCrit);
      bossHitAnim();
      playSfx('attack');
      if (rage) vibrate(15);
      if (save.bossHp <= 0) { defeatBoss(); }
      persist(); renderHud(); renderCampaign(); checkAchievements(); renderCombo();
      animateNum('gold', save.gold, 300);
      if (save.attackCount === 1) setTimeout(quickGacha, 700);
    }

    function ultAttack() {
      if (save.attackCount < 100) return notify('Charge more (' + save.attackCount + '/100)');
      save.attackCount -= 100;
      save.ultsUsed = (save.ultsUsed || 0) + 1;
      let boss = currentBoss();
      if (!save.bossHp) { save.bossMaxHp = boss.hp; save.bossHp = boss.hp; }
      const dmg = Math.floor(squadPower() * 5 * comboBonus() * (1 + Math.random() * 0.5));
      save.bossHp -= dmg;
      spawnDmg(dmg, true);
      bossHitAnim();
      vibrate(50);
      playSfx('ult');
      playSfx('victory');
      if (save.bossHp <= 0) { defeatBoss(); }
      persist(); renderHud(); renderCampaign(); checkAchievements();
      notify('💥 ULTIMATE! -' + dmg + ' damage!');
      animateNum('gold', save.gold, 300);
    }

    function defeatBoss() {
      const boss = currentBoss();
      save.gold += boss.gold;
      save.passXp += 10;
      save.stage++;
      /* Gear drop on defeat */
      const gearTypes = ['weapon','armor','relic'];
      const gearNames = {weapon:['Neon Blade','Void Sword','Crystal Fang','Plasma Cutter','Shadow Dagger'],
        armor:['Phantom Plate','Void Mantle','Crystal Shell','Neon Mail','Obsidian Guard'],
        relic:['Soul Gem','Eclipse Orb','Rune Stone','Chrono Core','Star Amulet']};
      const gt = gearTypes[Math.floor(Math.random()*gearTypes.length)];
      const gn = gearNames[gt][Math.floor(Math.random()*gearNames[gt].length)];
      const gr = Math.random()<0.1?'rare':Math.random()<0.25?'uncommon':'common';
      const gStats = {common:{atk:2,hp:10},uncommon:{atk:5,hp:25},rare:{atk:12,hp:60}};
      const g = {id:'gear_'+Date.now(),name:gn,type:gt,rarity:gr,atk:gStats[gr].atk,hp:gStats[gr].hp};
      if (!save.gearInventory) save.gearInventory = [];
      save.gearInventory.push(g);

      notify('🏆 ' + boss.name + ' defeated! +' + boss.gold + ' gold  🎒 ' + gn + ' [' + gr + ']');
      playSfx('victory');
      vibrate(40);
      animateNum('gold', save.gold, 400);
      save.bossHp = null; save.bossMaxHp = null;
      persist(); checkAchievements();
    }

  function spawnDmg(dmg, isCrit) {
    const area = $('#bossArea');
    if (!area) return;
    const el = document.createElement('div');
    el.className = 'dmg' + (isCrit ? ' dmg-crit' : '');
    el.textContent = (isCrit ? '💥 ' : '-') + dmg;
    if (isCrit) el.style.fontSize = '36px';
    area.appendChild(el);
    if (isCrit) {
      const flash = document.createElement('div');
      flash.className = 'crit-flash';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 200);
    }
    setTimeout(() => el.remove(), 900);
  }

  function renderCombo() {
    const el = $('#comboDisplay');
    if (!el) return;
    const c = getCombo();
    if (c >= 3) {
      el.textContent = '🔥 ' + c + 'x combo';
      el.style.opacity = '1';
      el.classList.add('combo-active');
      setTimeout(() => el.classList.remove('combo-active'), 300);
    } else {
      el.style.opacity = '0';
    }
  }

  function renderGearInventory() {
    const list = $('#gearInventoryList');
    if (!list) return;
    const gi = save.gearInventory || [];
    list.innerHTML = gi.length ? '' : '<div style="font-size:11px;color:rgba(255,255,255,0.3);padding:8px;text-align:center">No gear yet. Defeat bosses to earn equipment!</div>';
    gi.forEach(g => {
      const el = document.createElement('div');
      el.className = 'gear-card';
      const typeIcons = {weapon:'⚔️',armor:'🛡️',relic:'🔮'};
      const r = g.rarity || 'common';
      el.innerHTML = '<span>' + (typeIcons[g.type]||'📦') + '</span><span style="flex:1">' + g.name + '</span><span class="gear-rarity ' + r + '">' + r + '</span><span style="font-size:10px;color:rgba(255,255,255,0.4)">+' + g.atk + 'atk +' + g.hp + 'hp</span>';
      list.appendChild(el);
    });
  }

  function bossHitAnim() {
    const area = $('#bossArea');
    if (!area) return;
    area.classList.add('hit');
    setTimeout(() => area.classList.remove('hit'), 400);
  }

  function calcOffline() {
    const now = Date.now();
    const sec = Math.min(43200, Math.floor((now - (save.offlineTs || now)) / 1000));
    if (sec > 0) {
      const gold = Math.floor(sec * squadPower() * 0.5);
      save.gold += gold; save.offlineTs = now; persist();
      return {seconds:sec, gold:gold};
    }
    return {seconds:0, gold:0};
  }

  /* ── SOUND ──────────────────────────────────── */
  let audioCtx = null;
  let musicNodes = null;

  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function playSfx(type) {
    if (!save.settings.sound) return;
    try {
      initAudio();
      const ctx = audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      switch (type) {
        case 'attack':
          o.type = 'sawtooth'; o.frequency.setValueAtTime(200, now); o.frequency.linearRampToValueAtTime(80, now + 0.1);
          g.gain.setValueAtTime(0.08, now); break;
        case 'ult':
          o.type = 'square'; o.frequency.setValueAtTime(120, now); o.frequency.linearRampToValueAtTime(400, now + 0.2);
          g.gain.setValueAtTime(0.12, now); break;
        case 'victory':
          o.type = 'triangle'; o.frequency.setValueAtTime(523, now); o.frequency.setValueAtTime(659, now + 0.15);
          g.gain.setValueAtTime(0.1, now); break;
        case 'rare':
          o.type = 'sine'; o.frequency.setValueAtTime(880, now); o.frequency.setValueAtTime(1100, now + 0.12);
          g.gain.setValueAtTime(0.15, now); break;
        case 'pull':
          o.type = 'triangle'; o.frequency.setValueAtTime(300, now); o.frequency.linearRampToValueAtTime(600, now + 0.3);
          g.gain.setValueAtTime(0.1, now); break;
        case 'coin':
          o.type = 'sine'; o.frequency.setValueAtTime(1200, now); o.frequency.setValueAtTime(1500, now + 0.05);
          g.gain.setValueAtTime(0.08, now); break;
        default: o.type = 'triangle'; o.frequency.setValueAtTime(440, now);
      }
      o.start(now);
      o.stop(now + 0.3);
    } catch (e) { /* audio not available */ }
  }

  /* ── UI ─────────────────────────────────────── */
  function switchTab(id) {
    $$('.tab-panel').forEach(p => p.style.display = 'none');
    const panel = $('#' + id);
    if (panel) panel.style.display = '';
    $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    $$('#mainTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    if (id === 'heroes') renderHeroes();
    if (id === 'shop') { renderShop(); renderDaily(); }
    if (id === 'events') renderEvents();
    if (id === 'achievements') renderAchievements();
  }

  function renderHud() {
    $('#gold').textContent = formatBig(save.gold);
    $('#gems').textContent = save.gems;
    $('#trophies').textContent = save.trophies;
    $('#energyFill').style.width = energyPct() + '%';
    $('#ultCharge').textContent = Math.min(100, save.attackCount % 100);
  }

  function formatBig(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return Math.floor(n);
  }

  function renderCampaign() {
    const boss = currentBoss();
    const hp = save.bossHp != null ? Math.max(0, save.bossHp) : boss.hp;
    const pct = save.bossMaxHp ? ((hp / save.bossMaxHp) * 100) : 100;
    $('#bossHp').style.width = pct + '%';
    $('#bossName').textContent = boss.icon + ' ' + boss.name;
    $('#bossPortrait').textContent = boss.icon;
    $('#chapterNum').textContent = Math.floor(save.stage / 7) + 1;
    $('#stageNum').textContent = (save.stage % 7) + 1;
  }

  function renderHeroes() {
    const grid = $('#heroGrid'); if (!grid) return;
    grid.innerHTML = '';
    save.heroes.forEach(h => {
      const t = HERO_TEMPLATES.find(x => x.key === h.base);
      const r = h.rarity || 'common';
      const el = document.createElement('div');
      el.className = 'hero-card rarity-' + r;
      if (h.owned) el.classList.add('owned');
      el.innerHTML = '<div class="badge">' + (r[0].toUpperCase()) + '</div><div>' + (t ? t.icon : '?') + '</div><div class="stars">Lv' + (h.level||1) + '</div>';
      el.onclick = () => {
        if (!save.squad.includes(h.key)) assignToSquad(h.key);
        else unequipSquad(h.key);
      };
      el.oncontextmenu = ev => {
        ev.preventDefault();
        if (!h.owned) return;
        const v = {mythic:200,legendary:100,epic:50,rare:20}[r] || 10;
        save.gold += v;
        save.heroes = save.heroes.filter(x => x.key !== h.key);
        if (save.squad.includes(h.key)) save.squad = save.squad.filter(k => k !== h.key);
        persist(); renderHeroes(); renderHud();
        notify('💨 Disenchanted +' + v + '⚡');
        playSfx('coin');
      };
      grid.appendChild(el);
      });
      renderSquad();
      renderGearInventory();
      }

  function renderSquad() {
    const sl = $('#squadSlots'); if (!sl) return;
    sl.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const key = save.squad[i];
      const h = save.heroes.find(x => x.key === key);
      const el = document.createElement('div');
      el.style.cssText = 'width:56px;height:56px;border-radius:10px;background:rgba(124,58,237,0.1);display:flex;align-items:center;justify-content:center;font-size:24px;border:1px solid rgba(124,58,237,0.3)';
      if (h) {
        const t = HERO_TEMPLATES.find(x => x.key === h.base);
        el.textContent = t ? t.icon : '?';
        el.title = h.name;
        el.onclick = () => unequipSquad(key);
      } else {
        el.textContent = '+';
        el.onclick = () => switchTab('heroes');
      }
      sl.appendChild(el);
    }
  }

  function renderShop() {
    const list = $('#shopList'); if (!list) return;
    list.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = '<div class="icon">' + item.icon + '</div><div class="meta"><div class="title">' + item.name + '</div><div class="desc">' + item.desc + '</div></div><div class="action"><button class="btn btn-sm">' + (item.currency==='usd'?'$'+item.price:item.price) + '</button></div>';
      const btn = el.querySelector('button');
      btn.onclick = () => { buyItem(item); playSfx('coin'); };
      if (item.type === 'promo' || item.currency !== 'usd') btn.classList.add('btn-ghost');
      list.appendChild(el);
    });
  }

  function renderSummon() {}
  function renderSummonResults(results) {
    const res = $('#summonResult'); if (!res) return;
    res.innerHTML = '';
    playSfx('pull');
    results.forEach((h, i) => {
      const t = HERO_TEMPLATES.find(x => x.key === h.base);
      setTimeout(() => {
        const el = document.createElement('div');
        el.style.cssText = 'margin:10px auto;text-align:center';
        el.innerHTML = '<div class="hero-portrait-large" style="border:3px solid ' + (RARITY_COLORS[h.rarity]||'#fff') + ';margin:0 auto">' + (t && t.icon ? t.icon : '?') + '</div><div style="font-weight:700;margin-top:6px">' + (h.name||'?') + '</div><div style="font-size:11px;color:' + (RARITY_COLORS[h.rarity]||'#aaa') + ';text-transform:uppercase">' + h.rarity + '</div>';
        res.appendChild(el);
        if (h.rarity === 'mythic' || h.rarity === 'legendary') playSfx('rare');
      }, i * 350);
    });
    updatePity();
  }

  function renderEvents() {
    const list = $('#eventList'); if (!list) return;
    list.innerHTML = '';
    const limitLeft = limitedBanner.active && Date.now() < limitedBanner.endsAt ? Math.max(0, Math.floor((limitedBanner.endsAt - Date.now()) / 1000)) : 0;
    const all = [...EVENTS];
    if (limitLeft > 0) all.unshift(limitedBanner);
    all.forEach(ev => {
      const el = document.createElement('div');
      el.className = 'item';
      const tLeft = ev.endsAt ? Math.max(0, Math.floor((ev.endsAt - Date.now()) / 1000)) : null;
      const desc = (ev.desc||'') + (tLeft != null ? ' <span style="color:' + (tLeft<600?'var(--red)':'var(--gold)') + '">' + formatTime(tLeft) + '</span>' : '');
      el.innerHTML = '<div class="icon">' + (ev.id==='lunar_spark'?'🌙':'✨') + '</div><div class="meta"><div class="title">' + ev.name + ' ' + (ev.id==='lunar_spark'?'<span style="color:#fbbf24">LIMITED</span>':'') + '</div><div class="desc">' + desc + '</div></div><div class="action"><span style="font-size:11px;color:var(--green)">ACTIVE</span></div>';
      list.appendChild(el);
    });
  }

  function renderAchievements() {
    const list = $('#achievementList'); if (!list) return;
    list.innerHTML = '';
    ACHIEVEMENTS.forEach(a => {
      const done = !!save.achievements[a.id];
      const el = document.createElement('div');
      el.className = 'item';
      el.style.opacity = done ? 1 : 0.5;
      el.innerHTML = '<div class="icon">' + (done ? '🏅' : '🥈') + '</div><div class="meta"><div class="title">' + a.title + '</div><div class="desc">' + a.desc + '</div></div><div class="action">' + (done ? '<span style="font-size:10px;color:var(--green)">✅ ' + (a.reward||'') + '🏆</span>' : '<button class="btn btn-sm btn-ghost">Locked</button>') + '</div>';
      list.appendChild(el);
    });
  }

  function notify(text) {
    const el = $('#notif');
    el.textContent = text;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
  }

  /* ── HAPTICS ─────────────────────────────── */
  function vibrate(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} }

  /* ── COUNT-UP ANIMATION ──────────────────── */
  function animateNum(elId, target, duration) {
    const el = $(elId); if (!el) return;
    const start = parseInt(el.textContent) || 0;
    const diff = target - start;
    if (Math.abs(diff) < 5 || diff < 0) { el.textContent = target; return; }
    const step = Math.ceil(diff / (duration / 30));
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
        current = target; clearInterval(timer);
      }
      el.textContent = formatBig(Math.floor(current));
    }, 30);
  }

  /* ── COMBO SYSTEM ────────────────────────── */
  let comboCount = 0;
  let comboTs = 0;

  function getCombo() {
    if (Date.now() - comboTs > 3000) comboCount = 0;
    return comboCount;
  }
  function incCombo() {
    comboTs = Date.now();
    comboCount++;
  }
  function comboBonus() { return 1 + Math.min(comboCount, 20) * 0.03; }

  /* ── TUTORIAL GACHA ─────────────────────────── */
  function quickGacha() {
    switchTab('summon');
    const orb = $('#summonOrb');
    if (!orb) return;
    orb.style.transform = 'scale(1.2)';
    setTimeout(() => {
      const forcedRoll = () => {
        const t = HERO_TEMPLATES[Math.floor(Math.random() * HERO_TEMPLATES.length)];
        return {key:t.key+'_'+Date.now()+'_'+Math.floor(Math.random()*9999),base:t.key,name:t.name,icon:t.icon,cls:t.cls,rarity:'rare',level:1,xp:0,owned:true};
      };
      const h = forcedRoll();
      save.heroes.push(h);
      save.pulls++;
      save.pity = 0;
      renderSummonResults([h]);
      renderHeroes();
      renderHud();
      notify('🎁 First pull — ' + h.name + ' (rare)!');
      setTimeout(() => { save.heroes.forEach(h2 => { if (!save.squad.includes(h2.key)) assignToSquad(h2.key); }); renderHeroes(); renderHud(); switchTab('campaign'); }, 1200);
    }, 400);
  }

  /* ── WINDOW API ─────────────────────────────── */
  window.game = {
    attack, switchTab,
    openSettings() { $('#settingsOverlay').classList.add('show'); },
    closeSettings() { $('#settingsOverlay').classList.remove('show'); },
    buyGems() { notify('IAP hook ready. Add AdMob / RevenueCat for store purchases.'); playSfx('coin'); },
    watchAd() {
      if (save.settings.noAds) return notify('No ads enabled');
      notify('🎬 Rewarded video +5💎');
      save.gems += 5; persist(); renderHud(); renderShop();
    },
    claimPass() {
      if (save.passXp >= 100) { save.passLvl++; save.passXp -= 100; persist(); notify('Pass level up!'); this.renderPass(); }
      else notify('Not enough XP');
    },
    reforged() { notify('Forge placeholder.'); },
    showEnergyTimer() { notify('Energy refill in ' + Math.ceil(energyRefillAt() / 1000) + 's'); },
    claimDaily() { claimDaily(); },
    init() {
      if (!save.bossHp) { const b = currentBoss(); save.bossMaxHp = b.hp; save.bossHp = b.hp; save.offlineTs = Date.now(); persist(); }
      const off = calcOffline();
      if (off.seconds > 0 && !save.offlineEarningsShown) { notify('Welcome back! +' + formatBig(off.gold) + '⚡'); save.offlineEarningsShown = true; persist(); }
      renderHud(); renderCampaign(); renderHeroes(); renderSummon(); renderDaily(); renderEvents(); renderAchievements();
      this.renderPass(); updatePity();
    },
    renderHeroes() { renderHeroes(); },
    renderHud() { renderHud(); },
    renderPass() {
      const pw = $('#passProgress'); if (pw) pw.style.width = Math.min(100, save.passXp) + '%';
      const pl = $('#passLvl'); if (pl) pl.textContent = save.passLvl;
      const px = $('#passXp'); if (px) px.textContent = save.passXp + '/100 XP';
    },
    renderSummon() { updatePity(); },
    renderAchievements() { renderAchievements(); },
    renderEvents() { renderEvents(); },
  };

  /* ── BOOT ───────────────────────────────────── */
  function boot() {
    const levelEl = document.addEventListener || function(){}; // polyfill marker
    $('#mainTabs').addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) switchTab(t.dataset.tab); });
    $('#tabBarMobile').addEventListener('click', e => { const b = e.target.closest('.tab-btn'); if (b) switchTab(b.dataset.tab); });
    $('#attackBtn').onclick = () => game.attack();
    $('#ultBtn').onclick = () => ultAttack();
    $('#basicPull').onclick = () => { doPull(false); playSfx('pull'); };
    $('#premiumPull').onclick = () => { doPull(true); playSfx('pull'); };
    $('#watchAd').onclick = () => game.watchAd();
    $('#passClaim').onclick = () => game.claimPass();
    const se = $('#exportSave');
    if (se) se.onclick = () => {
      const blob = new Blob([JSON.stringify(save)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'neon-legends-save.json'; a.click();
    };
    const si = $('#importSave');
    if (si) si.onclick = () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json';
      inp.onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = ev => { try { save = JSON.parse(ev.target.result); persist(); notify('Save imported'); location.reload(); } catch (err) { notify('Invalid save'); } };
        r.readAsText(f);
      };
      inp.click();
    };

    /* Sound toggles */
    const snd = $('#soundToggle'); if (snd) { snd.checked = save.settings.sound; snd.onchange = () => { save.settings.sound = snd.checked; persist(); if (snd.checked) playSfx('attack'); }; }
    const mus = $('#musicToggle'); if (mus) { mus.checked = save.settings.music; mus.onchange = () => { save.settings.music = mus.checked; persist(); }; }

    game.init();
    if (save.attackCount === 0) { const h = $('#helpToast'); if (h) { h.style.display = ''; setTimeout(() => h.style.display = 'none', 6000); } }

    /* Auto energy regen tick */
    setInterval(() => { remainingEnergy(); renderHud(); }, 1000);
    /* Auto UI refresh */
    setInterval(() => { game.renderPass(); game.renderSummon(); game.renderEvents(); renderCampaign(); }, 1000);
    notify('⚡ Neon Legends loaded!');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
