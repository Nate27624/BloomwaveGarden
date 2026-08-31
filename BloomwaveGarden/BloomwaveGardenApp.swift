import AVFAudio
import GameKit
import StoreKit
import SwiftUI
import UIKit

enum AppFeatures {
  static let inAppPurchasesEnabled = boolValue(forInfoDictionaryKey: "BloomwaveInAppPurchasesEnabled", defaultValue: true)
  static let rewardedAdsEnabled = boolValue(forInfoDictionaryKey: "BloomwaveRewardedAdsEnabled", defaultValue: true)
  static let lifetimePassOnlyBackgroundStoreEnabled = boolValue(
    forInfoDictionaryKey: "BloomwaveLifetimePassOnlyBackgroundStoreEnabled",
    defaultValue: false
  )
  static let supabaseAnalyticsEnabled = boolValue(
    forInfoDictionaryKey: "BloomwaveSupabaseAnalyticsEnabled",
    defaultValue: false
  )
  static let supabaseURL = stringValue(forInfoDictionaryKey: "BloomwaveSupabaseURL")
  static let supabaseAnonKey = stringValue(forInfoDictionaryKey: "BloomwaveSupabaseAnonKey")

  private static func boolValue(forInfoDictionaryKey key: String, defaultValue: Bool) -> Bool {
    let rawValue = Bundle.main.object(forInfoDictionaryKey: key)
    if let boolValue = rawValue as? Bool {
      return boolValue
    }
    if let numberValue = rawValue as? NSNumber {
      return numberValue.boolValue
    }
    if let stringValue = rawValue as? String {
      switch stringValue.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() {
      case "1", "true", "yes":
        return true
      case "0", "false", "no":
        return false
      default:
        break
      }
    }
    return defaultValue
  }

  private static func stringValue(forInfoDictionaryKey key: String) -> String {
    let rawValue = Bundle.main.object(forInfoDictionaryKey: key) as? String ?? ""
    let trimmedValue = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmedValue.isEmpty || trimmedValue.hasPrefix("$(") {
      return ""
    }
    return trimmedValue
  }
}

@MainActor
final class GameCenterService: NSObject, @preconcurrency GKGameCenterControllerDelegate {
  static let shared = GameCenterService()

  private var didConfigureAuthentication = false
  private var pendingLeaderboardPresentation = false
  private var pendingScoreSubmission = 0
  private var pendingCrateContext = 0
  private var pendingLeaderboardLoads: [(limit: Int, completion: ([[String: Any]]) -> Void)] = []
  private let leaderboardID: String?

  private override init() {
    let configuredID = Bundle.main.object(forInfoDictionaryKey: "GameCenterLeaderboardID") as? String
    let trimmedID = configuredID?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    leaderboardID = trimmedID.isEmpty ? nil : trimmedID
    super.init()
  }

  func authenticateLocalPlayerIfNeeded() {
    guard !didConfigureAuthentication else { return }
    didConfigureAuthentication = true

    GKLocalPlayer.local.authenticateHandler = { viewController, _ in
      DispatchQueue.main.async {
        if UIApplication.shared.applicationState == .active,
           let viewController,
           let presenter = Self.topViewController() {
          presenter.present(viewController, animated: true)
          return
        }

        let isAuthenticated = GKLocalPlayer.local.isAuthenticated
        GKAccessPoint.shared.isActive = false
        GKAccessPoint.shared.showHighlights = false

        guard isAuthenticated else { return }
        self.flushPendingActions()
      }
    }
  }

  func showLeaderboard() {
    authenticateLocalPlayerIfNeeded()
    guard GKLocalPlayer.local.isAuthenticated else {
      pendingLeaderboardPresentation = true
      return
    }

    presentLeaderboardNow()
  }

  func submitProgressScore(_ score: Int, crates: Int) {
    authenticateLocalPlayerIfNeeded()
    guard score > 0 else { return }
    guard GKLocalPlayer.local.isAuthenticated else {
      if score >= pendingScoreSubmission {
        pendingScoreSubmission = score
        pendingCrateContext = max(0, crates)
      }
      return
    }

    submitScoreNow(score, crates: crates)
  }

  func loadLeaderboardEntries(limit: Int, completion: @escaping ([[String: Any]]) -> Void) {
    authenticateLocalPlayerIfNeeded()
    guard leaderboardID != nil else {
      completion([])
      return
    }
    guard GKLocalPlayer.local.isAuthenticated else {
      pendingLeaderboardLoads.append((max(1, limit), completion))
      return
    }

    loadLeaderboardEntriesNow(limit: limit, completion: completion)
  }

  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    gameCenterViewController.dismiss(animated: true)
  }

  private func flushPendingActions() {
    if pendingScoreSubmission > 0 {
      let score = pendingScoreSubmission
      let crates = pendingCrateContext
      pendingScoreSubmission = 0
      pendingCrateContext = 0
      submitScoreNow(score, crates: crates)
    }

    if pendingLeaderboardPresentation {
      pendingLeaderboardPresentation = false
      presentLeaderboardNow()
    }

    let loads = pendingLeaderboardLoads
    pendingLeaderboardLoads.removeAll()
    for load in loads {
      loadLeaderboardEntriesNow(limit: load.limit, completion: load.completion)
    }
  }

  private func submitScoreNow(_ score: Int, crates: Int) {
    guard let leaderboardID else { return }

    GKLeaderboard.submitScore(
      score,
      context: max(0, crates),
      player: GKLocalPlayer.local,
      leaderboardIDs: [leaderboardID]
    ) { _ in
      // Intentionally ignore transient Game Center failures.
    }
  }

  private func loadLeaderboardEntriesNow(limit: Int, completion: @escaping ([[String: Any]]) -> Void) {
    guard let leaderboardID else {
      completion([])
      return
    }
    let localPlayerID = GKLocalPlayer.local.gamePlayerID

    GKLeaderboard.loadLeaderboards(IDs: [leaderboardID]) { leaderboards, error in
      guard error == nil, let leaderboard = leaderboards?.first else {
        DispatchQueue.main.async { completion([]) }
        return
      }

      let entryLimit = max(1, min(limit, 100))
      leaderboard.loadEntries(
        for: .global,
        timeScope: .allTime,
        range: NSRange(location: 1, length: entryLimit)
      ) { localPlayerEntry, entries, _, error in
        let payload: [[String: Any]]
        if error == nil {
          var seenPlayerIDs = Set<String>()
          let orderedEntries = ([localPlayerEntry] + (entries ?? [])).compactMap { $0 }
          payload = orderedEntries.compactMap { entry in
            let playerID = entry.player.gamePlayerID
            guard seenPlayerIDs.insert(playerID).inserted else { return nil }
            return Self.payload(for: entry, localPlayerID: localPlayerID)
          }
        } else {
          payload = []
        }
        DispatchQueue.main.async {
          completion(payload)
        }
      }
    }
  }

  nonisolated private static func payload(for entry: GKLeaderboard.Entry, localPlayerID: String) -> [String: Any] {
    [
      "id": entry.player.gamePlayerID,
      "name": entry.player.displayName,
      "rank": entry.rank,
      "totalBlooms": entry.score,
      "totalCrates": max(0, entry.context),
      "isLocal": entry.player.gamePlayerID == localPlayerID,
    ]
  }

  private func presentLeaderboardNow() {
    guard UIApplication.shared.applicationState == .active else {
      pendingLeaderboardPresentation = true
      return
    }
    guard let presenter = Self.topViewController() else { return }
    guard !(presenter is GKGameCenterViewController) else { return }

    let gameCenterVC = leaderboardID.map {
      GKGameCenterViewController(leaderboardID: $0, playerScope: .global, timeScope: .allTime)
    } ?? GKGameCenterViewController(state: .leaderboards)
    gameCenterVC.gameCenterDelegate = self
    presenter.present(gameCenterVC, animated: true)
  }

  private static func topViewController(base: UIViewController? = nil) -> UIViewController? {
    let root: UIViewController?
    if let base {
      root = base
    } else {
      root = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap { $0.windows }
        .first(where: { $0.isKeyWindow })?
        .rootViewController
    }

    if let nav = root as? UINavigationController {
      return topViewController(base: nav.visibleViewController)
    }
    if let tab = root as? UITabBarController {
      return topViewController(base: tab.selectedViewController)
    }
    if let presented = root?.presentedViewController {
      return topViewController(base: presented)
    }
    return root
  }
}

@MainActor
final class PurchaseService {
  static let shared = PurchaseService()

  private let lifetimeProductID = "com.nate27624.bloomwavegarden.backgrounds.lifetime"
  private let individualBackgroundProductIDs: Set<String> = [
    "com.nate27624.bloomwavegarden.background.citylight",
    "com.nate27624.bloomwavegarden.background.moonlitfalls",
    "com.nate27624.bloomwavegarden.background.emberfield",
    "com.nate27624.bloomwavegarden.background.colorfield",
    "com.nate27624.bloomwavegarden.background.americanflag",
    "com.nate27624.bloomwavegarden.background.rosedunes",
    "com.nate27624.bloomwavegarden.background.frostmeadow",
    "com.nate27624.bloomwavegarden.background.azurereef",
  ]
  private var knownProductIDs: Set<String> {
    if AppFeatures.lifetimePassOnlyBackgroundStoreEnabled {
      return [lifetimeProductID]
    }
    return individualBackgroundProductIDs.union([lifetimeProductID])
  }

  private var productsByID: [String: Product] = [:]
  private var transactionUpdatesTask: Task<Void, Never>?

  private init() {}

  func startObservingTransactions() {
    guard transactionUpdatesTask == nil else { return }
    transactionUpdatesTask = Task { [weak self] in
      for await result in StoreKit.Transaction.updates {
        guard let self, let transaction = self.verifiedTransaction(from: result) else { continue }
        await transaction.finish()
      }
    }
  }

  func loadProducts(productIDs requestedIDs: [String], completion: @escaping ([String: Any]) -> Void) {
    Task {
      let productIDs = requestedIDs.isEmpty ? knownProductIDs : Set(requestedIDs).intersection(knownProductIDs)
      guard !productIDs.isEmpty else {
        completion(productsPayload(status: "empty", products: [], ownedProductIDs: await currentOwnedProductIDs()))
        return
      }

      do {
        let products = try await Product.products(for: Array(productIDs))
        for product in products {
          productsByID[product.id] = product
        }
        completion(productsPayload(status: "success", products: products, ownedProductIDs: await currentOwnedProductIDs()))
      } catch {
        completion([
          "status": "unavailable",
          "reason": error.localizedDescription,
          "products": [],
          "ownedProductIDs": await currentOwnedProductIDs(),
        ])
      }
    }
  }

  func purchase(productID: String, completion: @escaping ([String: Any]) -> Void) {
    Task {
      guard knownProductIDs.contains(productID) else {
        completion([
          "status": "unavailable",
          "productID": productID,
          "reason": "The requested product is not configured for this build.",
          "ownedProductIDs": await currentOwnedProductIDs(),
        ])
        return
      }

      do {
        let product = try await product(for: productID)
        guard let product else {
          completion([
            "status": "unavailable",
            "productID": productID,
            "reason": "StoreKit could not load this product on the device.",
            "ownedProductIDs": await currentOwnedProductIDs(),
          ])
          return
        }

        let result = try await product.purchase()
        switch result {
        case .success(let verification):
          guard let transaction = verifiedTransaction(from: verification) else {
            completion([
              "status": "unverified",
              "productID": productID,
              "reason": "StoreKit could not verify the transaction.",
              "ownedProductIDs": await currentOwnedProductIDs(),
            ])
            return
          }
          await transaction.finish()
          let owned = Set(await currentOwnedProductIDs()).union([productID])
          completion(["status": "success", "productID": productID, "ownedProductIDs": Array(owned)])
        case .userCancelled:
          completion([
            "status": "cancelled",
            "productID": productID,
            "reason": "The purchase was cancelled.",
            "ownedProductIDs": await currentOwnedProductIDs(),
          ])
        case .pending:
          completion([
            "status": "pending",
            "productID": productID,
            "reason": "The purchase is pending approval or confirmation.",
            "ownedProductIDs": await currentOwnedProductIDs(),
          ])
        @unknown default:
          completion([
            "status": "unknown",
            "productID": productID,
            "reason": "StoreKit returned an unknown purchase result.",
            "ownedProductIDs": await currentOwnedProductIDs(),
          ])
        }
      } catch {
        completion([
          "status": "failed",
          "productID": productID,
          "reason": error.localizedDescription,
          "ownedProductIDs": await currentOwnedProductIDs(),
        ])
      }
    }
  }

  func restorePurchases(completion: @escaping ([String: Any]) -> Void) {
    Task {
      do {
        try await AppStore.sync()
      } catch {
        completion([
          "status": "failed",
          "reason": error.localizedDescription,
          "ownedProductIDs": await currentOwnedProductIDs(),
        ])
        return
      }

      let owned = await currentOwnedProductIDs()
      completion(["status": owned.isEmpty ? "empty" : "restored", "ownedProductIDs": owned])
    }
  }

  func loadEntitlements(completion: @escaping ([String: Any]) -> Void) {
    Task {
      let owned = await currentOwnedProductIDs()
      completion(["status": owned.isEmpty ? "empty" : "restored", "ownedProductIDs": owned])
    }
  }

  private func product(for productID: String) async throws -> Product? {
    if let product = productsByID[productID] { return product }
    let products = try await Product.products(for: [productID])
    guard let product = products.first else { return nil }
    productsByID[product.id] = product
    return product
  }

  private func currentOwnedProductIDs() async -> [String] {
    var owned: [String] = []
    for await result in StoreKit.Transaction.currentEntitlements {
      guard let transaction = verifiedTransaction(from: result) else { continue }
      guard transaction.revocationDate == nil else { continue }
      if let expirationDate = transaction.expirationDate, expirationDate < Date() { continue }
      if knownProductIDs.contains(transaction.productID) {
        owned.append(transaction.productID)
      }
    }
    return Array(Set(owned)).sorted()
  }

  private func productsPayload(status: String, products: [Product], ownedProductIDs: [String]) -> [String: Any] {
    [
      "status": status,
      "products": products.map { product in
        [
          "id": product.id,
          "displayName": product.displayName,
          "displayPrice": product.displayPrice,
          "priceUSD": NSDecimalNumber(decimal: product.price).doubleValue,
          "currencyCode": product.priceFormatStyle.currencyCode,
        ]
      },
      "ownedProductIDs": ownedProductIDs,
    ]
  }

  private func verifiedTransaction(from result: VerificationResult<StoreKit.Transaction>) -> StoreKit.Transaction? {
    switch result {
    case .verified(let transaction):
      return transaction
    case .unverified:
      return nil
    }
  }
}

private final class AppDelegate: NSObject, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    do {
      let session = AVAudioSession.sharedInstance()
      try session.setCategory(.playback, mode: .default, options: [])
      try session.setActive(true)
    } catch {
      // WebAudio still works in most cases without this; keep app launch resilient.
    }
    Task { @MainActor in
      GameCenterService.shared.authenticateLocalPlayerIfNeeded()
      if AppFeatures.inAppPurchasesEnabled {
        PurchaseService.shared.startObservingTransactions()
      }
      if AppFeatures.rewardedAdsEnabled {
        RewardedAdService.shared.configureIfNeeded()
      }
      if AppFeatures.supabaseAnalyticsEnabled {
        await SupabaseAnalyticsService.shared.flush()
      }
    }
    return true
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    guard AppFeatures.supabaseAnalyticsEnabled else { return }
    Task {
      await SupabaseAnalyticsService.shared.flush()
    }
  }

  func applicationDidEnterBackground(_ application: UIApplication) {
    guard AppFeatures.supabaseAnalyticsEnabled else { return }
    Task {
      await SupabaseAnalyticsService.shared.flush()
    }
  }

  func applicationWillTerminate(_ application: UIApplication) {
    guard AppFeatures.supabaseAnalyticsEnabled else { return }
    Task {
      await SupabaseAnalyticsService.shared.flush()
    }
  }
}

@main
struct BloomwaveGardenApp: App {
  @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

  var body: some Scene {
    WindowGroup {
      ContentView()
    }
  }
}
