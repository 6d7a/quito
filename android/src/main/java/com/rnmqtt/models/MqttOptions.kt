package com.rnmqtt.models

import com.facebook.react.bridge.ReadableMap
import com.rnmqtt.utils.getOr
import org.eclipse.paho.client.mqttv3.MqttConnectOptions
import java.util.*

data class MqttOptions(
  val clientId: String,
  val brokerUri: String,
  val host: String,
  val port: Int,
  val protocol: Protocol,
  val tls: Boolean,
  val keepaliveSec: Int,
  val protocolLevel: Int,
  val clean: Boolean,
  val connectionTimeoutMs: Int,
) {
  constructor(optionsFromJs: ReadableMap) : this(
    optionsFromJs.getOr<String>("clientId", "rn-mqtt-android-${UUID.randomUUID()}"),
    optionsFromJs.getOr<String>("brokerUri", "mqtt://test.mosquitto.org:1883"),
    optionsFromJs.getOr<String>("host", "test.mosquitto.org"),
    optionsFromJs.getOr<Int>("port", 1883),
    Protocol.valueOf(optionsFromJs.getOr<String>("protocol", "MQTT")),
    optionsFromJs.getOr<Boolean>("tls", false),
    optionsFromJs.getOr<Int>("keepaliveSec", 60),
    optionsFromJs.getOr<Int>("protocolLevel", 4),
    optionsFromJs.getOr<Boolean>("clean", true),
    optionsFromJs.getOr<Int>("connectionTimeoutMs", 30000)
  )

  fun toPahoMqttOptions(): MqttConnectOptions = MqttConnectOptions().apply {
    keepAliveInterval = keepaliveSec
    connectionTimeout = connectionTimeoutMs
    isCleanSession = clean
    mqttVersion = protocolLevel
  }
}
