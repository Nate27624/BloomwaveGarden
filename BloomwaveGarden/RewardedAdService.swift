import Foundation
import GoogleMobileAds
import OSLog
import UIKit

@MainActor
final class RewardedAdService: NSObject, FullScreenContentDelegate {
  static let shared = RewardedAdService()

  private static let debugRewardedTestAdUnitID = "ca-app-pub-3940256099942544/1712485313"
  private static let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "BloomwaveGarden", category: "RewardedAd")

  private let appID: String
  private let rewardedAdUnitID: String

  private var didConfigureSDK = false
  private var rewardedAd: RewardedAd?
  private var rewardedAdLoadTask: Task<(ad: RewardedAd?, errorSummary: String?), Never>?
  private var lastAdErrorSummary = ""
  private var retryTask: Task<Void, Never>?
  private var pendingReward: PendingReward?
  private var didEarnReward = false
  private var lastAdNetwork = ""
  private var lastPaidRevenueUSD: Double?
  private var lastPaidRevenueCurrencyCode = ""

  private struct PendingReward {
    let backdrop: String
    let placement: String
    let completion: ([String: Any]) -> Void
  }

  var isConfigured: Bool {
    !appID.isEmpty && !effectiveRewardedAdUnitID.isEmpty
  }

  var isAdReady: Bool {
    rewardedAd != nil
  }

  var isAdLoading: Bool {
    rewardedAdLoadTask != nil
  }

  private override init() {
    appID = Self.stringValue(forInfoDictionaryKey: "GADApplicationIdentifier")
    rewardedAdUnitID = Self.stringValue(forInfoDictionaryKey: "BloomwaveRewardedAdUnitID")
    super.init()
  }

  private var effectiveRewardedAdUnitID: String {
#if DEBUG
    return Self.debugRewardedTestAdUnitID
#else
    return rewardedAdUnitID
#endif
  }

  func configureIfNeeded() {
    guard isConfigured, !didConfigureSDK else { return }
    didConfigureSDK = true

    Self.log("Configuring rewarded ads with unit id: \(self.effectiveRewardedAdUnitID)")

    MobileAds.shared.requestConfiguration.setPublisherFirstPartyIDEnabled(false)
    MobileAds.shared.start()

    Task {
      await self.preloadAdIfNeeded()
    }
  }

  func currentStatusPayload() -> [String: Any] {
    var payload: [String: Any] = [
      "ready": isAdReady,
      "loading": isAdLoading,
      "configured": isConfigured,
    ]
    if !lastAdErrorSummary.isEmpty {
      payload["reason"] = lastAdErrorSummary
    }
    return payload
  }

  func refreshAvailability() {
    configureIfNeeded()
    Task {
      await self.preloadAdIfNeeded()
    }
  }

  func presentRewardedAd(backdrop: String, placement: String, completion: @escaping ([String: Any]) -> Void) {
    guard isConfigured else {
      Self.log("Rewarded ad requested but AdMob is not configured")
      completion([
        "status": "unavailable",
        "backdrop": backdrop,
        "placement": placement,
        "reason": "AdMob is not configured.",
      ])
      return
    }

    configureIfNeeded()
    Self.log("Rewarded ad requested for backdrop: \(backdrop)")

    Task {
      let result = await resolveRewardedAd()
      guard let rewardedAd = result.ad else {
        Self.log("Rewarded ad unavailable: \(result.errorSummary ?? "Unknown load error")")
        completion([
          "status": "unavailable",
          "backdrop": backdrop,
          "placement": placement,
          "reason": result.errorSummary ?? "Rewarded ad failed to load.",
        ])
        return
      }

      guard let presenter = Self.topViewController() else {
        Self.log("Rewarded ad unavailable: no presenter")
        completion([
          "status": "unavailable",
          "backdrop": backdrop,
          "placement": placement,
          "reason": "No active view controller was available to present the ad.",
        ])
        return
      }

      self.rewardedAd = nil
      self.lastAdErrorSummary = ""
      self.lastPaidRevenueUSD = nil
      self.lastPaidRevenueCurrencyCode = ""
      self.pendingReward = PendingReward(backdrop: backdrop, placement: placement, completion: completion)
      self.didEarnReward = false
      self.lastAdNetwork = Self.describeAdNetwork(for: rewardedAd)
      rewardedAd.fullScreenContentDelegate = self
      rewardedAd.paidEventHandler = { [weak self] adValue in
        Task { @MainActor in
          self?.lastPaidRevenueUSD = NSDecimalNumber(decimal: adValue.value.decimalValue).doubleValue / 1_000_000.0
          self?.lastPaidRevenueCurrencyCode = adValue.currencyCode
        }
      }
      Self.log("Presenting rewarded ad")
      rewardedAd.present(from: presenter) { [weak self] in
        self?.didEarnReward = true
        Self.log("Rewarded ad granted reward callback")
      }
    }
  }

  func adDidDismissFullScreenContent(_ ad: FullScreenPresentingAd) {
    Self.log("Rewarded ad dismissed. didEarnReward=\(self.didEarnReward)")
    finishPendingReward(status: didEarnReward ? "rewarded" : "dismissed")
    Task {
      await preloadAdIfNeeded()
    }
  }

  func ad(_ ad: FullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: any Error) {
    Self.log("Rewarded ad failed to present: \(Self.describeError(error))")
    finishPendingReward(
      status: "failed",
      reason: Self.describeError(error)
    )
    Task {
      await preloadAdIfNeeded()
    }
  }

  private func finishPendingReward(status: String, reason: String? = nil) {
    guard let pendingReward else { return }
    self.pendingReward = nil
    didEarnReward = false
    var payload: [String: Any] = [
      "status": status,
      "backdrop": pendingReward.backdrop,
      "placement": pendingReward.placement,
    ]
    if !lastAdNetwork.isEmpty {
      payload["adNetwork"] = lastAdNetwork
    }
    if let lastPaidRevenueUSD {
      payload["revenueUSD"] = lastPaidRevenueUSD
    }
    if !lastPaidRevenueCurrencyCode.isEmpty {
      payload["revenueCurrencyCode"] = lastPaidRevenueCurrencyCode
    }
    if let reason, !reason.isEmpty {
      payload["reason"] = reason
    }
    pendingReward.completion(payload)
  }

  private func preloadAdIfNeeded() async {
    _ = await resolveRewardedAd()
  }

  private func resolveRewardedAd() async -> (ad: RewardedAd?, errorSummary: String?) {
    guard isConfigured else { return (nil, "AdMob is not configured.") }
    if let rewardedAd {
      Self.log("Using cached rewarded ad")
      return (rewardedAd, nil)
    }
    if let rewardedAdLoadTask {
      Self.log("Waiting for in-flight rewarded ad load")
      return await rewardedAdLoadTask.value
    }

    let loadTask = Task<(ad: RewardedAd?, errorSummary: String?), Never> { [effectiveRewardedAdUnitID] in
      do {
        Self.log("Loading rewarded ad from AdMob")
        let loadedAd = try await RewardedAd.load(
          with: effectiveRewardedAdUnitID,
          request: Request()
        )
        Self.log("Rewarded ad loaded successfully")
        return (loadedAd, nil)
      } catch {
        let summary = Self.describeError(error)
        Self.log("Rewarded ad failed to load: \(summary)")
        return (nil, summary)
      }
    }
    rewardedAdLoadTask = loadTask

    let result = await loadTask.value
    rewardedAdLoadTask = nil

    if let loadedAd = result.ad {
      loadedAd.fullScreenContentDelegate = self
      lastAdNetwork = Self.describeAdNetwork(for: loadedAd)
      rewardedAd = loadedAd
      lastAdErrorSummary = ""
      return (loadedAd, nil)
    }

    rewardedAd = nil
    lastAdErrorSummary = result.errorSummary ?? "Rewarded ad failed to load."
    scheduleRetryIfNeeded()
    return result
  }

  private static func describeError(_ error: any Error) -> String {
    let nsError = error as NSError
    let description = nsError.localizedDescription.trimmingCharacters(in: .whitespacesAndNewlines)
    if description.isEmpty {
      return "\(nsError.domain) (\(nsError.code))"
    }
    return "\(description) [\(nsError.domain) \(nsError.code)]"
  }

  private static func log(_ message: String) {
    logger.log("\(message, privacy: .public)")
    print("[Bloomwave][RewardedAd] \(message)")
  }

  private static func describeAdNetwork(for rewardedAd: RewardedAd) -> String {
    let loadedNetwork = rewardedAd.responseInfo.loadedAdNetworkResponseInfo?.adSourceName?
      .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    if !loadedNetwork.isEmpty {
      return loadedNetwork
    }
    return "admob"
  }

  private func scheduleRetryIfNeeded() {
    guard retryTask == nil else { return }
    retryTask = Task { @MainActor in
      try? await Task.sleep(nanoseconds: 15_000_000_000)
      self.retryTask = nil
      guard self.rewardedAd == nil else { return }
      await self.preloadAdIfNeeded()
    }
  }

  private static func stringValue(forInfoDictionaryKey key: String) -> String {
    let rawValue = Bundle.main.object(forInfoDictionaryKey: key) as? String ?? ""
    let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty || trimmed.hasPrefix("$(") {
      return ""
    }
    return trimmed
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
