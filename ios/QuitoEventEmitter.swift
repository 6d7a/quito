import Foundation

class QuitoEventEmitter {
  private let nativeEventEmitter: RCTEventEmitter
  private let clientRef: String

  init(withNativeEventEmitter eventEmitter: RCTEventEmitter, clientRef: String) {
    self.nativeEventEmitter = eventEmitter
      self.clientRef = clientRef
  }

  func forwardException(e: Error) {
    let params: [String: Any] = [
        QuitoEventParam.ERR_CODE.rawValue: 0,
      QuitoEventParam.ERR_MESSAGE.rawValue: e.localizedDescription,
      QuitoEventParam.STACKTRACE.rawValue: ""
    ]
      self.nativeEventEmitter.sendEvent(withName: QuitoEvent.EXCEPTION.rawValue, body: params)
  }

  func sendEvent(event: QuitoEvent, params: NSMutableDictionary = [:]) {
      params.setValue(self.clientRef, forKey: QuitoEventParam.CLIENT_REF.rawValue)
      self.nativeEventEmitter.sendEvent(withName: event.rawValue, body: params)
  }
}
