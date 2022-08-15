package com.rnmqtt.utils

import com.facebook.react.bridge.ReactContext
import org.bouncycastle.jce.provider.BouncyCastleProvider
import java.io.BufferedInputStream
import java.security.KeyStore
import java.security.SecureRandom
import java.security.Security
import java.security.cert.Certificate
import java.security.cert.CertificateFactory
import javax.net.ssl.SSLContext
import javax.net.ssl.SSLSocketFactory
import javax.net.ssl.TrustManagerFactory

class TlsHelpers(
  private val reactContext: ReactContext,
  private val eventEmitter: RnMqttEventEmitter,
  private val clientRef: String
) {
  fun getSocketFactory(certificatePath: String, keystorePassword: String): SSLSocketFactory {
    val certificate = loadCertificate(certificatePath)
    val keyStore = KeyStore.getInstance("BKS").apply {
      load(null, keystorePassword.toCharArray())
      setCertificateEntry("MQTT client $clientRef certificate", certificate)
    }
    val trustManagerFactory =
      TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()).apply {
        init(keyStore)
      }
    return SSLContext.getInstance("TLS").apply {
      init(null, trustManagerFactory.trustManagers, SecureRandom())
    }.socketFactory
  }

  private fun loadCertificate(certificatePath: String): Certificate? {
    Security.addProvider(BouncyCastleProvider())
    val certFactory = CertificateFactory.getInstance("X.509")
    val caInputStream = BufferedInputStream(reactContext.assets.open(certificatePath))
    return try {
      certFactory.generateCertificate(caInputStream)
    } catch (e: Exception) {
      eventEmitter.forwardException(e)
      null
    } finally {
      caInputStream.close()
    }
  }
}
