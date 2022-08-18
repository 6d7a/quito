package com.quito.models

data class MqttSubscription(
  val topic: String,
  val qos: QoS
)
