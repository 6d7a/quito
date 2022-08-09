package com.rnmqtt.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.rnmqtt.models.RnMqttEvent
import com.rnmqtt.models.RnMqttEventParams
import org.eclipse.paho.client.mqttv3.MqttException

class RnMqttEventEmitter(private val reactContext: ReactContext, private val clientRef: String) {
  /**
   * forwards a raised exception downstream to the RN event emitter.
   * @param e The exception to forward.
   */
  fun forwardException(e: Throwable) {
    val params = Arguments.createMap()
    params.putString(RnMqttEventParams.MQTT_PARAM_ERR_MESSAGE.name, e.localizedMessage)
    if (e is MqttException) {
      params.putInt(RnMqttEventParams.MQTT_PARAM_ERR_CODE.name, e.reasonCode)
    }
    params.putString(RnMqttEventParams.MQTT_PARAM_STACKTRACE.name, e.stackTrace.joinToString("\n\t") {
      "${it.fileName} - ${it.className}.${it.methodName}:${it.lineNumber}"
    })
    sendEvent(RnMqttEvent.MQTT_EXCEPTION, params)
  }

  /**
   * sends an event to the RN event emitter.
   * @param event The event to report.
   * @param params The parameters to send with the event.
   */
  fun sendEvent(event: RnMqttEvent, params: WritableMap = Arguments.createMap()) {
    params.putString(RnMqttEventParams.MQTT_PARAM_CLIENT_REF.name, clientRef)
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(event.name, params)
  }
}
