struct PublishOptions {
  let qos: QoS
  let retain: Bool
  let isDuplicate: Bool

  init(fromJsPubOptions pubOptionsFromJs: NSDictionary) {
      self.qos = QoS(rawValue: Helpers.getOrDefault(dict: pubOptionsFromJs, key: "qos", defaultValue: 0))!
      self.retain = Helpers.getOrDefault(dict: pubOptionsFromJs, key: "retain", defaultValue: false)
      self.isDuplicate = Helpers.getOrDefault(dict: pubOptionsFromJs, key: "isDuplicate", defaultValue: false)
  }
}
