package com.rnmqtt

import android.util.Log
import com.facebook.react.bridge.*

class RnMqttModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "RnMqtt"
    }

      @ReactMethod
    fun addListener(eventName: String?) {
      // Upstream listeners
      Log.d("RNMQTT", "added Listener: $eventName")
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
      // Remove upstream listeners
      Log.d("RNMQTT", "removed listeners: $count")
    }

}
