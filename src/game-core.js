'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const RARITY = { common:'common', rare:'rare', epic:'epic', legendary:'legendary', mythic:'mythic' };
const RARITY_COLORS = { common:'#9ca3af', rare:'#60a5fa', epic:'#a78bfa', legendary:'#fbbf24', mythic:'#f472b6' };
const RARITY_WEIGHTS = { common:50, rare:30, epic:14, legendary:5, mythic:1 };

const HERO_TEMPLATES = [
  { key:'ember', name:'Ember', icon:'🔥', class:'Warrior', hpGrowth:.8, atkGrowth:1.2, skill:'Flame Slash' },
  { key:'frost', name:'Frost', icon:'❄️', class:'Mage', hpGrowth:.5, atkGrowth:1.5, skill:'Ice Barrage' },
  { key:'storm', name:'Storm', icon:'⚡', class:'Ranger', hpGrowth:.6, atkGrowth:1.3, skill:'Chain Lightning' },
  { key:'terra', name:'Terra', icon:'🌿', class:'Guardian', hpGrowth:1.4, atkGrowth:.9, skill:'Quake' },
  { key:'nova', name:'Nova', icon:'🌌', class:'Sorcerer', hpGrowth:.55, atkGrowth:1.6, skill:'Supernova' },
  { key:'shadow', name:'Shadow', icon:'👤', class:'Assassin', hpGrowth:.5, atkGrowth:1.7, skill:'Vanish Strike' },
  { key:'luna', name:'Luna', icon:'🌙', class:'Priest', hpGrowth:.7, atkGrowth:1.1, skill:'Moonlight' },
  { key:'volt', name:'Volt', icon:'💥', class:'Brawler', hpGrowth:1.1, atkGrowth:1.3, skill:'Thunder Fist' },
  { key:'cinder', name:'Cinder', icon:'🌋', class:'Warlock', hpGrowth:.6, atkGrowth:1.4, skill:'Inferno' },
  { key:'glacier', name:'Glacier', icon:'🧊', class:'Paladin', hpGrowth:1.2, atkGrowth:1.0, skill:'Frozen Oath' },
  { key:'neon', name:'Neon', icon:'👾', class:'Hacker', hpGrowth:.7, atkGrowth:1.5, skill:'Glitch' },
  { key:'aurora', name:'Aurora', icon:'🌈', class:'Druid', hpGrowth:.9, atkGrowth:1.2, skill:'Aurora Beam' },
];

const BOSSES = [
  { name:'Slime King', icon:'👾', hp:50, atk:1, gold:10 },
  { name:'Dark Knight', icon:'🖤', hp:150, atk:2, gold:25 },
  { name:'Venom Queen', icon:'🐍', hp:400, atk:4, gold:60 },
  { name:'Iron Titan', icon:'🤖', hp:900, atk:7, gold:140 },
  { name:'Void Wraith', icon:'👻', hp:2000, atk:12, gold:300 },
  { name:'Inferno Dragon', icon:'🐉', hp:5000, atk:20, gold:700 },
  { name:'Neon Overlord', icon:'👿', hp:12000, atk:35, gold:1500 },
];

const SKINS = [
  { id:'ember_fire', hero:'ember', name:'Fire Emperor', color:'#ef4444', price:500 },
  { id:'frost_ice', hero:'frost', name:'Ice Queen', color:'#22d3ee', price:500 },
  { id:'storm_wind', hero:'storm', name:'Storm God', color:'#fbbf24', price:800 },
];

let defaultSave = {
  gold:0, gems:150, energy:100, maxEnergy:100, energyTs:Date.now(), trophies:0,
  stage:0, bossHp:null, bossMaxHp:null, attackCount:0,
  heroes:[], squad:[], owned:false,
  pity:0, pulls:0,
  passLvl:1, passXp:0, claimedToday:false, lastDaily:null, streak:0,
  achievements:{}, settings:{ sound:true, music:true, notif:true },
  firstRun:true, offlineEarningsShown:false,
  eventProgress:{ clicks:0, spend:0 }
};

function fresh(){ return JSON.parse(JSON.stringify(defaultSave)); }
