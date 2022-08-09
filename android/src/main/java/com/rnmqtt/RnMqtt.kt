package com.rnmqtt

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.rnmqtt.models.MqttSubscription
import com.rnmqtt.models.RnMqttEvent.*
import com.rnmqtt.models.RnMqttEventParams.*
import com.rnmqtt.models.RnMqttOptions
import com.rnmqtt.utils.RnMqttEventEmitter
import org.eclipse.paho.client.mqttv3.*

class RnMqtt(
  private val clientRef: String,
  private val reactContext: ReactContext,
  private val options: RnMqttOptions
) : MqttCallbackExtended {
  private val eventEmitter = RnMqttEventEmitter(reactContext, clientRef)
  private var client = MqttAsyncClient(options.brokerUri, options.clientId)
  private val subscribedTopics: MutableList<MqttSubscription> = mutableListOf()


  init {
    client.setCallback(this)
  }

  /**
   * reconnects to the previously connected MQTT broker.
   */
  fun reconnect() {
    try {
      client.reconnect()
      eventEmitter.sendEvent(MQTT_RECONNECT)
    } catch (e: MqttException) {
      eventEmitter.forwardException(e)
    }
  }

  /**
   * Queries the connection status of the MQTT client.
   * @returns A boolean indicating whether or not the client is connected.
   */
  fun isConnected(): Boolean = client.isConnected

  /**
   * connects to the MQTT broker according to the
   * previously defined MqttConnectOptions
   * @param promise JS promise to asynchronously pass on the result of the connection attempt
   */
  fun connect(promise: Promise? = null) {
    try {
      eventEmitter.sendEvent(MQTT_CONNECTING)
      client.connect(options.toPahoMqttOptions(), reactContext, object : IMqttActionListener {
        override fun onSuccess(asyncActionToken: IMqttToken) {
          eventEmitter.sendEvent(MQTT_CONNECTED)
          subscribe(*subscribedTopics.toTypedArray())
          promise?.resolve(clientRef)
        }

        override fun onFailure(asyncActionToken: IMqttToken, exception: Throwable) {
          eventEmitter.forwardException(exception)
          promise?.reject(exception)
        }
      })
    } catch (e: MqttException) {
      eventEmitter.forwardException(e)
      promise?.reject(e)
    }
  }

  /**
   * Subscribes to one or more topics with the given
   * quality of service.
   *
   * @param topics one or more [MqttSubscription]s to subscribe to
   * @param promise JS promise to asynchronously pass on the result of the subscription attempt
   */
  fun subscribe(vararg topics: MqttSubscription, promise: Promise?) {
    try {
      val topicIds = topics.map { it.topic }.toTypedArray()
      val qualities = topics.map { it.qos.ordinal }.toIntArray()
      client.subscribe(topicIds, qualities, null, object : IMqttActionListener {
        override fun onSuccess(asyncActionToken: IMqttToken) {
          val params = Arguments.createMap()
          params.putArray(
            MQTT_PARAM_TOPIC.name,
            Arguments.createArray().apply { topicIds.forEach { pushString(it) } })
          eventEmitter.sendEvent(MQTT_SUBSCRIBED, params)
          promise?.resolve(clientRef)
        }

        override fun onFailure(asyncActionToken: IMqttToken, exception: Throwable) {
          eventEmitter.forwardException(exception)
          promise?.reject(exception)
        }
      }
      )
    } catch (e: MqttException) {
      eventEmitter.forwardException(e)
      promise?.reject(e)
    }
  }
}
