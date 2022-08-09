package com.rnmqtt

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.rnmqtt.models.MqttSubscription
import com.rnmqtt.models.rnevents.RnMqttEvent.*
import com.rnmqtt.models.rnevents.RnMqttEventParams.*
import com.rnmqtt.models.MqttOptions
import com.rnmqtt.models.PublishOptions
import com.rnmqtt.utils.RnMqttEventEmitter
import com.rnmqtt.utils.hexToBytes
import org.eclipse.paho.client.mqttv3.*

class RnMqtt(
  private val clientRef: String,
  private val reactContext: ReactContext,
  private val options: MqttOptions
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
  fun subscribe(vararg topics: MqttSubscription, promise: Promise? = null) {
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

  /**
   * Unsubscribes from one or more topics
   *
   * @param topics one or more topic ids to unsubscribe from
   * @param promise JS promise to asynchronously pass on the result of the unsubscription attempt
   */
  fun unsubscribe(topics: Array<String>, promise: Promise? = null) {
    try {
      client.unsubscribe(topics, null, object : IMqttActionListener {
        override fun onSuccess(asyncActionToken: IMqttToken) {
          val params = Arguments.createMap()
          params.putArray(
            MQTT_PARAM_TOPIC.name,
            Arguments.createArray().apply { topics.forEach { pushString(it) } })
          eventEmitter.sendEvent(MQTT_UNSUBSCRIBED, params)
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

  /**
   * Publishes a message to a topic.
   *
   * @param topic The topic to publish to.
   * @param payloadAsHexString The message to publish.
   * @param options The [PublishOptions] to publish the message with
   * @param promise JS promise to asynchronously pass on the result of the publication attempt
   */
  fun publish(
    topic: String, payloadAsHexString: String, options: PublishOptions, promise: Promise? = null
  ) {
    try {
      val encodedPayload = payloadAsHexString.hexToBytes()
      val message = MqttMessage(encodedPayload)
        .apply {
          qos = options.qos.ordinal
          isRetained = options.retain
        }
      client.publish(topic, message, null, object : IMqttActionListener {
        override fun onSuccess(asyncActionToken: IMqttToken?) {
          val params = Arguments.createMap()
          params.putString(MQTT_PARAM_TOPIC.name, topic)
          params.putString(MQTT_PARAM_MESSAGE.name, payloadAsHexString)
          eventEmitter.sendEvent(MQTT_MESSAGE_PUBLISHED, params)
          promise?.resolve(clientRef)
        }

        override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {
          if (exception != null) {
            eventEmitter.forwardException(exception)
          }
          promise?.reject(
            exception ?: Error("Encountered unidentified error sending $payloadAsHexString on topic $topic")
          )
        }
      })
    } catch (e: Exception) {
      eventEmitter.forwardException(e)
      promise?.reject(e)
    }
  }

  /**
   * Disconnects the client from the MQTT broker
   *
   * @param promise JS promise to asynchronously pass on the result of the publication attempt
   */
  fun disconnect(promise: Promise? = null) {
    try {
      client.disconnect(null, object : IMqttActionListener {
        override fun onSuccess(asyncActionToken: IMqttToken) {
          eventEmitter.sendEvent(MQTT_DISCONNECTED)
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

  /**
   * Gracefully tears down the MQTT client
   *
   * @param force close the client instantly, without waiting for in-flight messages to be acknowledged
   * @param promise JS promise to asynchronously pass on the result of the closing attempt
   */
  fun end(force: Boolean = false, promise: Promise? = null) {
    try {
      client.close(force)
      eventEmitter.sendEvent(MQTT_CLOSED)
      promise?.resolve(clientRef)
    } catch (e: Exception) {
      eventEmitter.forwardException(e)
      promise?.reject(e)
    }
  }

  override fun connectionLost(cause: Throwable?) {
    val params = Arguments.createMap()
    if (cause != null) {
      params.putString(MQTT_PARAM_ERR_MESSAGE.name, cause.localizedMessage)
      if (cause is MqttException) {
        params.putInt(MQTT_PARAM_ERR_CODE.name, cause.reasonCode)
      }
      params.putString(
        MQTT_PARAM_STACKTRACE.name,
        cause.stackTrace.joinToString("\n\t") {
          "${it.fileName} - ${it.className}.${it.methodName}:${it.lineNumber}"
        })
    }
    eventEmitter.sendEvent(MQTT_CONNECTION_LOST, params)
  }

  override fun messageArrived(topic: String?, message: MqttMessage?) {
    val params = Arguments.createMap()
    params.putString(MQTT_PARAM_TOPIC.name, topic)
    if (message != null) {
      params.putString(
        MQTT_PARAM_MESSAGE.name,
        message.payload.joinToString(separator = "") { b -> "%02x".format(b) })
      params.putInt(MQTT_PARAM_QOS.name, message.qos)
      params.putBoolean(MQTT_PARAM_RETAIN.name, message.isRetained)
    }
    eventEmitter.sendEvent(MQTT_MESSAGE_ARRIVED, params)
  }

  override fun deliveryComplete(token: IMqttDeliveryToken?) {
    eventEmitter.sendEvent(MQTT_DELIVERY_COMPLETE)
  }

  override fun connectComplete(reconnect: Boolean, serverURI: String?) {
    val params = Arguments.createMap()
    params.putBoolean(MQTT_PARAM_RECONNECT.name, reconnect)
    params.putString(MQTT_PARAM_SERVER_URI.name, serverURI)
    eventEmitter.sendEvent(MQTT_CONNECTION_COMPLETE, params)
  }
}
