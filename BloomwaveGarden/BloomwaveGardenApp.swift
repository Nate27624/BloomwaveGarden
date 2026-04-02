import AVFAudio
import GameKit
import SwiftUI
import UIKit

@MainActor
final class GameCenterService: NSObject, GKGameCenterControllerDelegate {
  static let shared = GameCenterService()

  private var didConfigureAuthentication = false
  private var pendingLeaderboardPresentation = false
  private var pendingScoreSubmission = 0
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
        if let viewController, let presenter = Self.topViewController() {
          presenter.present(viewController, animated: true)
          return
        }

        let isAuthenticated = GKLocalPlayer.local.isAuthenticated
        GKAccessPoint.shared.isActive = isAuthenticated
        GKAccessPoint.shared.location = .topLeading
        GKAccessPoint.shared.showHighlights = true

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

  func submitProgressScore(_ score: Int) {
    authenticateLocalPlayerIfNeeded()
    guard score > 0 else { return }
    guard GKLocalPlayer.local.isAuthenticated else {
      pendingScoreSubmission = max(pendingScoreSubmission, score)
      return
    }

    submitScoreNow(score)
  }

  func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
    gameCenterViewController.dismiss(animated: true)
  }

  private func flushPendingActions() {
    if pendingScoreSubmission > 0 {
      let score = pendingScoreSubmission
      pendingScoreSubmission = 0
      submitScoreNow(score)
    }

    if pendingLeaderboardPresentation {
      pendingLeaderboardPresentation = false
      presentLeaderboardNow()
    }
  }

  private func submitScoreNow(_ score: Int) {
    guard let leaderboardID else { return }

    GKLeaderboard.submitScore(
      score,
      context: 0,
      player: GKLocalPlayer.local,
      leaderboardIDs: [leaderboardID]
    ) { _ in
      // Intentionally ignore transient Game Center failures.
    }
  }

  private func presentLeaderboardNow() {
    guard let presenter = Self.topViewController() else { return }

    let gameCenterVC = GKGameCenterViewController(state: .leaderboards)
    gameCenterVC.gameCenterDelegate = self
    if let leaderboardID {
      gameCenterVC.leaderboardIdentifier = leaderboardID
    }
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
    }
    return true
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
