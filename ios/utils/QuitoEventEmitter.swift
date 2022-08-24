import Foundation

class QuitoEventEmitter {
  private let nativeEventEmitter: RCTEventEmitter
  private let clientRef: String

  init(nativeEventEmitter: RCTEventEmitter, clientRef: String) {
    self.nativeEventEmitter = nativeEventEmitter
  }

  func forwardException(e: Error) {
    var params: [QuitoEventParam: Any] = [
      QuitoEventParam.ERR_CODE: e.code
      QuitoEventParam.ERR_MESSAGE: e.description
      QuitoEventParam.STACKTRACE: e.domain
    ]
    self.nativeEventEmitter.sendEvent(withName: QuitoEvent.EXCEPTION, body: params)
  }

  func sendEvent(event: QuitoEvent, params: [QuitoEventParam: Any]) {
    params[QuitoEventParam.CLIENT_REF] = self.clientRef
    self.nativeEventEmitter.sendEvent(withName: event, body: params)
  }
}