import AVFoundation
import CoreGraphics
import Foundation
import QuartzCore

final class LofiAudioEngine {
  static let shared = LofiAudioEngine()

  private let playerPoolSize = 10
  private let unmutedOutputVolume: Float = 0.72
  private let defaultToneCooldown: CFTimeInterval = 0.08

  private var players: [AVAudioPlayer] = []
  private var nextPlayerIndex: Int = 0
  private var sessionConfigured = false
  private var didLogReadyState = false

  private(set) var started: Bool = false
  private(set) var muted: Bool = true
  private var didPlayUnlockTone: Bool = false
  private var lastDefaultToneAt: CFTimeInterval = -Double.greatestFiniteMagnitude

  private init() {}

  @discardableResult
  func ensureStarted() -> Bool {
    do {
      if !sessionConfigured {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try session.setActive(true)
        sessionConfigured = true
      }

      if players.isEmpty {
        try loadPlayerPool()
      }

      started = !players.isEmpty
      #if DEBUG
      if started, !didLogReadyState {
        print("LofiAudioEngine ready with \(players.count) pooled players")
        didLogReadyState = true
      }
      #endif
      return started
    } catch {
      print("LofiAudioEngine.ensureStarted error: \(error)")
      return false
    }
  }

  @discardableResult
  func primeOnGesture() -> Bool {
    guard ensureStarted() else { return false }

    if muted {
      setMuted(false)
    }

    if !didPlayUnlockTone {
      _ = playDefaultTone(force: true)
      didPlayUnlockTone = true
    }

    return true
  }

  func setMuted(_ nextMuted: Bool) {
    muted = nextMuted
    let volume = muted ? 0 : unmutedOutputVolume

    for player in players {
      player.volume = volume
      if muted, player.isPlaying {
        player.stop()
        player.currentTime = 0
      }
    }
  }

  func toggleMuted() {
    setMuted(!muted)
    if !muted {
      _ = playDefaultTone(force: true)
    }
  }

  func playUnlockTone() {
    _ = playDefaultTone(force: true)
  }

  @discardableResult
  private func playDefaultTone(force: Bool = false) -> Bool {
    guard ensureStarted(), !muted else { return false }

    let now = CACurrentMediaTime()
    if !force, (now - lastDefaultToneAt) < defaultToneCooldown {
      return false
    }

    guard playSample() else { return false }
    lastDefaultToneAt = now
    return true
  }

  func actionTone(
    which: Int,
    xNorm: CGFloat,
    hitCount: Int,
    regularCount: Int,
    goldCount: Int = 0,
    arcCount: Int = 0,
    zapCount: Int = 0,
    expandedZaps: Int = 0,
    frenzy: Bool = false,
    miss: Bool = false,
    blocked: Bool = false
  ) {
    _ = playDefaultTone()
  }

  func pulseTone(which: Int, xNorm: CGFloat, frenzy: Bool) {
    _ = playDefaultTone()
  }

  func hitTone(which: Int, combo: Int) {
    _ = playDefaultTone()
  }

  func sparkTone() {
    _ = playDefaultTone()
  }

  func frenzyTone() {
    _ = playDefaultTone()
  }

  func harvestTone(which: Int, regularCount: Int, goldCount: Int = 0, arcCount: Int = 0, frenzy: Bool = false) {
    let total = regularCount + goldCount + arcCount
    guard total > 0 else { return }
    _ = playDefaultTone()
  }

  private func loadPlayerPool() throws {
    guard let sampleURL = resolveUnlockToneURL() else {
      throw NSError(domain: "LofiAudioEngine", code: 404, userInfo: [NSLocalizedDescriptionKey: "unlock-tone.wav not found in app bundle"])
    }
    #if DEBUG
    print("LofiAudioEngine loading sample: \(sampleURL.path)")
    #endif

    var loaded: [AVAudioPlayer] = []
    loaded.reserveCapacity(playerPoolSize)

    for _ in 0..<playerPoolSize {
      let player = try AVAudioPlayer(contentsOf: sampleURL)
      player.numberOfLoops = 0
      player.volume = muted ? 0 : unmutedOutputVolume
      player.prepareToPlay()
      loaded.append(player)
    }

    players = loaded
    nextPlayerIndex = 0
  }

  private func resolveUnlockToneURL() -> URL? {
    let subdir = "WebBundle/assets/audio"
    if let url = Bundle.main.url(forResource: "unlock-tone", withExtension: "wav", subdirectory: subdir) {
      return url
    }

    if let bundleFolder = Bundle.main.url(forResource: "WebBundle", withExtension: nil) {
      let fallback = bundleFolder.appendingPathComponent("assets/audio/unlock-tone.wav")
      if FileManager.default.fileExists(atPath: fallback.path) {
        return fallback
      }
    }

    return nil
  }

  @discardableResult
  private func playSample() -> Bool {
    guard !players.isEmpty else { return false }

    var selected = nextPlayerIndex
    let start = nextPlayerIndex

    for step in 0..<players.count {
      let idx = (start + step) % players.count
      if !players[idx].isPlaying {
        selected = idx
        break
      }
    }

    let player = players[selected]
    if player.isPlaying {
      player.stop()
    }

    player.currentTime = 0
    player.volume = muted ? 0 : unmutedOutputVolume
    let ok = player.play()
    #if DEBUG
    if !ok {
      print("LofiAudioEngine failed to play sample on pooled player index \(selected)")
    }
    #endif
    nextPlayerIndex = (selected + 1) % players.count
    return ok
  }
}
