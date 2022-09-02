struct MqttSubscription {
  let topic: String
  let qos: QoS

  init(fromJsSubscription subscriptionFromJs: NSDictionary) {
      self.topic = Helpers.getOrDefault(dict: subscriptionFromJs, key: "topic", defaultValue: "")
      self.qos = QoS(rawValue: Helpers.getOrDefault(dict: subscriptionFromJs, key: "qos", defaultValue: 0))!
  }
}
