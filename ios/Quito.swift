import Foundation

@objc(Quito)
class Quito: RCTEventEmitter {
    private var clients: [ String: QuitoClient ] = [:]

    override init() {
      super.init()
    }

    @objc open override func supportedEvents() -> [String] {
        return QuitoEvent.allCases.map() { $0.rawValue }
    }
}
