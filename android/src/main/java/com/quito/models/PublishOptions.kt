package com.quito.models

import com.facebook.react.bridge.ReadableMap
import com.quito.utils.getOr

data class PublishOptions(
  val qos: QoS,
  val retain: Boolean,
  val isDuplicate: Boolean,
) {
  constructor(pubOptionsFromJs: ReadableMap): this(
    QoS.values()[pubOptionsFromJs.getOr<Int>("qos", 0)],
    pubOptionsFromJs.getOr("retain", false),
    pubOptionsFromJs.getOr("isDuplicate", false)
  )
}
