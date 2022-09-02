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

    @objc(createClient:resolve:reject:)
    func createClient(options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      do {
        let id = UUID().uuidString
        clients[id] = QuitoClient(withEmitter: 
                                    QuitoEventEmitter(withNativeEventEmitter: self, clientRef: id),
                                  options: MqttOptions(fromJsOptions: options),
                                  clientRef: id
        )
        resolve(id)
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }

    @objc(connect:resolve:reject:)
    func connect(clientRef: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      do {
          clients[clientRef]?.connect(resolve: resolve, reject: reject)
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }
}
