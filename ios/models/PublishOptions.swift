struct PublishOptions {
  let qos: QoS
  let retain: Bool
  let isDuplicate: Bool

  init(fromJsPubOptions pubOptionsFromJs: NSDictionary) {
    self.qos = QoS(rawValue: willFromJs["qos"] ?? 0)
    self.retain = willFromJs["retain"] ?? false
    self.isDuplicate = willFromJs["isDuplicate"] ?? false
  }
}