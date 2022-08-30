import Foundation

class QuitoClient {
  private let eventEmitter: QuitoEventEmitter
  private let options: MqttOptions
  private let client: CocoaMQTT

  init(withEmitter eventEmitter: QuitoEventEmitter, options: MqttOptions) {
    self.eventEmitter = eventEmitter
    self.options = options
    self.client = CocoaMQTT(options.clientId, options.host, options.port)

    self.client.username = options.username
    self.client.password = options.password
    self.client.cleanSession = options.clean
  }


}