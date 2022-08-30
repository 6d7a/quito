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
  let protocolVersion: Int
  let cleanSession: Bool
  let connectionTimeout: TimeInterval
  let will: Will?

  init(fromJsOptions optionsFromJs: NSDictionary) {
      self.clientId = Helpers.getOrDefault(dict: optionsFromJs, key: "clientId", defaultValue: "quito-android-\(UUID().uuidString)")
      self.host = Helpers.getOrDefault(dict: optionsFromJs, key: "host", defaultValue: "test.mosquitto.org")
      if let host = optionsFromJs["host"] as! String? {
          self.host = host
      } else {
          self.host = "test.mosquitto.org"
      }
      if let port = optionsFromJs["port"] as! Int? {
          self.port = UInt16(port)
      } else {
          self.port = 1883
      }
      
    self.port = UInt16(optionsFromJs["port"] ?? 1883)
    self.connProtocol = Protocol(rawValue: optionsFromJs["protocol"] ?? "TCP")
    self.username = optionsFromJs["username"] ?? null
    self.password = optionsFromJs["password"] ?? null
    self.tls = optionsFromJs["tls"] ?? false
    self.caBase64 = optionsFromJs["caBase64"] ?? nil
    self.keyStoreKey = optionsFromJs["keyStoreKey"] ?? nil
    self.certificateBase64 = optionsFromJs["certificateBase64"] ?? null
    self.keyStorePassword = optionsFromJs["keyStorePassword"] ?? null
    self.keepaliveSec = optionsFromJs["keepaliveSec"] ?? 60
    self.protocolLevel = optionsFromJs["protocolLevel"] ?? 4
    self.clean = optionsFromJs["clean"] ?? true
    self.connectionTimeout = TimeInterval((optionsFromJs["connectionTimeoutMs"] ?? 30000) / 1000)
    optionsFromJs.getMap("will")?.let { Will(it) }
  }
}


