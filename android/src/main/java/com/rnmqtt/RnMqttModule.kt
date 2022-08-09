package com.rnmqtt

import android.util.Log
import com.facebook.react.bridge.*
import com.rnmqtt.models.RnMqttOptions
import com.rnmqtt.utils.RnMqttEventEmitter
import kotlin.collections.HashMap
import com.rnmqtt.utils.createClientReference

class RnMqttModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val clients = HashMap<String, RnMqtt>()

    override fun getName(): String {
        return "RnMqtt"
    }

      @ReactMethod
    fun addListener(eventName: String?) {
      // Upstream listeners
      Log.d("RnMqtt", "added Listener: $eventName")
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
      // Remove upstream listeners
      Log.d("RnMqtt", "removed $count listeners")
    }

    @ReactMethod
    fun createClient(options: ReadableMap, promise: Promise) {
      val clientRef = createClientReference()
      try {
        val client = RnMqtt(clientRef, reactContext, RnMqttOptions(options))
        clients[clientRef] = client
        promise.resolve(clientRef)
      } catch (e: Throwable) {
        promise.reject(e)
      }
    }
}
