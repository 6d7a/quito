struct MqttOptions {
  let clientId: String
  let host: String
  let port: UInt16
  let connProtocol: Protocol
  let username: String?
  let password: String?
  let tls: Bool
  let caBase64: String?
  let privateKeyBase64: String?
  let certificateBase64: String?
  let keyStorePassword: String?
  let keepaliveSec: UInt16
  let cleanSession: Bool
  let connectionTimeout: TimeInterval
  let will: Will?

  init(fromJsOptions optionsFromJs: NSDictionary) {
      self.clientId = Helpers.getOrDefault(dict: optionsFromJs, key: "clientId", defaultValue: "quito-android-\(UUID().uuidString)")
      self.host = Helpers.getOrDefault(dict: optionsFromJs, key: "host", defaultValue: "test.mosquitto.org")
      self.port = Helpers.getOrDefault(dict: optionsFromJs, key: "port", defaultValue: 1883)
      self.connProtocol = Protocol(rawValue: Helpers.getOrDefault(dict: optionsFromJs, key: "protocol", defaultValue: "TCP"))!
    self.username = optionsFromJs["username"] as? String
    self.password = optionsFromJs["password"] as? String
    self.tls = Helpers.getOrDefault(dict: optionsFromJs, key: "tls", defaultValue: false)
    self.caBase64 = optionsFromJs["caBase64"] as? String
    self.privateKeyBase64 = optionsFromJs["privateKeyBase64"] as? String
    self.certificateBase64 = optionsFromJs["certificateBase64"] as? String
    self.keyStorePassword = optionsFromJs["keyStorePassword"] as? String
    self.keepaliveSec = Helpers.getOrDefault(dict: optionsFromJs, key: "keepaliveSec", defaultValue: 60)
    self.cleanSession = Helpers.getOrDefault(dict: optionsFromJs, key: "clean", defaultValue: true)
    self.connectionTimeout = TimeInterval((Helpers.getOrDefault(dict: optionsFromJs, key: "connectionTimeoutMs", defaultValue: 30000)) / 1000)
    if let willmsg = optionsFromJs["username"] as! NSDictionary? {
        self.will = Will(fromJsWill: willmsg)
    } else {
        self.will = nil
    }
  }
}


