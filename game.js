(function(){
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const STORAGE_KEY='neon_legends_save_v2';
  const RARITY_COLORS={common:'#9ca3af',rare:'#60a5fa',epic:'#a78bfa',legendary:'#fbbf24',mythic:'#f472b6'};
  const RARITY_WEIGHTS={common:50,rare:30,epic:14,legendary:5,mythic:1};
  const HERO_TEMPLATES=[
    {key:'ember',name:'Ember',icon:'🔥',class:'Warrior',hpGrowth:.8,atkGrowth:1.2,skill:'Flame Slash'},
    {key:'frost',name:'Frost',icon:'❄️',class:'Mage',hpGrowth:.5,atkGrowth:1.5,skill:'Ice Barrage'},
    {key:'storm',name:'Storm',icon:'⚡',class:'Ranger',hpGrowth:.6,atkGrowth:1.3,skill:'Chain Lightning'},
    {key:'terra',name:'Terra',icon:'🌿',class:'Guardian',hpGrowth:1.4,atkGrowth:.9,skill:'Quake'},
    {key:'nova',name:'Nova',icon:'🌌',class:'Sorcerer',hpGrowth:.55,atkGrowth:1.6,skill:'Supernova'},
    {key:'shadow',name:'Shadow',icon:'👤',class:'Assassin',hpGrowth:.5,atkGrowth:1.7,skill:'Vanish Strike'},
    {key:'luna',name:'Luna',icon:'🌙',class:'Priest',hpGrowth:.7,atkGrowth:1.1,skill:'Moonlight'},
    {key:'volt',name:'Volt',icon:'💥',class:'Brawler',hpGrowth:1.1,atkGrowth:1.3,skill:'Thunder Fist'},
    {key:'cinder',name:'Cinder',icon:'🌋',class:'Warlock',hpGrowth:.6,atkGrowth:1.4,skill:'Inferno'},
    {key:'glacier',name:'Glacier',icon:'🧊',class:'Paladin',hpGrowth:1.2,atkGrowth:1.0,skill:'Frozen Oath'},
    {key:'neon',name:'Neon',icon:'👾',class:'Hacker',hpGrowth:.7,atkGrowth:1.5,skill:'Glitch'},
    {key:'aurora',name:'Aurora',icon:'🌈',class:'Druid',hpGrowth:.9,atkGrowth:1.2,skill:'Aurora Beam'},
  ];
  const BOSSES=[
    {name:'Slime King',icon:'👾',hp:60,atk:1,gold:15},
    {name:'Dark Knight',icon:'🖤',hp:180,atk:2,gold:30},
    {name:'Venom Queen',icon:'🐍',hp:500,atk:4,gold:90},
    {name:'Iron Titan',icon:'🤖',hp:1200,atk:7,gold:220},
    {name:'Void Wraith',icon:'👻',hp:3000,atk:12,gold:480},
    {name:'Inferno Dragon',icon:'🐉',hp:7500,atk:20,gold:1050},
    {name:'Neon Overlord',icon:'👿',hp:18000,atk:35,gold:2250},
  ];
  const SKINS=[
    {id:'ember_fire',hero:'ember',name:'Fire Emperor',color:'#ef4444',price:500},
    {id:'frost_ice',hero:'frost',name:'Ice Queen',color:'#22d3ee',price:500},
    {id:'storm_wind',hero:'storm',name:'Storm God',color:'#fbbf24',price:800},
    {id:'shadow_dark',hero:'shadow',name:'Night Reaper',color:'#a855f7',price:1200},
    {id:'neon_punk',hero:'neon',name:'Synthwave Hero',color:'#ec4899',price:1500},
  ];
  const ACHIEVEMENTS=[
    {id:'first_kill',title:'First Blood',desc:'Defeat your first boss',check:s=>s.attackCount>=1},
    {id:'click_100',title:'Clicker',desc:'100 attacks',check:s=>s.attackCount>=100},
    {id:'click_1000',title:'Smasher',desc:'1000 attacks',check:s=>s.attackCount>=1000},
    {id:'pull_10',title:'Recruiter',desc:'Perform 10 summons',check:s=>s.pulls>=10},
    {id:'reach_ch5',title:'Voyager',desc:'Reach chapter 5',check:s=>s.stage>=5},
    {id:'big_wallet',title:'Big Wallet',desc:'Hold 5000 gold',check:s=>s.gold>=5000},
    {id:'legendary',title:'Legendary',desc:'Pull a legendary hero',check:s=>s.heroes.some(h=>h.rarity==='legendary'||h.rarity==='mythic')},
  ];
  const SHOP_ITEMS=[
    {id:'gem_pack_sm',name:'Small Gem Pack',desc:'100 gems',icon:'💎',price:0.99,currency:'usd',give:{gems:100},type:'gem'},
    {id:'gem_pack_md',name:'Medium Gem Pack',desc:'500 gems',icon:'💎',price:4.99,currency:'usd',give:{gems:500},type:'gem'},
    {id:'starter_pack',name:'Starter Pack',desc:'Gold + Hero shard',icon:'🎁',price:0.99,currency:'usd',give:{gold:2000,gems:50},type:'pack'},
    {id:'starter_hero',name:'Hero Shard: Frost',desc:'Unlock Frost',icon:'❄️',price:1.99,currency:'usd',give:{shard:'frost'},type:'shard'},
    {id:'no_ads',name:'Remove Ads',desc:'No more ad placeholders',icon:'🚫',price:2.99,currency:'usd',type:'no_ads'},
  ];
  const EVENTS=[
    {id:'click_boom',name:'Click Surge',desc:'+200% attack power for 24h',duration:24*60*60*1000,active:true},
    {id:'gold_rush',name:'Gold Rush',desc:'+150% gold from bosses',duration:48*60*60*1000,active:true},
  ];

  let save = load();
  if(save.firstRun || !save.owned){ giveHero('ember','common'); save.owned=true; save.firstRun=false; save.heroes[0].owned=true; save.squad[0]='ember'; persist();}

  function load(){
    try{ const raw=localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):fresh();}catch(e){return fresh();}
  }
  function persist(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(save)); }
  function fresh(){
    return {gold:0,gems:150,energy:100,maxEnergy:100,energyTs:Date.now(),trophies:0,stage:0,bossHp:null,bossMaxHp:null,attackCount:0,
      heroes:[],squad:[],owned:false,pity:0,pulls:0,passLvl:1,passXp:0,claimedToday:false,lastDaily:null,streak:0,
      achievements:{},settings:{sound:true,music:true,notif:true},firstRun:true,offlineEarningsShown:false,
      eventProgress:{clicks:0,spend:0},skins:{},skinEquipped:{}};
  }

  /* boss calc */
  function currentBoss(){ const idx=save.stage%BOSSES.length; const ch=Math.floor(save.stage/7)+1; const boss={...BOSSES[idx]}; const scale=Math.pow(1.22,save.stage); boss.hp=Math.floor(boss.hp*scale); boss.atk=Math.floor(boss.atk*scale); boss.gold=Math.floor(boss.gold*scale); boss.maxHp=boss.hp; boss.chapter=ch; return boss; }
  function squadPower(){ const sq=save.squad.slice(0,4); if(!sq.length) return 1; let power=0; sq.forEach(key=>{ const h=save.heroes.find(x=>x.key===key); if(!h) return; const base=HERO_TEMPLATES.find(t=>t.key===key); if(!base) return; const lvl=h.level||1; const rarityMul = {common:1,rare:1.4,epic:1.9,legendary:2.7,mythic:3.5}; const multi = rarityMul[h.rarity]||1; const atk = base.atkGrowth*5*lvl*multi; const hp = base.hpGrowth*20*lvl*multi; power += atk; }); return Math.max(1,power); }
  function remainingEnergy(){ const now=Date.now(); const diff=now-save.energyTs; const regen=Math.floor(diff/1000); if(regen>0){ save.energy=Math.min(save.maxEnergy,save.energy+regen); save.energyTs=now; persist();} return save.energy; }

  /* hero generation */
  function rollHero(){ save.pity++; let pool=['mythic']; if(save.pity>=10){ pool.push('mythic','legendary'); } const total=RARITY_WEIGHTS[Object.keys(RARITY_WEIGHTS).reduce((a,b)=>RARITY_WEIGHTS[a]+RARITY_WEIGHTS[b]>100?a:b)]; const sum=Object.values(RARITY_WEIGHTS).reduce((a,b)=>a+b,0); let r=Math.random()*sum, acc=0, rarity='common'; for(const [k,w] of Object.entries(RARITY_WEIGHTS)){ acc+=w; if(r<=acc){ rarity=k; break; } } const templates=HERO_TEMPLATES; const t=templates[Math.floor(Math.random()*templates.length)]; return { key:t.key+'_'+Date.now(), base:t.key, name:t.name, icon:t.icon, class:t.class, rarity, level:1, xp:0, owned:true }; }
  function giveHero(baseKey,forcedRarity){ const t=HERO_TEMPLATES.find(x=>x.key===baseKey); if(!t) return; const h={key:t.key+'_'+Date.now(),base:t.key,name:t.name,icon:t.icon,class:t.class,rarity:forcedRarity||'common',level:1,xp:0,owned:true}; save.heroes.push(h); return h; }

  /* progression */
  function assignToSquad(key){ if(save.squad.length>=4) return notify('Squad full!'); save.squad.push(key); persist(); renderHeroes(); notify(`${HERO_TEMPLATES.find(t=>t.key===key.split('_')[0]).name} added`); }
  function unequipSquad(key){ save.squad=save.squad.filter(k=>k!==key); persist(); renderHeroes(); }
  function levelUpHero(key){ const h=save.heroes.find(x=>x.key===key); if(!h) return; const cost=Math.floor(100*Math.pow(1.6,h.level-1)); if(save.gold<cost){ return notify('Not enough gold'); } save.gold-=cost; h.xp+=100; if(h.xp>=100){ h.level++; h.xp-=100; notify('Level up!'); renderHeroes(); } persist(); renderHud(); }

  /* summoning */
  function doPull(premium){
    const cost = premium? 10 : 100;
    const currency = premium? 'gems':'gold';
    if(save[currency]<cost){ return notify('Not enough ' + currency); }
    save[currency]-=cost; save.pulls++;
    const count = premium? 1 : 5;
    const results=[]; for(let i=0;i<count;i++){ const h=rollHero(); save.heroes.push(h); results.push(h); if(h.rarity==='legendary'||h.rarity==='mythic') notify('⭐ Legendary/Mythic pull!'); }
    if(premium){ save.pity++; if(save.pity>=10){ for(let i=0;i<5;i++){ const h=rollHero(); save.heroes.push(h); results.push(h);} save.pity=0; } } else { save.pity=0; }
    persist(); renderHeroes(); renderSummonResults(results); renderHud();
  }

  /* Shop & Economy */
  function buyItem(item){
    if(item.type==='gem'){ save.gems+=item.give.gems; persist(); renderShop(); renderHud(); notify('Gems added!'); return; }
    if(item.type==='pack'){ save.gold=(save.gold||0)+item.give.gold; save.gems=(save.gems||0)+(item.give.gems||0); persist(); renderShop(); renderHud(); notify('Pack claimed!'); return; }
    if(item.type==='shard'){ const base=item.give.shard; if(save.heroes.some(h=>h.base===base)){ notify('Already owned'); return; } giveHero(base,'rare'); persist(); renderHeroes(); renderHud(); notify('Hero unlocked!'); return; }
    if(item.type==='no_ads'){ save.settings.noAds=true; persist(); notify('No ads enabled!'); renderShop(); return; }
  }

  /* Daily Rewards */
  function claimDaily(){ const now=new Date(); const today=now.toDateString(); if(save.lastDaily===today){ return notify('Already claimed today'); } save.lastDaily=today; save.streak=(save.streak||0)+1; const rewards=[{gold:100,gems:10},{gold:200,gems:5},{gold:300,gems:0,shard:'random'},{gold:400,gems:25},{gold:0,gems:50},{gold:600,gems:20},{gold:0,gems:100}]; const r=rewards[(save.streak-1)%rewards.length]||rewards[0]; if(r.gold) save.gold+=r.gold; if(r.gems) save.gems+=r.gems; if(r.shard==='random'){ const k=HERO_TEMPLATES[Math.floor(Math.random()*HERO_TEMPLATES.length)].key; if(!save.heroes.some(h=>h.base===k)) giveHero(k); } persist(); notify('Daily reward claimed!'); renderCalendar(); }
  function renderCalendar(){ const c=$('#calendar'); if(!c) return; let html='<div style="display:flex;gap:6px;flex-wrap:wrap;margin:0 12px 80px">'; for(let i=1;i<=7;i++){ const claimed=(save.lastDaily?new Date(save.lastDaily).getDate():999)===i; html+=`<div class="card" style="flex:1;min-width:60px;text-align:center;padding:10px 6px"><div style="font-size:10px;color:rgba(255,255,255,0.5)">Day ${i}</div><div style="font-size:20px">${claimed?'✅':'🎁'}</div></div>`; } html+='</div>'; const list=$('#shopList'); if(list){ const cal=document.createElement('div'); cal.innerHTML=html; list.parentNode.insertBefore(cal,list.nextSibling); }}

  /* Achievements */
  function checkAchievements(){ let changed=false; ACHIEVEMENTS.forEach(a=>{ if(!save.achievements[a.id] && a.check(save)){ save.achievements[a.id]=true; save.trophies++; notify('🏅 '+a.title); changed=true; }}); if(changed) persist(); renderHud(); renderAchievements(); }

  /* Battle / AFK */
  function attack(){
    const now=Date.now(); if(remainingEnergy()<1) return notify('No energy');
    save.energy-=1; save.energyTs=now; save.attackCount++; save.eventProgress.clicks++; save.passXp+=2;
    let boss=currentBoss(); if(!save.bossHp){ save.bossMaxHp=boss.hp; save.bossHp=boss.hp; }
    const dmg=Math.floor(squadPower()*(1+Math.random()*.3)); save.bossHp-=dmg; if(save.bossHp<=0){ defeatBoss(); }
    persist(); renderHud(); renderCampaign(); checkAchievements(); spawnDmg(dmg); if(save.attackCount===1) setTimeout(quickGacha,700);
  }
  function defeatBoss(){ const boss=currentBoss(); save.gold+=boss.gold; save.passXp+=10; save.stage++; notify('🏆 Boss defeated! +'+boss.gold+' gold'); save.bossHp=null; save.bossMaxHp=null; persist(); checkAchievements(); }
  function spawnDmg(dmg){ const bossArea=$('#bossArea'); const el=document.createElement('div'); el.className='dmg'; el.textContent='-'+dmg; bossArea.appendChild(el); setTimeout(()=>el.remove(),800); }
  function calcOffline(){ const updatesPerSecond=1; const now=Date.now(); const diffSec=Math.min(43200,Math.floor((now-(save.offlineTs||now))/1000)); if(diffSec>0){ const goldGain=Math.floor(diffSec*squadPower()*0.5); save.gold+=goldGain; save.offlineTs=now; persist(); return {seconds:diffSec,gold:goldGain}; } return {seconds:0,gold:0}; }

  function quickGacha(){ switchTab('summon'); const orb=$('#summonOrb'); if(!orb) return; orb.style.transform='scale(1.2)'; setTimeout(()=>{ doPull(true); setTimeout(()=>{ save.heroes.forEach(h=>{ if(!save.squad.includes(h.key)){ assignToSquad(h.key); }} ); renderHeroes(); renderHud(); switchTab('campaign'); },1200); },400); }

  /* UI */
  function switchTab(id){ $$('.tab-panel').forEach(p=>p.style.display='none'); const panel=$('#'+id); if(panel) panel.style.display=''; $$('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id)); $$('#mainTabs .tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id)); if(id==='heroes') renderHeroes(); if(id==='shop') renderShop(); if(id==='events') renderEvents(); if(id==='achievements') renderAchievements(); }
  function renderHud(){ $('#gold').textContent=formatBig(save.gold); $('#gems').textContent=save.gems; $('#trophies').textContent=save.trophies; const pct=Math.floor((save.energy/save.maxEnergy)*100); $('#energyFill').style.width=pct+'%'; $('#ultCharge').textContent=Math.min(100,Math.floor(save.attackCount%100)); }
  function formatBig(n){ if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'k'; return Math.floor(n); }
  function renderCampaign(){
    const boss=currentBoss(); const hp=save.bossHp!=null?Math.max(0,save.bossHp):boss.hp; const pct=save.bossMaxHp?((hp/save.bossMaxHp)*100):100; $('#bossHp').style.width=pct+'%'; $('#bossName').textContent=boss.name; $('#bossPortrait').textContent=boss.icon; $('#chapterNum').textContent=Math.floor(save.stage/7)+1; $('#stageNum').textContent=(save.stage%7)+1;
  }
  function renderHeroes(){
    const grid=$('#heroGrid'); if(!grid) return; grid.innerHTML='';
    save.heroes.forEach(h=>{
      const t=HERO_TEMPLATES.find(x=>x.key===h.base); const rarityLabel=h.rarity?h.rarity:'common';
      const el=document.createElement('div'); el.className='hero-card rarity-'+rarityLabel; if(h.owned) el.classList.add('owned');
      el.innerHTML=`<div class="badge">${rarityLabel[0].toUpperCase()}</div><div>${t?t.icon:'?'}</div><div class="stars">${h.level?('Lv'+h.level):''}</div>`;
      el.onclick=()=>{ if(h.owned && !save.squad.includes(h.key)) assignToSquad(h.key); else if(save.squad.includes(h.key)) unequipSquad(h.key); };
      grid.appendChild(el);
    });
    renderSquad();
  }
  function renderSquad(){ const sl=$('#squadSlots'); if(!sl) return; sl.innerHTML='';
    for(let i=0;i<4;i++){ const key=save.squad[i]; const h=save.heroes.find(x=>x.key===key); const el=document.createElement('div'); el.style.cssText='width:60px;height:60px;border-radius:12px;background:rgba(124,58,237,0.1);display:flex;align-items:center;justify-content:center;font-size:26px;border:1px solid rgba(124,58,237,0.3)'; if(h){ const t=HERO_TEMPLATES.find(x=>x.key===h.base); el.textContent=t?t.icon:'?'; el.onclick=()=>unequipSquad(key); } else { el.textContent='+'; el.onclick=()=>{ notify('Open Heroes to add'); }; } sl.appendChild(el); }}
  function renderShop(){ const list=$('#shopList'); if(!list) return; list.innerHTML=''; SHOP_ITEMS.forEach(item=>{ const el=document.createElement('div'); el.className='item'; el.innerHTML=`<div class="icon">${item.icon}</div><div class="meta"><div class="title">${item.name}</div><div class="desc">${item.desc}</div></div><div class="action"><button class="btn btn-sm">${item.currency==='usd'?'$'+item.price:'Claim'}</button></div>`; el.querySelector('button').onclick=()=>buyItem(item); list.appendChild(el); }); }
  function renderSummon(){ }
  function renderSummonResults(results){ const res=$('#summonResult'); if(!res) return; res.innerHTML=''; results.forEach((h,i)=>{ const t=HERO_TEMPLATES.find(x=>x.key===h.base); setTimeout(()=>{ const el=document.createElement('div'); el.style.cssText='margin:10px auto;text-align:center'; el.innerHTML=`<div class="hero-portrait-large" style="border:2px solid ${RARITY_COLORS[h.rarity]||'#fff'};margin:0 auto">${t&&t.icon?t.icon:'?'}</div><div style="font-weight:700;margin-top:6px">${h?h.name:'?'}</div><div style="font-size:11px;color:${RARITY_COLORS[h.rarity]||'#aaa'};text-transform:uppercase">${h.rarity}</div>`; res.appendChild(el); },i*250+i*100); }); }
  function renderEvents(){ const list=$('#eventList'); if(!list) return; list.innerHTML=''; EVENTS.forEach(ev=>{ const el=document.createElement('div'); el.className='item'; el.innerHTML=`<div class="icon">✨</div><div class="meta"><div class="title">${ev.name}</div><div class="desc">${ev.desc}</div></div><div class="action"><span style="font-size:11px;color:var(--green)">ACTIVE</span></div>`; list.appendChild(el); }); }
  function renderAchievements(){ const list=$('#achievementList'); if(!list) return; list.innerHTML=''; ACHIEVEMENTS.forEach(a=>{ const done=!!save.achievements[a.id]; const el=document.createElement('div'); el.className='item'; el.style.opacity=done?1:.5; el.innerHTML=`<div class="icon">${done?'🏅':'🥈'}</div><div class="meta"><div class="title">${a.title}</div><div class="desc">${a.desc}</div></div><div class="action"><button class="btn btn-sm ${done?'':'btn-ghost'}" ${done?'disabled':''}>${done?'Claim':'Locked'}</button></div>`; const btn=el.querySelector('button'); if(btn && !done){ btn.onclick=()=>{ save.achievements[a.id]=true; save.trophies+=10; persist(); renderHud(); renderAchievements(); notify('🏅 '+a.title); }; } list.appendChild(el); }); }
  function renderCalendar(){ const c=$('#calendar'); if(!c) return; let html='<div style="display:flex;gap:6px;flex-wrap:wrap;margin:0 12px 80px">'; for(let i=1;i<=7;i++){ const claimed=(save.lastDaily?new Date(save.lastDaily).getDate():999)===i; html+=`<div class="card" style="flex:1;min-width:60px;text-align:center;padding:10px 6px"><div style="font-size:10px;color:rgba(255,255,255,0.5)">Day ${i}</div><div style="font-size:20px">${claimed?'✅':'🎁'}</div></div>`; } html+='</div>'; const list=$('#shopList'); if(list){ const cal=document.createElement('div'); cal.innerHTML=html; list.parentNode.insertBefore(cal,list.nextSibling); }}

  function notify(text){ const el=$('#notif'); el.textContent=text; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800); }
  window.game={
    attack,
    switchTab,
    openSettings(){ $('#settingsOverlay').classList.add('show'); },
    closeSettings(){ $('#settingsOverlay').classList.remove('show'); },
    buyGems(){ notify('IAP hook ready. Add AdMob / RevenueCat for store purchases.'); },
    buyHero(shard){ notify('Hero voucher hook. Add payment SDK here.'); },
    heroGirl(h){ notify('Voucher redeemed. Reward = skin unlock.'); },
    playAd(){ notify('Ad hook. Good slot for rewarded video.'); },
    claimDaily(){ notify('Calendar claim hook.'); },
    claimPass(){ if(save.passXp>=100){ save.passLvl++; save.passXp-=100; persist(); notify('Pass level up!'); this.renderPass(); } else { notify('Not enough XP'); }},
    reforged(){ notify('Forge placeholder.'); },
    autoEnergy(){ setInterval(()=>{ if(save.energy<save.maxEnergy){ renderHud(); } },1000); },
    init(){
      if(!save.bossHp){ const b=currentBoss(); save.bossMaxHp=b.hp; save.bossHp=b.hp; save.offlineTs=Date.now(); persist(); }
      const offline=calcOffline(); if(offline.seconds>0 && !save.offlineEarningsShown){ notify(`Welcome back! +${formatBig(offline.gold)}⚡ earned offline`); save.offlineEarningsShown=true; persist(); }
      renderHud(); renderCampaign(); renderHeroes(); renderSummon(); renderCalendar(); renderEvents(); renderAchievements(); this.renderPass();
    },
    renderHeroes(){ renderHeroes(); },
    renderHud(){ renderHud(); },
    renderPass(){ $('#passProgress').style.width=Math.min(100,save.passXp)+'%'; $('#passLvl').textContent=save.passLvl; $('#passXp').textContent=save.passXp+'/100 XP'; },
    renderSummon(){ $('#pityCount').textContent=save.pity; $('#pityProgress').textContent=Math.min(100,Math.floor((save.pity/10)*100)); },
    renderAchievements(){ renderAchievements(); },
    renderEvents(){ renderEvents(); }
  };

  function boot(){
    // Tab clicks
    $('#mainTabs').addEventListener('click', e=>{ const t=e.target.closest('.tab'); if(t) switchTab(t.dataset.tab); });
    $('#tabBarMobile').addEventListener('click', e=>{ const btn=e.target.closest('.tab-btn'); if(btn) switchTab(btn.dataset.tab); });
    $('#attackBtn').onclick=()=>game.attack();
    $('#ultBtn').onclick=()=>{ if(save.attackCount>=100){ notify('Ultimate unleashed!'); save.attackCount-=100; persist(); } else { notify('Charge more'); } };
    $('#basicPull').onclick=()=>doPull(false);
    $('#premiumPull').onclick=()=>doPull(true);
    $('#passClaim').onclick=()=>game.claimPass();
    game.init();
    setInterval(()=>{ game.renderHud(); game.renderPass(); game.renderSummon(); },1000);
    setInterval(()=>{ renderCampaign(); },1000);
    notify('⚡ Welcome to Neon Legends!');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
