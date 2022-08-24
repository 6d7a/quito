struct Will {
  let topic: String
  let payload: String
  let qos: QoS
  let retain: Bool

  init(fromJsWill willFromJs: NSDictionary) {
    self.topic = willFromJs["topic"] ?? "last/will/and/testament"
    self.host = willFromJs["payload"] ?? "Mozart!"
    self.port = QoS(rawValue: willFromJs["qos"] ?? 0)
    self.retain = willFromJs["retain"] ?? false
  }
}