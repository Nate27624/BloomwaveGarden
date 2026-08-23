import SwiftUI
import UIKit
import WebKit
import QuartzCore
import GameKit

struct WebGameView: UIViewRepresentable {
  final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
    private var lastBridgeMessageAt: CFTimeInterval = CACurrentMediaTime()
    private var lastFallbackToneAt: CFTimeInterval = -Double.greatestFiniteMagnitude
    weak var webView: WKWebView?

    @objc func handleUserTap() {
      let nativeAudio = LofiAudioEngine.shared
      if !nativeAudio.started {
        _ = nativeAudio.ensureStarted()
      }
      if nativeAudio.muted {
        nativeAudio.setMuted(false)
      }

      let tapAt = CACurrentMediaTime()
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.22) { [weak self] in
        guard let self else { return }
        let elapsedSinceBridge = CACurrentMediaTime() - self.lastBridgeMessageAt
        let elapsedSinceTap = CACurrentMediaTime() - tapAt
        let elapsedSinceFallback = CACurrentMediaTime() - self.lastFallbackToneAt
        if elapsedSinceBridge > 0.22, elapsedSinceTap < 0.6, elapsedSinceFallback > 0.18 {
          self.lastFallbackToneAt = CACurrentMediaTime()
          nativeAudio.playUnlockTone()
        }
      }
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
      guard let payload = message.body as? [String: Any],
            let event = payload["event"] as? String else {
        return
      }

      switch message.name {
      case "nativeAudio":
        handleNativeAudio(event: event, payload: payload)
      case "nativeGameCenter":
        handleNativeGameCenter(event: event, payload: payload)
      default:
        break
      }
    }

    private func handleNativeGameCenter(event: String, payload: [String: Any]) {
      DispatchQueue.main.async {
        switch event {
        case "showLeaderboard":
          GameCenterService.shared.showLeaderboard()
        case "submitScore":
          let score = self.intValue(payload["score"])
          let crates = self.intValue(payload["crates"])
          GameCenterService.shared.submitProgressScore(score, crates: crates)
        case "loadLeaderboard":
          let limit = self.intValue(payload["limit"])
          GameCenterService.shared.loadLeaderboardEntries(limit: limit > 0 ? limit : 10) { entries in
            self.sendLeaderboardEntriesToWeb(entries)
          }
        default:
          break
        }
      }
    }

    private func sendLeaderboardEntriesToWeb(_ entries: [[String: Any]]) {
      let payload: [String: Any] = [
        "entries": entries,
        "localPlayerID": GKLocalPlayer.local.gamePlayerID,
        "available": !entries.isEmpty,
      ]

      guard JSONSerialization.isValidJSONObject(payload),
            let data = try? JSONSerialization.data(withJSONObject: payload),
            let json = String(data: data, encoding: .utf8) else {
        return
      }

      let script = "window.bloomwaveNativeGameCenter && window.bloomwaveNativeGameCenter.receiveLeaderboard(\(json));"
      webView?.evaluateJavaScript(script)
    }

    private func handleNativeAudio(event: String, payload: [String: Any]) {
      let webAudioState = stringValue(payload["webAudioState"])
      let nativeAudioOnly = boolValue(payload["nativeAudioOnly"])
      let which = intValue(payload["which"])
      let combo = intValue(payload["combo"])
      let hitCount = intValue(payload["hitCount"])
      let regularCount = intValue(payload["regularCount"])
      let goldCount = intValue(payload["goldCount"])
      let arcCount = intValue(payload["arcCount"])
      let zapCount = intValue(payload["zapCount"])
      let expandedZaps = intValue(payload["expandedZaps"])
      let frenzy = boolValue(payload["frenzy"])
      let miss = boolValue(payload["miss"])
      let blocked = boolValue(payload["blocked"])
      let xNorm = CGFloat(doubleValue(payload["xNorm"]))

      DispatchQueue.main.async {
        self.lastBridgeMessageAt = CACurrentMediaTime()
        let nativeAudio = LofiAudioEngine.shared

        if event == "gesture" {
          guard nativeAudioOnly || webAudioState != "running" else {
            return
          }
          if !nativeAudio.started {
            _ = nativeAudio.ensureStarted()
          }
          if nativeAudio.muted {
            nativeAudio.setMuted(false)
          }
          return
        }

        guard nativeAudioOnly || webAudioState != "running" else {
          return
        }

        if !nativeAudio.started {
          _ = nativeAudio.ensureStarted()
        }
        if nativeAudio.muted {
          nativeAudio.setMuted(false)
        }

        switch event {
        case "unlock":
          nativeAudio.playUnlockTone()
        case "action":
          nativeAudio.actionTone(
            which: which,
            xNorm: xNorm,
            hitCount: hitCount,
            regularCount: regularCount,
            goldCount: goldCount,
            arcCount: arcCount,
            zapCount: zapCount,
            expandedZaps: expandedZaps,
            frenzy: frenzy,
            miss: miss,
            blocked: blocked
          )
        case "pulse":
          nativeAudio.pulseTone(which: which, xNorm: xNorm, frenzy: frenzy)
        case "hit":
          nativeAudio.hitTone(which: which, combo: combo)
        case "spark":
          nativeAudio.sparkTone()
        case "frenzy":
          nativeAudio.frenzyTone()
        case "harvest":
          nativeAudio.harvestTone(
            which: which,
            regularCount: regularCount,
            goldCount: goldCount,
            arcCount: arcCount,
            frenzy: frenzy
          )
        default:
          break
        }
      }
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
      webView.reload()
    }

    private func intValue(_ value: Any?) -> Int {
      if let intValue = value as? Int { return intValue }
      if let doubleValue = value as? Double { return Int(doubleValue) }
      if let stringValue = value as? String, let parsed = Int(stringValue) { return parsed }
      return 0
    }

    private func boolValue(_ value: Any?) -> Bool {
      if let boolValue = value as? Bool { return boolValue }
      if let intValue = value as? Int { return intValue != 0 }
      if let stringValue = value as? String {
        return stringValue == "true" || stringValue == "1"
      }
      return false
    }

    private func doubleValue(_ value: Any?) -> Double {
      if let doubleValue = value as? Double { return doubleValue }
      if let intValue = value as? Int { return Double(intValue) }
      if let stringValue = value as? String, let parsed = Double(stringValue) { return parsed }
      return 0
    }

    private func stringValue(_ value: Any?) -> String {
      if let stringValue = value as? String { return stringValue }
      return ""
    }
  }

  private let webAudioUnlockScript = """
  (() => {
    window.__BLOOM_NATIVE_AUDIO_ONLY = true;
  })();
  """

  private let interactionLockScript = """
  (() => {
    const block = (event) => event.preventDefault();
    const blockMultiTouch = (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    };

    document.addEventListener("selectstart", block, { passive: false });
    document.addEventListener("contextmenu", block, { passive: false });
    document.addEventListener("gesturestart", block, { passive: false });
    document.addEventListener("gesturechange", block, { passive: false });
    document.addEventListener("gestureend", block, { passive: false });
    document.addEventListener("touchmove", blockMultiTouch, { passive: false });
  })();
  """

  func makeCoordinator() -> Coordinator {
    Coordinator()
  }

  func makeUIView(context: Context) -> WKWebView {
    let config = WKWebViewConfiguration()
    config.allowsInlineMediaPlayback = true
    config.mediaTypesRequiringUserActionForPlayback = []

    let userContentController = WKUserContentController()
    let unlockScript = WKUserScript(
      source: webAudioUnlockScript,
      injectionTime: .atDocumentStart,
      forMainFrameOnly: true
    )
    let interactionScript = WKUserScript(
      source: interactionLockScript,
      injectionTime: .atDocumentStart,
      forMainFrameOnly: true
    )
    userContentController.addUserScript(unlockScript)
    userContentController.addUserScript(interactionScript)
    userContentController.add(context.coordinator, name: "nativeAudio")
    userContentController.add(context.coordinator, name: "nativeGameCenter")
    config.userContentController = userContentController

    let webView = WKWebView(frame: .zero, configuration: config)
    context.coordinator.webView = webView
    webView.navigationDelegate = context.coordinator
    webView.isOpaque = false
    webView.backgroundColor = .black
    webView.scrollView.backgroundColor = .black
    webView.scrollView.isScrollEnabled = false
    webView.scrollView.bounces = false
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    webView.scrollView.minimumZoomScale = 1
    webView.scrollView.maximumZoomScale = 1
    webView.scrollView.pinchGestureRecognizer?.isEnabled = false
    webView.scrollView.isMultipleTouchEnabled = false
    webView.allowsBackForwardNavigationGestures = false
    webView.allowsLinkPreview = false

    let tapRecognizer = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleUserTap))
    tapRecognizer.cancelsTouchesInView = false
    tapRecognizer.delaysTouchesBegan = false
    tapRecognizer.delaysTouchesEnded = false
    webView.addGestureRecognizer(tapRecognizer)

    loadGame(into: webView)
    return webView
  }

  func updateUIView(_ uiView: WKWebView, context: Context) {}

  private func loadGame(into webView: WKWebView) {
    if let bundleFolder = Bundle.main.url(forResource: "WebBundle", withExtension: nil) {
      let indexURL = bundleFolder.appendingPathComponent("index.html")
      webView.loadFileURL(indexURL, allowingReadAccessTo: bundleFolder)
      return
    }

    if let indexURL = Bundle.main.url(forResource: "index", withExtension: "html") {
      let readAccess = indexURL.deletingLastPathComponent()
      webView.loadFileURL(indexURL, allowingReadAccessTo: readAccess)
    }
  }
}
