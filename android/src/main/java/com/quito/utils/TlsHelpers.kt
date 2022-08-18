package com.quito.utils

import android.util.Base64
import org.bouncycastle.jce.provider.BouncyCastleProvider
import java.io.ByteArrayInputStream
import java.security.KeyFactory
import java.security.KeyStore
import java.security.SecureRandom
import java.security.Security
import java.security.cert.Certificate
import java.security.cert.CertificateFactory
import java.security.spec.PKCS8EncodedKeySpec
import javax.net.ssl.*


class TlsHelpers(
  private val eventEmitter: QuitoEventEmitter,
  private val clientRef: String
) {
  fun getSocketFactory(
    ca: String?,
    keystoreKey: String?,
    certificate: String?,
    keystorePassword: String?
  ): SSLSocketFactory {
    Security.addProvider(BouncyCastleProvider())
    return SSLContext.getInstance("TLS").apply {
      init(
        loadKeyManagers(keystoreKey, certificate, keystorePassword),
        loadTrustManagers(ca),
        SecureRandom()
      )
    }.socketFactory
  }

  private fun loadKeyManagers(key: String?, cert: String?, pass: String?): Array<KeyManager>? {
    if (key == null && cert == null) {
      return null
    } else if (key == null || cert == null) {
      eventEmitter.forwardException(IllegalArgumentException("Please provide both keystoreKey and certificate for client authorization."))
      return null
    }
    val certificate = loadCertificate(cert) ?: return null
    val spec = PKCS8EncodedKeySpec(Base64.decode(key, Base64.DEFAULT))
    val privKey = KeyFactory.getInstance("RSA").generatePrivate(spec)

    val keyStore = KeyStore.getInstance("BKS").apply {
      load(null, "".toCharArray())
      setCertificateEntry(clientRef, certificate)
      setKeyEntry("key-$clientRef", privKey, (pass ?: "").toCharArray(), arrayOf(certificate))
    }

    return KeyManagerFactory.getInstance("PKIX").apply {
      init(keyStore, "".toCharArray())
    }.keyManagers
  }

  private fun loadTrustManagers(ca: String?): Array<TrustManager>? {
    ca ?: return null
    val caCertificate = loadCertificate(ca) ?: return null

    val keyStore = KeyStore.getInstance("BKS").apply {
      load(null, null)
      setCertificateEntry("ca-$clientRef", caCertificate)
    }
    return TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()).apply {
      init(keyStore)
    }.trustManagers
  }

  private fun loadCertificate(cert: String): Certificate? {
    val certFactory = CertificateFactory.getInstance("X.509")
    val caInputStream = ByteArrayInputStream(Base64.decode(cert, Base64.DEFAULT))
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
