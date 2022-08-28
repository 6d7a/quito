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

    @objc(createClient:options:resolve:reject:)
    func createClient(options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      do {
        let id = UUID().uuidString
        clients[id] = QuitoClient(withEmitter: 
          QuitoEventEmitter(withNativeEventEmitter: this, id), 
          MqttOptions(fromJsOptions: fromJsOptions),
          id
        )
        resolve(id)
      } catch error {
        reject(error)
      }
    }

    @objc(connect:clientRef:resolve:reject:)
    func connect(clientRef: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      do {
        clients[clientRef]?.connect(resolve, reject)
      } catch error {
        reject(error)
      }
    }
}
