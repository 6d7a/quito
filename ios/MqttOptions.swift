struct MqttOptions {
  let clientId: String
  let host: String
  let port: UInt16
  let protocol: Protocol
  let username: String?
  let password: String?
  let tls: Boolean
  let caBase64: String?
  let keyStoreKey: String?
  let certificateBase64: String?
  let keyStorePassword: String?
  let keepaliveSec: Int
  let protocolVersion: Int
  let cleanSession: Boolean
  let connectionTimeout: TimeInterval
  let will: Will?

  init(fromJsOptions optionsFromJs: NSDictionary) {
    self.clientId = optionsFromJs["clientId"] ?? "quito-android-\(UUID().uuidString)"
    self.host = optionsFromJs["host"] ?? "test.mosquitto.org"
    self.port = UInt16(optionsFromJs["port"] ?? 1883)
    self.protocol = Protocol(rawValue: optionsFromJs["protocol"] ?? "TCP")
    self.username = optionsFromJs["username"] ?? null
    self.password = optionsFromJs["password"] ?? null
    self.tls = optionsFromJs["tls"] ?? false
    self.caBase64 = optionsFromJs["caBase64"] ?? null
    self.keyStoreKey = optionsFromJs["keyStoreKey"] ?? null
    self.certificateBase64 = optionsFromJs["certificateBase64"] ?? null
    self.keyStorePassword = optionsFromJs["keyStorePassword"] ?? null
    self.keepaliveSec = optionsFromJs["keepaliveSec"] ?? 60
    self.protocolLevel = optionsFromJs["protocolLevel"] ?? 4
    self.clean = optionsFromJs["clean"] ?? true
    self.connectionTimeout = TimeInterval((optionsFromJs["connectionTimeoutMs"] ?? 30000) / 1000)
    optionsFromJs.getMap("will")?.let { Will(it) }
  }
}