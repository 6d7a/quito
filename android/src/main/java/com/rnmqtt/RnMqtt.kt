package com.rnmqtt

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.rnmqtt.models.MqttOptions
import com.rnmqtt.models.MqttSubscription
import com.rnmqtt.models.PublishOptions
import com.rnmqtt.models.rnevents.RnMqttEvent.*
import com.rnmqtt.models.rnevents.RnMqttEventParams.*
import com.rnmqtt.utils.RnMqttEventEmitter
import com.rnmqtt.utils.TlsHelpers
import org.eclipse.paho.client.mqttv3.*
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence


class RnMqtt(
  private val clientRef: String,
  private val reactContext: ReactContext,
  private val options: MqttOptions
) : MqttCallbackExtended {
  private val eventEmitter = RnMqttEventEmitter(reactContext, clientRef)
  private var client = MqttAsyncClient(
    options.brokerUri,
    "${options.clientId}-${MqttAsyncClient.generateClientId()}",
    MemoryPersistence()
  )
  private val subscribedTopics: MutableList<MqttSubscription> = mutableListOf()
  private val tlsHelpers = TlsHelpers(reactContext, eventEmitter, clientRef)

  init {
    client.setCallback(this)
  }

  /**
   * reconnects to the previously connected MQTT broker.
   */
  fun reconnect() {
    try {
      client.reconnect()
      eventEmitter.sendEvent(RECONNECT)
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
      eventEmitter.sendEvent(CONNECTING)
      client.connect(
        options.toPahoMqttOptions(tlsHelpers),
        reactContext,
        object : IMqttActionListener {
          override fun onSuccess(asyncActionToken: IMqttToken) {
            eventEmitter.sendEvent(CONNECTED)
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
            TOPIC.name,
            Arguments.createArray().apply { topicIds.forEach { pushString(it) } })
          eventEmitter.sendEvent(SUBSCRIBED, params)
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
            TOPIC.name,
            Arguments.createArray().apply { topics.forEach { pushString(it) } })
          eventEmitter.sendEvent(UNSUBSCRIBED, params)
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
   * @param payloadAsUtf8String The message to publish. Raw bytes must be encoded as UTF-8.
   * @param options The [PublishOptions] to publish the message with
   * @param promise JS promise to asynchronously pass on the result of the publication attempt
   */
  fun publish(
    topic: String, payloadAsUtf8String: String, options: PublishOptions, promise: Promise? = null
  ) {
    try {
      val encodedPayload = payloadAsUtf8String.toByteArray(Charsets.UTF_8)
      val message = MqttMessage(encodedPayload)
        .apply {
          qos = options.qos.ordinal
          isRetained = options.retain
        }
      client.publish(topic, message, null, object : IMqttActionListener {
        override fun onSuccess(asyncActionToken: IMqttToken?) {
          val params = Arguments.createMap()
          params.putString(TOPIC.name, topic)
          params.putString(PAYLOAD.name, payloadAsUtf8String)
          eventEmitter.sendEvent(MESSAGE_PUBLISHED, params)
          promise?.resolve(clientRef)
        }

        override fun onFailure(asyncActionToken: IMqttToken?, exception: Throwable?) {
          if (exception != null) {
            eventEmitter.forwardException(exception)
          }
          promise?.reject(
            exception
              ?: Error("Encountered unidentified error sending $payloadAsUtf8String on topic $topic")
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
          eventEmitter.sendEvent(DISCONNECTED)
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
      eventEmitter.sendEvent(CLOSED)
      promise?.resolve(clientRef)
    } catch (e: Exception) {
      eventEmitter.forwardException(e)
      promise?.reject(e)
    }
  }

  override fun connectionLost(cause: Throwable?) {
    val params = Arguments.createMap()
    if (cause != null) {
      params.putString(ERR_MESSAGE.name, cause.localizedMessage)
      if (cause is MqttException) {
        params.putInt(ERR_CODE.name, cause.reasonCode)
      }
      params.putString(
        STACKTRACE.name,
        cause.stackTrace.joinToString("\n\t") {
          "${it.fileName} - ${it.className}.${it.methodName}:${it.lineNumber}"
        })
    }
    eventEmitter.sendEvent(CONNECTION_LOST, params)
  }

  override fun messageArrived(topic: String?, message: MqttMessage?) {
    val params = Arguments.createMap()
    params.putString(TOPIC.name, topic)
    if (message != null) {
      params.putString(
        PAYLOAD.name,
        message.payload.joinToString(separator = "") { b -> "%02x".format(b) })
      params.putInt(QOS.name, message.qos)
      params.putBoolean(RETAIN.name, message.isRetained)
    }
    eventEmitter.sendEvent(MESSAGE_RECEIVED, params)
  }

  override fun deliveryComplete(token: IMqttDeliveryToken?) {
    eventEmitter.sendEvent(DELIVERY_COMPLETE)
  }

  override fun connectComplete(reconnect: Boolean, serverURI: String?) {
    val params = Arguments.createMap()
    params.putBoolean(RECONNECT.name, reconnect)
    params.putString(SERVER_URI.name, serverURI)
    eventEmitter.sendEvent(CONNECTION_COMPLETE, params)
  }
}
