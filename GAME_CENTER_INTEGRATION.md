# Game Center Integration

Bloomwave Garden is prepared for a Game Center leaderboard-backed iOS release. The app uses the custom in-game leaderboard UI and swaps in native Game Center rows when the iOS bridge returns them.

## Current IDs

- Bundle ID: `com.nate27624.bloomwavegarden`
- Leaderboard ID: `com.nate27624.bloomwavegarden.total_blooms`
- Entitlements: `BloomwaveGarden/BloomwaveGarden.entitlements`
- Info.plist key: `GameCenterLeaderboardID`

## Apple Setup

1. In Apple Developer, enable Game Center for the app identifier `com.nate27624.bloomwavegarden`.
2. In App Store Connect, create the app record for the same bundle ID.
3. Add a Game Center leaderboard with the exact ID `com.nate27624.bloomwavegarden.total_blooms`.
4. Configure it as a classic leaderboard, integer score, larger scores are better.
5. Use total Blooms as the leaderboard score.

The app submits total Crates through Game Center's score `context` field so the custom crate visualizer can show crate counts next to Apple leaderboard rows.

## Code Path

- Web submits native scores with `postNativeGameCenter("submitScore", { score, crates })`.
- `WebGameView` forwards that to `GameCenterService.submitProgressScore(score:crates:)`.
- `GameCenterService` submits `score` as total Blooms and `crates` as the Game Center context.
- The leaderboard screen calls `postNativeGameCenter("loadLeaderboard", { limit })`.
- `GameCenterService` loads Game Center rows and sends them back to `window.bloomwaveNativeGameCenter.receiveLeaderboard(...)`.
- If native rows are unavailable, the browser/local leaderboard remains the fallback.

## Future Credential Pass

Once the Apple account is ready, verify:

- `DEVELOPMENT_TEAM` in the Xcode project matches the paid Apple Developer team.
- The App Store Connect leaderboard ID exactly matches `GameCenterLeaderboardID`.
- The Game Center capability remains enabled in Signing & Capabilities.
- A simulator/device signed into a sandbox Game Center account can authenticate, submit a score, reopen the leaderboard, and see Apple rows inside the custom UI.
