import Foundation
import OSLog

enum SupabaseAnalyticsConfig {
  private static let userIDDefaultsKey = "BloomwaveAnalyticsUserID"
  private static let appVersionFallback = "0.0.0"

  static let platform = "ios"

  static var isEnabled: Bool {
    AppFeatures.supabaseAnalyticsEnabled
  }

  static var isConfigured: Bool {
    isEnabled && endpointURL != nil && !anonKey.isEmpty
  }

  static var anonKey: String {
    AppFeatures.supabaseAnonKey
  }

  static var endpointURL: URL? {
    let trimmed = AppFeatures.supabaseURL.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty, var components = URLComponents(string: trimmed) else { return nil }
    let path = components.path.hasSuffix("/") ? components.path : "\(components.path)/"
    components.path = "\(path)rest/v1/rpc/track_analytics_events"
    return components.url
  }

  static var appVersion: String {
    let version = (Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    return version.isEmpty ? appVersionFallback : version
  }

  static var buildNumber: String {
    (Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String)?
      .trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
  }

  static var installUserID: String {
    let defaults = UserDefaults.standard
    if let existingID = defaults.string(forKey: userIDDefaultsKey)?.trimmingCharacters(in: .whitespacesAndNewlines),
       !existingID.isEmpty {
      return existingID
    }

    let newID = UUID().uuidString.lowercased()
    defaults.set(newID, forKey: userIDDefaultsKey)
    return newID
  }

  static var bootstrapPayload: [String: Any] {
    [
      "enabled": isEnabled,
      "configured": isConfigured,
      "userID": installUserID,
      "appVersion": appVersion,
      "buildNumber": buildNumber,
      "platform": platform,
    ]
  }
}

actor SupabaseAnalyticsService {
  static let shared = SupabaseAnalyticsService()

  private static let logger = Logger(
    subsystem: Bundle.main.bundleIdentifier ?? "BloomwaveGarden",
    category: "SupabaseAnalytics"
  )

  private let pendingEventsDefaultsKey = "BloomwaveAnalyticsPendingEvents"
  private let maxPendingEvents = 1500
  private let maxBatchSize = 50
  private let immediateFlushEventNames: Set<String> = [
    "first_open",
    "session_start",
    "session_end",
    "settings_updated",
    "background_store_opened",
    "background_viewed",
    "background_equipped",
    "background_temp_unlocked",
    "ad_offer_shown",
    "ad_started",
    "ad_completed",
    "purchase_offer_shown",
    "purchase_started",
    "purchase_completed",
    "purchase_failed",
  ]

  private let session: URLSession
  private var flushTask: Task<Void, Never>?
  private var isFlushing = false

  private init(session: URLSession = .shared) {
    self.session = session
  }

  func track(payload: [String: Any]) {
    guard SupabaseAnalyticsConfig.isEnabled else { return }
    guard let eventPayload = normalizedPayload(from: payload) else { return }
    appendPendingEvent(eventPayload)
    if shouldFlushImmediately(eventPayload) {
      requestImmediateFlush()
    } else {
      scheduleFlush()
    }
  }

  func flush() async {
    guard SupabaseAnalyticsConfig.isConfigured else { return }
    guard !isFlushing else { return }

    isFlushing = true
    defer { isFlushing = false }

    while true {
      var pendingEvents = loadPendingEvents()
      guard !pendingEvents.isEmpty else { return }

      let batchCount = min(maxBatchSize, pendingEvents.count)
      let batch = Array(pendingEvents.prefix(batchCount))
      let didSendBatch = await sendBatch(batch)
      guard didSendBatch else { return }

      pendingEvents.removeFirst(batchCount)
      savePendingEvents(pendingEvents)
    }
  }

  private func scheduleFlush() {
    guard SupabaseAnalyticsConfig.isConfigured else { return }
    guard flushTask == nil else { return }

    flushTask = Task { [weak self] in
      try? await Task.sleep(nanoseconds: 1_500_000_000)
      await self?.flush()
      await self?.clearFlushTask()
    }
  }

  private func clearFlushTask() {
    flushTask = nil
  }

  private func requestImmediateFlush() {
    flushTask?.cancel()
    flushTask = nil

    Task { [weak self] in
      await self?.flush()
    }
  }

  private func normalizedPayload(from payload: [String: Any]) -> [String: Any]? {
    let eventName = sanitizedString(payload["event_name"])
    guard !eventName.isEmpty else {
      Self.log("Rejected analytics payload with empty event_name")
      return nil
    }

    let properties = sanitizedJSONObject(payload["properties"]) as? [String: Any] ?? [:]
    let timestamp = sanitizedString(payload["timestamp"]).isEmpty
      ? Self.iso8601Timestamp()
      : sanitizedString(payload["timestamp"])
    let sessionID = sanitizedString(payload["session_id"])

    guard !sessionID.isEmpty else {
      Self.log("Rejected analytics payload for event \(eventName) with empty session_id")
      return nil
    }

    var normalized: [String: Any] = [
      "user_id": sanitizedString(payload["user_id"]).isEmpty ? SupabaseAnalyticsConfig.installUserID : sanitizedString(payload["user_id"]),
      "session_id": sessionID,
      "timestamp": timestamp,
      "app_version": sanitizedString(payload["app_version"]).isEmpty ? SupabaseAnalyticsConfig.appVersion : sanitizedString(payload["app_version"]),
      "platform": sanitizedString(payload["platform"]).isEmpty ? SupabaseAnalyticsConfig.platform : sanitizedString(payload["platform"]),
      "event_name": eventName,
      "properties": properties.merging([
        "build_number": SupabaseAnalyticsConfig.buildNumber,
      ]) { current, _ in current },
    ]

    for key in [
      "background_id",
      "ownership_type",
      "placement",
      "ad_network",
      "product_id",
      "product_type",
    ] {
      let value = sanitizedString(payload[key])
      if !value.isEmpty {
        normalized[key] = value
      }
    }

    if let revenueUSD = sanitizedNumber(payload["revenue_usd"]) {
      normalized["revenue_usd"] = revenueUSD
    }

    if let priceUSD = sanitizedNumber(payload["price_usd"]) {
      normalized["price_usd"] = priceUSD
    }

    guard JSONSerialization.isValidJSONObject(normalized) else {
      Self.log("Rejected non-JSON analytics payload for event \(eventName)")
      return nil
    }

    return normalized
  }

  private func shouldFlushImmediately(_ event: [String: Any]) -> Bool {
    immediateFlushEventNames.contains(sanitizedString(event["event_name"]))
  }

  private func appendPendingEvent(_ event: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: event) else { return }
    var pendingEvents = UserDefaults.standard.array(forKey: pendingEventsDefaultsKey) as? [Data] ?? []
    pendingEvents.append(data)
    if pendingEvents.count > maxPendingEvents {
      pendingEvents.removeFirst(pendingEvents.count - maxPendingEvents)
    }
    UserDefaults.standard.set(pendingEvents, forKey: pendingEventsDefaultsKey)
  }

  private func loadPendingEvents() -> [[String: Any]] {
    let rawEvents = UserDefaults.standard.array(forKey: pendingEventsDefaultsKey) as? [Data] ?? []
    return rawEvents.compactMap { data in
      guard let object = try? JSONSerialization.jsonObject(with: data),
            let event = object as? [String: Any] else {
        return nil
      }
      return event
    }
  }

  private func savePendingEvents(_ events: [[String: Any]]) {
    let rawEvents = events.compactMap { try? JSONSerialization.data(withJSONObject: $0) }
    UserDefaults.standard.set(rawEvents, forKey: pendingEventsDefaultsKey)
  }

  private func sendBatch(_ batch: [[String: Any]]) async -> Bool {
    guard let endpointURL = SupabaseAnalyticsConfig.endpointURL else { return false }
    let rpcPayload = ["events": batch]
    guard JSONSerialization.isValidJSONObject(rpcPayload),
          let body = try? JSONSerialization.data(withJSONObject: rpcPayload) else {
      return false
    }

    var request = URLRequest(url: endpointURL)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("return=minimal", forHTTPHeaderField: "Prefer")
    request.setValue(SupabaseAnalyticsConfig.anonKey, forHTTPHeaderField: "apikey")
    request.setValue("Bearer \(SupabaseAnalyticsConfig.anonKey)", forHTTPHeaderField: "Authorization")
    request.httpBody = body

    do {
      let (_, response) = try await session.data(for: request)
      guard let httpResponse = response as? HTTPURLResponse else {
        Self.log("Supabase analytics request returned a non-HTTP response")
        return false
      }

      guard (200 ... 299).contains(httpResponse.statusCode) else {
        Self.log("Supabase analytics request failed with status \(httpResponse.statusCode)")
        return false
      }

      return true
    } catch {
      Self.log("Supabase analytics request failed: \(error.localizedDescription)")
      return false
    }
  }

  private func sanitizedString(_ value: Any?) -> String {
    guard let value else { return "" }
    if let stringValue = value as? String {
      return stringValue.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    if let numberValue = value as? NSNumber {
      return numberValue.stringValue
    }
    return ""
  }

  private func sanitizedNumber(_ value: Any?) -> Double? {
    if let doubleValue = value as? Double {
      return doubleValue
    }
    if let intValue = value as? Int {
      return Double(intValue)
    }
    if let numberValue = value as? NSNumber {
      return numberValue.doubleValue
    }
    if let stringValue = value as? String,
       let parsedValue = Double(stringValue) {
      return parsedValue
    }
    return nil
  }

  private func sanitizedJSONObject(_ value: Any?) -> Any? {
    switch value {
    case let stringValue as String:
      return stringValue
    case let numberValue as NSNumber:
      return numberValue
    case let dictionaryValue as [String: Any]:
      var sanitized: [String: Any] = [:]
      for (key, nestedValue) in dictionaryValue {
        if let sanitizedValue = sanitizedJSONObject(nestedValue) {
          sanitized[key] = sanitizedValue
        }
      }
      return sanitized
    case let arrayValue as [Any]:
      return arrayValue.compactMap { sanitizedJSONObject($0) }
    case is NSNull:
      return NSNull()
    default:
      return nil
    }
  }

  private static func iso8601Timestamp(for date: Date = Date()) -> String {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter.string(from: date)
  }

  private static func log(_ message: String) {
    logger.log("\(message, privacy: .public)")
    print("[Bloomwave][SupabaseAnalytics] \(message)")
  }
}
