# Neon Legends — Idle RPG

## Status: Production-Ready after Full Audit

### 🎮 Gameplay
- **Combat**: Click-to-attack boss battles with floating damage numbers + shake animation
- **Ultimate**: Charged attack every 100 hits — deals 5× damage
- **Squad**: Drag-and-drop hero assignment (max 4), right-click to disenchant for gold
- **Gacha**: Basic pull (100 gold) and premium pull (10 gems) with 10-pull pity system
- **Heroes**: 12 unique hero templates across 5 rarity tiers, 5 unlockable skins
- **Progression**: 7-boss campaign cycle scaling at 22% per stage, 7× daily rewards
- **Passive**: Offline earnings, energy 1/sec regen, battle pass XP

### 🎨 Asset Attribution
- Icons: Emoji Unicode + [Font Awesome](https://fontawesome.com/license) (free)
- Google Fonts: Orbitron + Inter under SIL Open Font License
- All other game assets are free to use

### 📦 Stack
<table>
<tr><td>Frontend</td><td>HTML/CSS/JS SPA (no framework)</td></tr>
<tr><td>Audio</td><td>Web Audio API synth (no file dependencies)</td></tr>
<tr><td>Save</td><td>localStorage with JSON export/import</td></tr>
<tr><td>Deploy</td><td>GitHub Pages (auto via `.github/workflows/pages.yml`)</td></tr>
<tr><td>PWA</td><td>Standalone install via manifest.json + sw.js</td></tr>
<tr><td>AppStore</td><td>Wraps with Capacitor for iOS/Android</td></tr>
</table>

### 🚀 Quick Start
```bash
# Local dev
python -m http.server 5173
open http://localhost:5173
```

### 🛒 Monetization Hooks (SDK integration needed)
| Feature | SDK |
|---------|-----|
| Rewarded video | AdMob / Unity Ads / ironSource |
| IAP gem packs | RevenueCat / Stripe / StoreKit |
| Remove ads | One-time IAP purchase |
| Battle pass | Server-side validation + receipt check |

### 📈 Retention Engineering
- **First pull (attack 1)**: Guaranteed rare hero instantly
- **Daily streak**: 7-day calendar roll with hero shard on day 3
- **Limited banner**: "Lunar Spark" mythic x3 rate for 24h
- **Event rotation**: Click Surge, Gold Rush, Gem Mirage, Hero Fest
- **Notification**: Toast-based feedback for every action
- **Sound**: Web Audio synth for attack/ult/victory/collect/rare pull

### 🔧 Post-Audit Fixes (v0.8 → v0.9)
- Energy now regenerates 1/s automatically
- Ultimate attack deals real damage (5× squad power)
- Promo shop items properly use `give.gold`/`give.gems`
- Daily calendar displays actual day rewards (`#calendar` div added)
- Boss shake animation on hit (`bossArea.classList.add('hit')`)
- Achievement rewards properly granted on check (not double from UI click)
- Pity counter updates immediately after pull
- Mobile bottom bar now has all 7 tabs (Battle, Heroes, Summon, Shop, Events, Guild, Medals)
- Interstitial ad slot removed from campaign (breaks immersion)
- Sound effects: attack, ultimate, victory, rare pull, coin collect
- Event timers show `formatTime()` instead of raw seconds
- All tabs render on first switch without needing a second click
- `renderCalendar()` simplified to update `#calendar` directly
- Dead code/pruned: unused `pool`, `total` variables in `rollHero()`
- UI now updates pity display after every pull

### 📋 Deploy
1. Enable GitHub Pages in repo settings → Source: GitHub Actions
2. Repo auto-deploys every push to `master`
3. Assign custom domain in Pages settings

