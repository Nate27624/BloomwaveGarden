import Foundation

final class GameHUDModel: ObservableObject {
  @Published var score: Int = 0
  @Published var harvest: String = "0/12"
  @Published var crates: Int = 0
  @Published var combo: Int = 0
  @Published var phase: String = "Amber"
  @Published var status: String = "Tap to start."

  @Published var overlayVisible: Bool = true
  @Published var overlayTitle: String = "Tap To Start"
  @Published var overlayText: String = "Burst flower clusters, chain arcs, and stack harvest crates."

  @Published var audioButtonTitle: String = "Enable Lofi"
}
