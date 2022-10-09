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

    @objc func createClient(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
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

    @objc func connect(_ clientRef: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      do {
          clients[clientRef]?.connect(resolve: resolve, reject: reject)
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }

    @objc func subscribe(_ topics: NSArray, clientRef clientRef: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      do {
          let topicArray = (NSMutableArray(array:topics) as! [NSDictionary]).map { MqttSubscription(fromJsSubscription: $0) }
          clients[clientRef]?.subscribe(topics: topicArray, resolve: resolve, reject: reject)
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }

    @objc func unsubscribe(_ topics: NSArray, clientRef clientRef: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      do {
          let topicArray = NSMutableArray(array: topics) as! [String]
          clients[clientRef]?.unsubscribe(topics: topicArray, resolve: resolve, reject: reject)
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }

    @objc func publish(_ topic: String, payloadBase64 payloadBase64: String, options options: NSDictionary, clientRef clientRef: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      do {
          clients[clientRef]?.publish(topic: topic, payloadBase64: payloadBase64, options: PublishOptions(fromJsPubOptions: options), resolve: resolve, reject: reject)
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }

    @objc func disconnect(_ clientRef: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      do {
          clients[clientRef]?.disconnect(resolve: resolve, reject: reject)
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }

    @objc func close(_ clientRef: String, force force: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      do {
          clients[clientRef]?.disconnect(resolve: resolve, reject: reject)
          clients[clientRef] = nil
      } catch {
          reject("", error.localizedDescription, nil)
      }
    }

    @objc func end(_ clientRef: String, force force: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      close(clientRef, force: force, resolver: resolve, rejecter: reject)
    }

    @objc func isConnected(_ clientRef: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      clients[clientRef]?.isConnected(resolve: resolve, reject: reject)
    }
}
