# Neon Legends Asset Manifest

All assets are CC0/public domain from Kenney.nl and other free sources.
Zero attribution required — ready for commercial use.

## Sound Effects (OGG format)

### Combat
| File | Source | Game Use |
|------|--------|----------|
| `assets/rpg-audio/Audio/metalClick.ogg` | Kenney RPG Audio | Attack hit |
| `assets/rpg-audio/Audio/metalPot1.ogg` | Kenney RPG Audio | Heavy hit / crit |
| `assets/rpg-audio/Audio/chop.ogg` | Kenney RPG Audio | Ultimate attack |
| `assets/rpg-audio/Audio/handleCoins.ogg` | Kenney RPG Audio | Gold collect |

### UI
| File | Source | Game Use |
|------|--------|----------|
| `assets/ui/Sounds/click-a.ogg` | Kenney UI Pack | Button click |
| `assets/ui/Sounds/tap-a.ogg` | Kenney UI Pack | Tab switch |
| `assets/ui/Sounds/switch-a.ogg` | Kenney UI Pack | Toggle on/off |
| `assets/interface-sounds/Audio/confirmation_001.ogg` | Kenney Interface | Victory fanfare |
| `assets/interface-sounds/Audio/error_001.ogg` | Kenney Interface | Error / no energy |
| `assets/interface-sounds/Audio/select_001.ogg` | Kenney Interface | Hero select |
| `assets/interface-sounds/Audio/maximize_001.ogg` | Kenney Interface | Rare pull fanfare |
| `assets/interface-sounds/Audio/open_001.ogg` | Kenney Interface | Chest open |

### Music (Background)
Use Web Audio API synth ambient drone (CC0 self-generated)
Electro pad: Cm chord, triangle wave, slow LFO, low-pass filter

## UI Icons (PNG/SVG from Kenney UI Pack)
- `assets/ui/PNG/` - Color-coded UI elements (Blue, Green, Grey, Red, Yellow, Extra)
- Gold coin: Use yellow circle or custom SVG
- Energy bolt: Use lightning icon from pack
- Gem: Use diamond icon from pack
- Star: Use star.svg from Vector/Yellow/

## Sprites
- `assets/pixel-platformer/Tilemap/tilemap-characters_packed.png` - Character spritesheet
- Hero icons: Use Kenney Tiny Dungeon pack after extraction
- Boss sprites: Use Kenney Pixel Platformer characters scaled up

## Backgrounds
Current: radial-gradient CSS (free, no image dependency)
Optional: Use Kenney Space Kit for nebula/starfield textures

## Integration Notes
- All audio files should be preloaded via HTML `<audio>` elements or Web Audio API `fetch` + `decodeAudioData`
- Sprites can be loaded as `<img>` or CSS `background-image: url()`
- For offline play, bundle assets in service worker cache