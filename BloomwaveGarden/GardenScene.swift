import CoreGraphics
import Foundation
import SpriteKit
import UIKit

private struct PaletteSpec {
  let name: String
  let color: SKColor
  let glow: SKColor
}

private enum FlowerType: Int {
  case amber = 0
  case teal = 1
  case gold = 2
}

private final class Bud {
  let id: Int
  let slot: CGPoint
  var type: FlowerType

  let root: SKNode
  let aura: SKSpriteNode
  let sprite: SKSpriteNode
  let bloom: SKSpriteNode
  let center: SKSpriteNode

  var flash: CGFloat = 0
  var wobble: CGFloat = 0
  let petalPhase: CGFloat
  private var hasSpriteTexture = false

  var usesSpriteTexture: Bool {
    hasSpriteTexture
  }

  init(id: Int, slot: CGPoint, type: FlowerType, palettes: [PaletteSpec], textures: [String: SKTexture]) {
    self.id = id
    self.slot = slot
    self.type = type
    self.root = SKNode()
    self.aura = SKSpriteNode(color: .white, size: CGSize(width: 12, height: 10))
    self.sprite = SKSpriteNode(color: .clear, size: CGSize(width: 16, height: 16))
    self.bloom = SKSpriteNode(color: .white, size: CGSize(width: 8, height: 8))
    self.center = SKSpriteNode(color: .white, size: CGSize(width: 3, height: 3))
    self.petalPhase = CGFloat.random(in: 0...(CGFloat.pi * 2))

    root.position = slot

    let stem = SKSpriteNode(color: SKColor(hex: 0x3f6b3f), size: CGSize(width: 2, height: 7))
    stem.position = CGPoint(x: 0, y: -5)
    stem.zPosition = 1

    aura.position = CGPoint(x: 0, y: 0)
    aura.alpha = 0.2
    aura.zPosition = 2

    sprite.position = CGPoint(x: 0, y: 0)
    sprite.zPosition = 3

    bloom.position = CGPoint(x: 0, y: 0)
    bloom.zPosition = 3

    center.position = CGPoint(x: 0, y: 0)
    center.zPosition = 4

    root.addChild(stem)
    root.addChild(aura)
    root.addChild(sprite)
    root.addChild(bloom)
    root.addChild(center)

    applyVisual(palettes: palettes, textures: textures)
  }

  func applyVisual(palettes: [PaletteSpec], textures: [String: SKTexture]) {
    let textureName: String
    switch type {
    case .amber:
      textureName = "flower-amber"
      bloom.color = palettes[0].color
      center.color = SKColor(hex: 0xfff1ce)
      aura.color = palettes[0].glow
    case .teal:
      textureName = "flower-teal"
      bloom.color = palettes[1].color
      center.color = SKColor(hex: 0xdcfff9)
      aura.color = palettes[1].glow
    case .gold:
      textureName = "flower-gold"
      bloom.color = SKColor(hex: 0xffd768)
      center.color = SKColor(hex: 0xfff8d2)
      aura.color = SKColor(hex: 0xffefb5)
    }

    if let texture = textures[textureName] {
      hasSpriteTexture = true
      sprite.texture = texture
      sprite.size = CGSize(width: 16, height: 16)
      sprite.colorBlendFactor = 0
      sprite.alpha = 1
      bloom.alpha = 0
      center.alpha = 0
      return
    }

    hasSpriteTexture = false
    sprite.texture = nil
    sprite.alpha = 0
    bloom.alpha = 1
    center.alpha = 1
  }
}

final class GardenScene: SKScene {
  private let worldW: CGFloat = 320
  private let worldH: CGFloat = 180

  private let maxBuds = 34
  private let minBurstInterval: TimeInterval = 0.24
  private let blockedSpamPenalty: TimeInterval = 0.18
  private let flowerGrowthRate: Double = 0.72
  private let blueFlowerRatio: Double = 0.2
  private let packedFieldRatio: Double = 0.95
  private let packedLightningBonus: Int = 6

  private let palettes: [PaletteSpec] = [
    PaletteSpec(name: "Amber", color: SKColor(hex: 0xf7be68), glow: SKColor(hex: 0xffe5a6)),
    PaletteSpec(name: "Teal", color: SKColor(hex: 0x5fd6ca), glow: SKColor(hex: 0xb7f5ee)),
  ]

  private lazy var bedSlots: [CGPoint] = {
    rawBedSlots.map { CGPoint(x: $0.x - (worldW * 0.5), y: (worldH * 0.5) - $0.y) }
  }()

  private let rawBedSlots: [CGPoint] = [
    CGPoint(x: 34, y: 38), CGPoint(x: 56, y: 30), CGPoint(x: 78, y: 41), CGPoint(x: 102, y: 35),
    CGPoint(x: 126, y: 43), CGPoint(x: 150, y: 33), CGPoint(x: 174, y: 41), CGPoint(x: 196, y: 34),
    CGPoint(x: 222, y: 42), CGPoint(x: 246, y: 32), CGPoint(x: 272, y: 41), CGPoint(x: 294, y: 33),
    CGPoint(x: 30, y: 74), CGPoint(x: 54, y: 66), CGPoint(x: 80, y: 76), CGPoint(x: 104, y: 68),
    CGPoint(x: 130, y: 75), CGPoint(x: 156, y: 67), CGPoint(x: 182, y: 76), CGPoint(x: 208, y: 68),
    CGPoint(x: 232, y: 75), CGPoint(x: 258, y: 66), CGPoint(x: 286, y: 74),
    CGPoint(x: 34, y: 108), CGPoint(x: 58, y: 98), CGPoint(x: 86, y: 109), CGPoint(x: 112, y: 99),
    CGPoint(x: 140, y: 109), CGPoint(x: 166, y: 99), CGPoint(x: 194, y: 108), CGPoint(x: 220, y: 99),
    CGPoint(x: 248, y: 109), CGPoint(x: 274, y: 98),
    CGPoint(x: 32, y: 142), CGPoint(x: 58, y: 152), CGPoint(x: 84, y: 141), CGPoint(x: 110, y: 150),
    CGPoint(x: 138, y: 141), CGPoint(x: 164, y: 152), CGPoint(x: 192, y: 142), CGPoint(x: 218, y: 150),
    CGPoint(x: 246, y: 141), CGPoint(x: 272, y: 151), CGPoint(x: 296, y: 142),
  ]

  private let backgroundLayer = SKNode()
  private let bedLayer = SKNode()
  private let flowerLayer = SKNode()
  private let effectLayer = SKNode()
  private var textures: [String: SKTexture] = [:]

  private weak var hud: GameHUDModel?
  private let audio = LofiAudioEngine.shared

  private var running = false
  private var elapsedTime: TimeInterval = 0
  private var score = 0
  private var harvestProgress = 0
  private var harvestGoal = 12
  private var crates = 0
  private var combo = 0
  private var bestCombo = 0
  private var nextPalette = 0
  private var frenzyTimer: TimeInterval = 0

  private var spawnTimer: TimeInterval = 0.48
  private var seasonTimer: TimeInterval = Double.random(in: 10...15)

  private var buds: [Bud] = []
  private var nextBudID = 1

  private var statusText: String = "Tap to start."
  private var statusTimer: TimeInterval = 0

  private var lastUpdateTime: TimeInterval?
  private var lastBurstAt: TimeInterval = -.infinity
  private var lastBlockedTapAt: TimeInterval = -.infinity

  override init(size: CGSize) {
    super.init(size: CGSize(width: worldW, height: worldH))
    configureScene()
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    size = CGSize(width: worldW, height: worldH)
    configureScene()
  }

  private func configureScene() {
    scaleMode = .aspectFill
    anchorPoint = CGPoint(x: 0.5, y: 0.5)

    addChild(backgroundLayer)
    addChild(bedLayer)
    addChild(flowerLayer)
    addChild(effectLayer)

    backgroundLayer.zPosition = -20
    bedLayer.zPosition = -10
    flowerLayer.zPosition = 10
    effectLayer.zPosition = 40

    loadTextures()
    buildBackground()
    buildBedVisuals()
    softReset(showOverlay: true)
  }

  func attachHUD(_ hud: GameHUDModel) {
    self.hud = hud
    syncHUD()
  }

  func startNewSession() {
    startSession()
  }

  func toggleAudio() {
    _ = audio.primeOnGesture()
    if audio.started {
      audio.toggleMuted()
      if audio.muted {
        setStatus("Lofi muted.", seconds: 1.0)
      } else {
        setStatus("Lofi enabled. Test ping played.", seconds: 1.3)
      }
    } else {
      setStatus("Audio start failed. Check device output.", seconds: 1.8)
    }
    syncHUD()
  }

  override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
    guard let touch = touches.first else { return }
    let point = touch.location(in: self)

    _ = audio.primeOnGesture()

    if !running {
      startSession()
    }

    tryBurst(at: point, now: CACurrentMediaTime())
  }

  override func update(_ currentTime: TimeInterval) {
    guard let last = lastUpdateTime else {
      lastUpdateTime = currentTime
      return
    }

    let dt = max(0, min(0.05, currentTime - last))
    lastUpdateTime = currentTime
    elapsedTime += dt

    if statusTimer > 0 {
      statusTimer -= dt
      if statusTimer <= 0 {
        setPassiveStatus()
      }
    }

    updateBuds(dt: dt)

    if !running {
      syncHUD()
      return
    }

    if frenzyTimer > 0 {
      frenzyTimer -= dt
      if frenzyTimer <= 0 {
        setStatus("Frenzy ended.", seconds: 1)
      }
    }

    updateSpawn(dt: dt)

    seasonTimer -= dt
    if seasonTimer <= 0 {
      shiftGardenMood()
      seasonTimer = Double.random(in: 10...15)
    }

    syncHUD()
  }

  private func loadTextures() {
    let names = [
      "bed",
      "sprout-1",
      "sprout-2",
      "bloom-amber",
      "bloom-teal",
      "flower-amber",
      "flower-teal",
      "flower-gold",
      "spirit-amber",
      "spirit-teal",
    ]

    for name in names {
      let url = Bundle.main.url(forResource: name, withExtension: "png", subdirectory: "SpriteTextures")
        ?? Bundle.main.url(forResource: name, withExtension: "png")
      guard let imageURL = url, let image = UIImage(contentsOfFile: imageURL.path) else { continue }

      let texture = SKTexture(image: image)
      texture.filteringMode = .nearest
      textures[name] = texture
    }
  }

  private func buildBackground() {
    backgroundColor = SKColor(hex: 0x121c24)

    let skyTop = SKSpriteNode(color: SKColor(hex: 0x7aa9c3), size: CGSize(width: worldW, height: worldH * 0.5))
    skyTop.position = CGPoint(x: 0, y: worldH * 0.25)
    backgroundLayer.addChild(skyTop)

    let skyMid = SKSpriteNode(color: SKColor(hex: 0x9dc8db), size: CGSize(width: worldW, height: worldH * 0.2))
    skyMid.position = CGPoint(x: 0, y: worldH * 0.08)
    backgroundLayer.addChild(skyMid)

    let hillFar = SKShapeNode(rectOf: CGSize(width: worldW + 14, height: 34), cornerRadius: 8)
    hillFar.fillColor = SKColor(hex: 0x6b9f67)
    hillFar.strokeColor = .clear
    hillFar.position = CGPoint(x: 0, y: -18)
    backgroundLayer.addChild(hillFar)

    let hillNear = SKShapeNode(rectOf: CGSize(width: worldW + 8, height: 48), cornerRadius: 8)
    hillNear.fillColor = SKColor(hex: 0x5d8d53)
    hillNear.strokeColor = .clear
    hillNear.position = CGPoint(x: 0, y: -42)
    backgroundLayer.addChild(hillNear)

    let field = SKSpriteNode(color: SKColor(hex: 0x426e3f), size: CGSize(width: worldW, height: worldH * 0.55))
    field.position = CGPoint(x: 0, y: -worldH * 0.27)
    backgroundLayer.addChild(field)

    for index in 0..<18 {
      let stripe = SKSpriteNode(color: SKColor(hex: index % 2 == 0 ? 0x517f46 : 0x4a7440), size: CGSize(width: worldW, height: 3))
      stripe.position = CGPoint(x: 0, y: -26 - CGFloat(index * 6))
      stripe.alpha = 0.5
      backgroundLayer.addChild(stripe)
    }

    for i in 0..<13 {
      let post = SKSpriteNode(color: SKColor(hex: 0xe6d2a8), size: CGSize(width: 2, height: 10))
      post.position = CGPoint(x: -worldW * 0.5 + 10 + CGFloat(i) * 25, y: -6)
      post.alpha = 0.75
      backgroundLayer.addChild(post)
    }

    let rail = SKSpriteNode(color: SKColor(hex: 0xd7c08f), size: CGSize(width: worldW - 16, height: 2))
    rail.position = CGPoint(x: 0, y: -2)
    rail.alpha = 0.75
    backgroundLayer.addChild(rail)
  }

  private func buildBedVisuals() {
    for slot in bedSlots {
      if let bedTexture = textures["bed"] {
        let patch = SKSpriteNode(texture: bedTexture)
        patch.size = CGSize(width: 14, height: 8)
        patch.position = slot
        patch.zRotation = CGFloat.random(in: -0.08...0.08)
        patch.alpha = 0.95
        bedLayer.addChild(patch)
      } else {
        let patch = SKSpriteNode(color: SKColor(hex: 0x705539), size: CGSize(width: 14, height: 8))
        patch.position = slot
        patch.zRotation = CGFloat.random(in: -0.08...0.08)
        patch.alpha = 0.92
        bedLayer.addChild(patch)

        let top = SKSpriteNode(color: SKColor(hex: 0x87633f), size: CGSize(width: 12, height: 2))
        top.position = CGPoint(x: slot.x, y: slot.y + 2)
        top.alpha = 0.85
        bedLayer.addChild(top)
      }
    }
  }

  private func softReset(showOverlay: Bool) {
    running = false
    elapsedTime = 0
    score = 0
    harvestProgress = 0
    harvestGoal = 12
    crates = 0
    combo = 0
    bestCombo = 0
    nextPalette = 0
    frenzyTimer = 0
    spawnTimer = 0.48
    seasonTimer = Double.random(in: 10...15)

    statusText = "Tap to start."
    statusTimer = 0

    lastBurstAt = -.infinity
    lastBlockedTapAt = -.infinity

    buds.removeAll()
    flowerLayer.removeAllChildren()
    effectLayer.removeAllChildren()
    buildBeds()

    if showOverlay {
      hud?.overlayVisible = true
      hud?.overlayTitle = "Tap To Start"
      hud?.overlayText = "Burst flower clusters, chain arcs, and stack harvest crates."
    } else {
      hud?.overlayVisible = false
    }

    syncHUD()
  }

  private func startSession() {
    softReset(showOverlay: false)
    running = true
    setStatus("Session live. Burst clusters to stack combo.", seconds: 1.9)
  }

  private func setStatus(_ text: String, seconds: TimeInterval = 1.6) {
    statusText = text
    statusTimer = seconds
    hud?.status = text
  }

  private func setPassiveStatus() {
    statusText = "Harvest crates by chaining clean bursts."
    hud?.status = statusText
  }

  private func stage() -> Int {
    1 + (score / 80)
  }

  private func syncHUD() {
    guard let hud else { return }
    hud.score = score
    hud.harvest = "\(harvestProgress)/\(harvestGoal)"
    hud.crates = crates
    hud.combo = combo
    hud.phase = palettes[nextPalette].name
    hud.status = statusText
    hud.audioButtonTitle = audio.muted ? "Enable Lofi" : "Mute Lofi"
  }

  private func buildBeds() {
    let initialFillChance = clamp(0.22 * flowerGrowthRate, min: 0.06, max: 0.7)
    for slot in bedSlots {
      if Double.random(in: 0...1) < initialFillChance {
        createBud(at: slot, type: pickRegularFlowerType())
      }
    }
  }

  private func createBud(at slot: CGPoint, type: FlowerType) {
    guard buds.count < maxBuds else { return }

    let bud = Bud(id: nextBudID, slot: slot, type: type, palettes: palettes, textures: textures)
    nextBudID += 1

    bud.root.zPosition = 10 + ((worldH * 0.5) - slot.y) * 0.05
    flowerLayer.addChild(bud.root)
    buds.append(bud)
  }

  private func findOpenSlot() -> CGPoint? {
    let occupied = Set(buds.map { slotKey($0.slot) })
    for slot in bedSlots.shuffled() {
      if !occupied.contains(slotKey(slot)) {
        return slot
      }
    }
    return nil
  }

  private func slotKey(_ point: CGPoint) -> String {
    "\(Int(point.x.rounded())):\(Int(point.y.rounded()))"
  }

  private func spawnBud() {
    guard buds.count < maxBuds, let slot = findOpenSlot() else { return }

    let s = stage()
    let goldChance = clamp(0.05 + Double(s) * 0.01, min: 0.05, max: 0.15)
    let type: FlowerType = Double.random(in: 0...1) < goldChance ? .gold : pickRegularFlowerType()
    createBud(at: slot, type: type)
  }

  private func getFieldOccupancy() -> Double {
    Double(buds.count) / Double(maxBuds)
  }

  private func getRegularFlowerCounts() -> (amber: Int, teal: Int, total: Int) {
    var amber = 0
    var teal = 0

    for bud in buds {
      if bud.type == .amber { amber += 1 }
      if bud.type == .teal { teal += 1 }
    }

    return (amber: amber, teal: teal, total: amber + teal)
  }

  private func pickRegularFlowerType() -> FlowerType {
    let counts = getRegularFlowerCounts()
    if counts.total == 0 {
      return Double.random(in: 0...1) < blueFlowerRatio ? .teal : .amber
    }

    let currentBlueRatio = Double(counts.teal) / Double(counts.total)
    if currentBlueRatio > blueFlowerRatio {
      let overflow = currentBlueRatio - blueFlowerRatio
      let blueChance = clamp(blueFlowerRatio - overflow * 0.7, min: 0.04, max: blueFlowerRatio)
      return Double.random(in: 0...1) < blueChance ? .teal : .amber
    }

    let deficit = blueFlowerRatio - currentBlueRatio
    let blueChance = clamp(blueFlowerRatio + deficit * 0.6, min: blueFlowerRatio, max: 0.62)
    return Double.random(in: 0...1) < blueChance ? .teal : .amber
  }

  private func addHarvest(_ units: Int) {
    harvestProgress += units
    while harvestProgress >= harvestGoal {
      harvestProgress -= harvestGoal
      crates += 1
      score += 22
      harvestGoal = min(28, harvestGoal + 1)
      setStatus("Harvest crate packed x\(crates).", seconds: 1.35)
    }
  }

  private func triggerFrenzy() {
    frenzyTimer = max(frenzyTimer, 6.6)
    audio.frenzyTone()
    setStatus("Frenzy active x2 points.", seconds: 1.2)
  }

  private func tryBurst(at point: CGPoint, now: TimeInterval) {
    let elapsed = now - lastBurstAt
    if elapsed < minBurstInterval {
      if now - lastBlockedTapAt >= blockedSpamPenalty {
        lastBlockedTapAt = now
        combo = max(0, combo - 1)
        setStatus("Too fast. Pace your bursts.", seconds: 0.9)
      }
      return
    }

    lastBurstAt = now
    resolveTapBurst(at: point)
  }

  private func resolveTapBurst(at point: CGPoint) {
    let which = nextPalette
    let nowFrenzy = frenzyTimer > 0
    let radius: CGFloat = nowFrenzy ? 36 : 32

    addPulse(at: point, which: which, power: nowFrenzy ? 1.3 : 1)
    let xNorm = clamp((point.x + worldW * 0.5) / worldW, min: 0, max: 1)
    audio.pulseTone(which: which, xNorm: xNorm, frenzy: nowFrenzy)

    nextPalette = nextPalette == 0 ? 1 : 0

    var directHits = 0
    var offColorInBurst = 0
    var colorCoreHits = 0
    var harvestRegular = 0
    var harvestGold = 0
    var harvestArc = 0

    var matched: [(bud: Bud, dist: CGFloat)] = []
    var offColor: [(bud: Bud, dist: CGFloat)] = []

    for bud in buds {
      let dx = bud.root.position.x - point.x
      let dy = (bud.root.position.y - 3) - point.y
      let dist = hypot(dx, dy)
      if dist > radius { continue }

      if bud.type == .gold || bud.type.rawValue == which {
        matched.append((bud: bud, dist: dist))
      } else {
        offColor.append((bud: bud, dist: dist))
      }
    }

    var removeIDs = Set<Int>()
    var arcChainPoints: [CGPoint] = [point]

    for item in matched {
      let bud = item.bud
      removeIDs.insert(bud.id)
      directHits += 1

      if bud.type == .gold {
        score += nowFrenzy ? 38 : 22
        addHarvest(2)
        harvestGold += 1
        triggerFrenzy()
        spawnBreakBurst(at: bud.root.position + CGPoint(x: 0, y: -5), color: SKColor(hex: 0xffd875), power: 1.4)
        continue
      }

      colorCoreHits += 1
      combo += 1
      bestCombo = max(bestCombo, combo)

      let base = 4 + Int(Double(combo) * 0.4)
      score += nowFrenzy ? base * 2 : base
      addHarvest(1)
      harvestRegular += 1

      audio.hitTone(which: which, combo: combo)
      spawnBreakBurst(at: bud.root.position + CGPoint(x: 0, y: -5), color: palettes[which].glow, power: 1.05)

      if combo % 7 == 0 {
        setStatus("Combo x\(combo).", seconds: 1.1)
      }
    }

    offColorInBurst = offColor.count
    let zapCount = min(colorCoreHits / 2, offColor.count)
    if zapCount > 0 {
      offColor.sort { $0.dist < $1.dist }

      for i in 0..<zapCount {
        let target = offColor[i].bud
        removeIDs.insert(target.id)

        combo += 1
        bestCombo = max(bestCombo, combo)
        score += nowFrenzy ? 10 : 6
        addHarvest(1)
        harvestArc += 1

        let arcPoint = target.root.position + CGPoint(x: 0, y: -4)
        spawnLightning(from: point, to: arcPoint, color: palettes[which].glow)
        arcChainPoints.append(arcPoint)
        spawnBreakBurst(at: target.root.position + CGPoint(x: 0, y: -5), color: palettes[which].glow, power: 0.9)
      }
    }

    var expandedZaps = 0
    if colorCoreHits >= 2 {
      expandedZaps = runPackedLightningExpansion(which: which, nowFrenzy: nowFrenzy, removeIDs: &removeIDs, chainPoints: &arcChainPoints)
      harvestArc += expandedZaps
    }

    audio.harvestTone(which: which, regularCount: harvestRegular, goldCount: harvestGold, arcCount: harvestArc, frenzy: nowFrenzy)

    if zapCount > 0 || expandedZaps > 0 {
      audio.sparkTone()
      if expandedZaps > 0 {
        setStatus("Arc zap x\(zapCount) + storm x\(expandedZaps).", seconds: 1.12)
      } else {
        setStatus("Arc zap x\(zapCount).", seconds: 1.0)
      }
    }

    if offColorInBurst > 0 && zapCount == 0 {
      for item in offColor {
        item.bud.wobble = 0.48
        item.bud.flash = 0.55
      }
      combo = max(0, combo - 1)
      setStatus("Need 2 same-color hits to arc off-color.", seconds: 1.2)
    }

    removeBuds(withIDs: removeIDs)

    if directHits == 0 && offColorInBurst == 0 {
      combo = max(0, combo - 1)
      setStatus("Whiff. Aim for a cluster.", seconds: 1.0)
    }

    if directHits >= 4 {
      addPulse(at: point + CGPoint(x: CGFloat.random(in: -5...5), y: CGFloat.random(in: -5...5)), which: which, power: 0.75, alpha: 0.65)
      if Double.random(in: 0...1) < 0.34 {
        spawnBud()
      }
    }

    syncHUD()
  }

  private func runPackedLightningExpansion(which: Int, nowFrenzy: Bool, removeIDs: inout Set<Int>, chainPoints: inout [CGPoint]) -> Int {
    let occupancy = getFieldOccupancy()
    if occupancy < packedFieldRatio || chainPoints.isEmpty {
      return 0
    }

    var remaining = buds.filter { bud in
      bud.type != .gold && bud.type.rawValue != which && !removeIDs.contains(bud.id)
    }
    if remaining.isEmpty { return 0 }

    let packedStrength = clamp((occupancy - packedFieldRatio) / (1 - packedFieldRatio), min: 0, max: 1)
    var budget = packedLightningBonus + Int(floor(packedStrength * 4))
    budget = min(budget, remaining.count)

    var expanded = 0

    while budget > 0, !remaining.isEmpty {
      var bestBudIndex: Int?
      var bestPointIndex: Int?
      var bestDistSq = CGFloat.greatestFiniteMagnitude

      for i in remaining.indices {
        let target = remaining[i].root.position + CGPoint(x: 0, y: -4)
        for j in chainPoints.indices {
          let from = chainPoints[j]
          let dx = target.x - from.x
          let dy = target.y - from.y
          let distSq = dx * dx + dy * dy
          if distSq < bestDistSq {
            bestDistSq = distSq
            bestBudIndex = i
            bestPointIndex = j
          }
        }
      }

      guard let budIndex = bestBudIndex, let pointIndex = bestPointIndex else { break }

      let targetBud = remaining.remove(at: budIndex)
      let from = chainPoints[pointIndex]
      let to = targetBud.root.position + CGPoint(x: 0, y: -4)

      removeIDs.insert(targetBud.id)
      chainPoints.append(to)

      combo += 1
      bestCombo = max(bestCombo, combo)
      score += nowFrenzy ? 12 : 8
      addHarvest(1)

      spawnLightning(from: from, to: to, color: palettes[which].glow)
      spawnBreakBurst(at: targetBud.root.position + CGPoint(x: 0, y: -5), color: palettes[which].glow, power: 1.12)

      expanded += 1
      budget -= 1
    }

    return expanded
  }

  private func removeBuds(withIDs ids: Set<Int>) {
    guard !ids.isEmpty else { return }

    for bud in buds where ids.contains(bud.id) {
      let vanish = SKAction.group([
        SKAction.scale(to: 0.05, duration: 0.12),
        SKAction.fadeOut(withDuration: 0.12),
      ])
      bud.root.run(.sequence([vanish, .removeFromParent()]))
    }

    buds.removeAll { ids.contains($0.id) }
  }

  private func updateSpawn(dt: TimeInterval) {
    let growthRate = clamp(flowerGrowthRate, min: 0.25, max: 3)
    let s = stage()
    let occupancy = getFieldOccupancy()
    let baseIntensity = (Double(combo) * 0.018) + (Double(s) * 0.058)
    let intensity = clamp(baseIntensity * growthRate, min: 0, max: 0.9)
    let occupancyBrake = clamp(1 - (occupancy * 0.62), min: 0.22, max: 1)

    spawnTimer -= dt
    if spawnTimer <= 0 {
      if Double.random(in: 0...1) < occupancyBrake {
        spawnBud()
      }

      if Double.random(in: 0...1) < intensity * occupancyBrake * 0.62 {
        spawnBud()
      }

      let lowFieldBoost = occupancy < 0.55 ? (0.34 + intensity * 0.25) : 0
      if lowFieldBoost > 0, Double.random(in: 0...1) < lowFieldBoost {
        spawnBud()
      }

      let occupancyDelay = 1 + (occupancy * 1.05)
      let base = clamp((0.98 - intensity) / growthRate, min: 0.3, max: 2.2)
      let jitter = clamp((0.44 / growthRate) * (0.8 + occupancy * 0.5), min: 0.12, max: 1.4)
      spawnTimer = Double.random(in: (base * occupancyDelay)...((base * occupancyDelay) + jitter))
    }
  }

  private func updateBuds(dt: TimeInterval) {
    for bud in buds {
      bud.flash = max(0, bud.flash - CGFloat(dt * 2.4))
      bud.wobble = max(0, bud.wobble - CGFloat(dt * 3.1))

      let baseBob = sin(CGFloat(elapsedTime) * 5.8 + bud.petalPhase) * 0.6
      let wobbleOffset = sin(CGFloat(elapsedTime) * 6.4 + bud.petalPhase) * bud.wobble * 3
      bud.root.position = CGPoint(x: bud.slot.x + wobbleOffset, y: bud.slot.y + baseBob)
      bud.root.zRotation = sin(CGFloat(elapsedTime) * 7.1 + bud.petalPhase) * bud.wobble * 0.08

      let auraBase = 0.16 + (sin(CGFloat(elapsedTime) * 6 + bud.petalPhase) + 1) * 0.04
      bud.aura.alpha = clamp(auraBase + bud.flash * 0.32, min: 0.08, max: 0.48)

      if bud.flash > 0 {
        let mix = clamp(bud.flash * 0.65, min: 0, max: 0.65)
        if bud.usesSpriteTexture {
          bud.sprite.color = .white
          bud.sprite.colorBlendFactor = mix * 0.45
        } else {
          bud.bloom.color = bud.bloom.color.mixed(with: .white, ratio: mix)
        }
      } else {
        bud.applyVisual(palettes: palettes, textures: textures)
      }
    }
  }

  private func shiftGardenMood() {
    let regular = buds.filter { $0.type != .gold }
    if regular.isEmpty {
      setStatus("Garden breeze passed through.", seconds: 1.0)
      return
    }

    let amber = regular.filter { $0.type == .amber }
    let teal = regular.filter { $0.type == .teal }
    let targetBlue = Int(round(Double(regular.count) * blueFlowerRatio))

    var fromPool: [Bud] = []
    var nextType: FlowerType = .amber

    if teal.count > targetBlue {
      fromPool = teal
      nextType = .amber
    } else if teal.count < targetBlue {
      fromPool = amber
      nextType = .teal
    }

    let swing = max(1, Int(floor(Double(regular.count) * 0.16)))
    let needed = abs(teal.count - targetBlue)
    let swaps = min(swing, needed, fromPool.count)

    if swaps > 0 {
      for bud in fromPool.shuffled().prefix(swaps) {
        bud.type = nextType
        bud.applyVisual(palettes: palettes, textures: textures)
        bud.flash = max(bud.flash, 0.4)
        bud.wobble = max(bud.wobble, 0.2)
      }

      if nextType == .amber {
        setStatus("Warm drift calmed blue blooms.", seconds: 1.2)
      } else {
        setStatus("Cool mist stirred new blue blooms.", seconds: 1.2)
      }
      return
    }

    setStatus("Garden mood held steady.", seconds: 1.0)
  }

  private func addPulse(at point: CGPoint, which: Int, power: CGFloat, alpha: CGFloat = 1) {
    let ring = SKShapeNode(circleOfRadius: 2)
    ring.position = point
    ring.lineWidth = 1
    ring.strokeColor = palettes[which].color
    ring.fillColor = .clear
    ring.alpha = 0.9 * alpha
    ring.zPosition = 42

    let maxScale = (30 + power * 10) / 2
    let life = 0.42 + Double(power * 0.1)

    let grow = SKAction.scale(to: maxScale, duration: life)
    let fade = SKAction.fadeOut(withDuration: life)
    ring.run(.sequence([.group([grow, fade]), .removeFromParent()]))
    effectLayer.addChild(ring)

    let outer = SKShapeNode(circleOfRadius: 3)
    outer.position = point
    outer.lineWidth = 1
    outer.strokeColor = palettes[which].glow
    outer.fillColor = .clear
    outer.alpha = 0.45 * alpha
    outer.zPosition = 41
    let growOuter = SKAction.scale(to: maxScale + 0.8, duration: life)
    let fadeOuter = SKAction.fadeOut(withDuration: life)
    outer.run(.sequence([.group([growOuter, fadeOuter]), .removeFromParent()]))
    effectLayer.addChild(outer)
  }

  private func spawnBreakBurst(at point: CGPoint, color: SKColor, power: CGFloat) {
    let ring = SKShapeNode(circleOfRadius: 4)
    ring.position = point
    ring.lineWidth = 1
    ring.strokeColor = color
    ring.fillColor = .clear
    ring.alpha = 0.7
    ring.zPosition = 44

    let life = 0.34 + Double(power * 0.06)
    let radiusScale = (4 + (10 * power)) / 4
    ring.run(.sequence([
      .group([
        .scale(to: radiusScale, duration: life),
        .fadeOut(withDuration: life),
      ]),
      .removeFromParent(),
    ]))
    effectLayer.addChild(ring)

    let particleCount = Int(round(12 * power))
    for _ in 0..<particleCount {
      let p = SKSpriteNode(color: color, size: CGSize(width: Bool.random() ? 1 : 2, height: Bool.random() ? 1 : 2))
      p.position = point
      p.zPosition = 43
      effectLayer.addChild(p)

      let dx = CGFloat.random(in: -18...18) * power
      let dy = CGFloat.random(in: -18...18) * power
      let fade = SKAction.fadeOut(withDuration: 0.34)
      let move = SKAction.moveBy(x: dx, y: dy, duration: 0.34)
      p.run(.sequence([.group([move, fade]), .removeFromParent()]))
    }
  }

  private func spawnLightning(from start: CGPoint, to end: CGPoint, color: SKColor) {
    let path = CGMutablePath()
    path.move(to: start)

    let segments = 5
    let dx = end.x - start.x
    let dy = end.y - start.y

    for i in 1..<segments {
      let t = CGFloat(i) / CGFloat(segments)
      let px = start.x + dx * t
      let py = start.y + dy * t
      let normal = CGPoint(x: -dy, y: dx).normalized
      let jitter = CGFloat.random(in: -2.4...2.4)
      path.addLine(to: CGPoint(x: px + normal.x * jitter, y: py + normal.y * jitter))
    }

    path.addLine(to: end)

    let bolt = SKShapeNode(path: path)
    bolt.strokeColor = color
    bolt.lineWidth = 1
    bolt.alpha = 0.95
    bolt.zPosition = 46

    let glow = SKShapeNode(path: path)
    glow.strokeColor = .white
    glow.lineWidth = 1
    glow.alpha = 0.45
    glow.zPosition = 45

    let fade = SKAction.fadeOut(withDuration: 0.16)
    let glowFade = SKAction.fadeOut(withDuration: 0.16)
    bolt.run(.sequence([fade, .removeFromParent()]))
    glow.run(.sequence([glowFade, .removeFromParent()]))

    effectLayer.addChild(bolt)
    effectLayer.addChild(glow)
  }
}

private extension CGPoint {
  static func +(lhs: CGPoint, rhs: CGPoint) -> CGPoint {
    CGPoint(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
  }

  var normalized: CGPoint {
    let len = sqrt((x * x) + (y * y))
    guard len > 0.0001 else { return .zero }
    return CGPoint(x: x / len, y: y / len)
  }
}

private extension SKColor {
  convenience init(hex: UInt32) {
    let r = CGFloat((hex >> 16) & 0xff) / 255
    let g = CGFloat((hex >> 8) & 0xff) / 255
    let b = CGFloat(hex & 0xff) / 255
    self.init(red: r, green: g, blue: b, alpha: 1)
  }

  func mixed(with other: SKColor, ratio: CGFloat) -> SKColor {
    var r1: CGFloat = 0
    var g1: CGFloat = 0
    var b1: CGFloat = 0
    var a1: CGFloat = 0
    var r2: CGFloat = 0
    var g2: CGFloat = 0
    var b2: CGFloat = 0
    var a2: CGFloat = 0
    getRed(&r1, green: &g1, blue: &b1, alpha: &a1)
    other.getRed(&r2, green: &g2, blue: &b2, alpha: &a2)

    let t = max(0, min(1, ratio))
    return SKColor(
      red: r1 + (r2 - r1) * t,
      green: g1 + (g2 - g1) * t,
      blue: b1 + (b2 - b1) * t,
      alpha: a1 + (a2 - a1) * t
    )
  }
}

private func clamp<T: Comparable>(_ value: T, min lower: T, max upper: T) -> T {
  Swift.max(lower, Swift.min(upper, value))
}
