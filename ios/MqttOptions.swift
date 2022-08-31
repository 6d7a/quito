struct MqttOptions {
  let clientId: String
  let host: String
  let port: UInt16
  let connProtocol: Protocol
  let username: String?
  let password: String?
  let tls: Bool
  let caBase64: String?
  let keyStoreKey: String?
  let certificateBase64: String?
  let keyStorePassword: String?
  let keepaliveSec: Int
  let cleanSession: Bool
  let connectionTimeout: TimeInterval
  let will: Will?

  init(fromJsOptions optionsFromJs: NSDictionary) {
      self.clientId = Helpers.getOrDefault(dict: optionsFromJs, key: "clientId", defaultValue: "quito-android-\(UUID().uuidString)")
      self.host = Helpers.getOrDefault(dict: optionsFromJs, key: "host", defaultValue: "test.mosquitto.org")
      self.port = Helpers.getOrDefault(dict: optionsFromJs, key: "port", defaultValue: 1883)
      self.connProtocol = Protocol(rawValue: Helpers.getOrDefault(dict: optionsFromJs, key: "protocol", defaultValue: "TCP"))      
    self.username = optionsFromJs["username"]
    self.password = optionsFromJs["password"]
    self.tls = Helpers.getOrDefault(dict: optionsFromJs, key: "tls", defaultValue: false)
    self.caBase64 = optionsFromJs["caBase64"]
    self.keyStoreKey = optionsFromJs["keyStoreKey"]
    self.certificateBase64 = optionsFromJs["certificateBase64"]
    self.keyStorePassword = optionsFromJs["keyStorePassword"]
    self.keepaliveSec = Helpers.getOrDefault(dict: optionsFromJs, key: "keepaliveSec", defaultValue: 60)
    self.clean = Helpers.getOrDefault(dict: optionsFromJs, key: "clean", defaultValue: true)
    self.connectionTimeout = TimeInterval((Helpers.getOrDefault(dict: optionsFromJs, key: "connectionTimeoutMs", defaultValue: 30000)) / 1000)
    if let willmsg = optionsFromJs["username"] as! NSDictionary {
        self.will = Will(fromJsWill: willmsg)
    }
  }
}


