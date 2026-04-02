Bloom Burst Garden

Native iOS prototype (Swift + Xcode):
1. `cd /Users/diggy8745/conductor/workspaces/scratchpad/hamburg-v1`
2. `xcodegen generate`
3. Open `BloomwaveGarden.xcodeproj` in Xcode
4. Run scheme `BloomwaveGarden` on an iOS Simulator

Quick build check from terminal:
- `xcodebuild -project BloomwaveGarden.xcodeproj -scheme BloomwaveGarden -destination 'generic/platform=iOS Simulator' build`

Native project files:
- `project.yml`
- `BloomwaveGarden/BloomwaveGardenApp.swift`
- `BloomwaveGarden/ContentView.swift`
- `BloomwaveGarden/GardenScene.swift`
- `BloomwaveGarden/LofiAudioEngine.swift`
- `BloomwaveGarden/GameHUDModel.swift`

Run locally:
1. `python3 -m http.server 8080`
2. Open `http://localhost:8080`

Controls:
- Click / tap: fire a burst at cursor position
- `Space` / `W` / `Up Arrow`: fire burst at spirit cursor
- `Enable Lofi`: start or mute background audio
- `New Session`: restart instantly
- Arc rule: every 2 same-color hits in one burst can zap 1 off-color flower
- Anti-spam: bursts have a short cooldown; rapid double-clicks are blocked/penalized
- Farming counter: harvest progress fills crates (`Harvest` + `Crates` in HUD)

Audio note:
- First interaction with the game area now unlocks audio (browser autoplay policy).
- If your browser still blocks sound, click the game once, then press `Enable Lofi`.

Design targets:
- Not a runner and not a Flappy-style gravity loop
- Pixel-style presentation using sprite files from `assets/sprites/`
- Immediate hit feedback, combo scoring, and short goals
- Frenzy mode for short high-intensity scoring windows
- No flower auto-death timer (flowers persist until harvested)

Sprite files:
- `assets/sprites/bed.svg`
- `assets/sprites/sprout-1.svg`
- `assets/sprites/sprout-2.svg`
- `assets/sprites/bloom-amber.svg`
- `assets/sprites/bloom-teal.svg`
- `assets/sprites/flower-amber.svg`
- `assets/sprites/flower-teal.svg`
- `assets/sprites/flower-gold.svg`
- `assets/sprites/spirit-amber.svg`
- `assets/sprites/spirit-teal.svg`
