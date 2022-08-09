package com.rnmqtt.models

data class MqttSubscription(
  val topic: String,
  val qos: QoS
)
