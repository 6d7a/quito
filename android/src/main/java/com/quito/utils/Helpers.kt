package com.quito.utils

import android.util.Log
import com.facebook.react.bridge.*
import java.util.*

fun createClientReference(): String = UUID.randomUUID().toString()

@Suppress("UNCHECKED_CAST")
fun<T> ReadableMap.getOr(field: String, default: T): T {
  return try {
    when (this.getType(field)) {
      ReadableType.Number -> this.getInt(field) as T
      ReadableType.Array -> this.getArray(field) as T
      ReadableType.Boolean -> this.getBoolean(field) as T
      ReadableType.String -> this.getString(field) as T
      ReadableType.Map -> this.getMap(field) as T
      ReadableType.Null -> default
    }
  } catch (e: Throwable) {
    Log.d("Quito", "failed to read field of ReadableMap: ${e.message}")
    default
  }
}

fun String.hexToBytes(): ByteArray {
  check(length % 2 == 0) { "Hex string must have an even length." }

  return chunked(2)
    .map { it.toInt(16).toByte() }
    .toByteArray()
}
