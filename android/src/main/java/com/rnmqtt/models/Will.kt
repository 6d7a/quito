package com.rnmqtt.models

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.rnmqtt.utils.getOr
import com.rnmqtt.utils.hexToBytes

data class Will(
  val topic: String,
  val payload: ByteArray,
  val qos: QoS,
  val retain: Boolean,
  val willDelayIntervalSec: Int,
  val isPayloadUtf8Encoded: Boolean,
  val messageExpiryIntervalSec: Int,
  val contentType: String,
  val responseTopic: String,
  val correlationData: ByteArray,
  val userProperties: Map<String, String>
) {
  @Suppress("UNCHECKED_CAST")
  constructor(willFromJs: ReadableMap): this(
    willFromJs.getOr<String>("topic", ""),
    willFromJs.getOr<String>("payload", "00").hexToBytes(),
    QoS.values()[willFromJs.getOr<Int>("qos", 0)],
    willFromJs.getOr<Boolean>("retain", false),
    willFromJs.getOr<Int>("willDelayIntervalSec", 5),
    willFromJs.getOr<Boolean>("isPayloadUtf8Encoded", true),
    willFromJs.getOr<Int>("messageExpiryIntervalSec", 30),
    willFromJs.getOr<String>("contentType", "text/plain"),
    willFromJs.getOr<String>("responseTopic", ""),
    willFromJs.getOr<String>("correlationData", "00").hexToBytes(),
    willFromJs.getOr<ReadableMap>("userProperties", Arguments.createMap()).toHashMap() as Map<String, String>
  )

  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as Will

    if (topic != other.topic) return false
    if (!payload.contentEquals(other.payload)) return false
    if (qos != other.qos) return false
    if (retain != other.retain) return false
    if (willDelayIntervalSec != other.willDelayIntervalSec) return false
    if (isPayloadUtf8Encoded != other.isPayloadUtf8Encoded) return false
    if (messageExpiryIntervalSec != other.messageExpiryIntervalSec) return false
    if (contentType != other.contentType) return false
    if (responseTopic != other.responseTopic) return false
    if (!correlationData.contentEquals(other.correlationData)) return false
    if (userProperties != other.userProperties) return false

    return true
  }

  override fun hashCode(): Int {
    var result = topic.hashCode()
    result = 31 * result + payload.contentHashCode()
    result = 31 * result + qos.hashCode()
    result = 31 * result + retain.hashCode()
    result = 31 * result + willDelayIntervalSec
    result = 31 * result + isPayloadUtf8Encoded.hashCode()
    result = 31 * result + messageExpiryIntervalSec
    result = 31 * result + contentType.hashCode()
    result = 31 * result + responseTopic.hashCode()
    result = 31 * result + correlationData.contentHashCode()
    result = 31 * result + userProperties.hashCode()
    return result
  }

}
