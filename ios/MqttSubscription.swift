struct MqttSubscription {
  let topic: String
  let qos: QoS

  init(fromJsSubscription subscriptionFromJs: NSDictionary) {
    self.topic = subscriptionFromJs["topic"] ?? ""
    self.qos = QoS(rawValue: subscriptionFromJs["qos"] ?? 0)
  }
}