import Foundation
import CocoaMQTT

class QuitoClient {
  private let eventEmitter: QuitoEventEmitter
  private let options: MqttOptions
  private let client: CocoaMQTT
  private let clientRef: String

  init(withEmitter eventEmitter: QuitoEventEmitter, options: MqttOptions, clientRef: String) {
    self.clientRef = clientRef
    self.eventEmitter = eventEmitter
    self.options = options
    if options["protocol"] == Protocol.WS || options["protocol"] == Protocol.WSS {
      let socket = CocoaMQTTWebSocket(uri: url.path)
      self.client = CocoaMQTT(options.clientId, options.host, options.port, socket)
    } else {
      self.client = CocoaMQTT(options.clientId, options.host, options.port)
    }

    self.client.username = options.username
    self.client.password = options.password
    self.client.cleanSession = options.clean
    self.client.will = options.will.toCocoaMqttMessage()
    self.client.keepaAive = options.keepaliveSec  
    self.client.enableSsl = options.tls  

    self.client.didStateChangeTo = { (_, newState) -> {
      if newState == CocoaMQTTConnState.disconnected {
        eventEmitter.sendEvent(QuitoEvent.CONNECTION_LOST)
      }
    } }

    sel.client.didReceiveMessage = { (_, msg, _) -> {
      eventEmitter.sendEvent(QuitoEvent.MESSAGE_RECEIVED, [
        QuitoEventParam.TOPIC: msg.topic,
        QuitoEventParam.PAYLOAD: msg.payload
      ])
    } }
  } 

  /**
   * Queries the connection status of the MQTT client.
   * @returns A boolean indicating whether or not the client is connected.
   */
  func isConnected() -> Bool {
    return self.client.connState == CocoaMQTTConnState.connected
  }

 /**
   * connects to the MQTT broker according to the
   * previously defined MqttConnectOptions
   * @param resolve resolve block of the JS promise to forward the result of the connection attempt
   * @param reject reject block of the JS promise to forward the result of the connection attempt
   */
  func connect(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      self.client.connect(self.options.connectionTimeout)
      self.client.didConnectAck = { (_, ack) -> {
        eventEmitter.sendEvent(QuitoEvent.CONNECTED)
        resolve(self.clientRef)
        self.client.didConnectAck = { _, _ in }
      } }
      eventEmitter.sendEvent(QuitoEvent.CONNECTING)
    } catch error {
      eventEmitter.forwardException(error)
      reject(error)
    }
  }

  /**
   * Subscribes to one or more topics with the given
   * quality of service.
   *
   * @param topics one or more [MqttSubscription]s to subscribe to
   * @param resolve resolve block of the JS promise to forward the result of the subscription attempt
   * @param reject reject block of the JS promise to forward the result of the subscription attempt
   */
  func subscribe(topics: Array<MqttSubscription>, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      self.client.subscribe(t.map { ($0.topic, UInt8($0.qos)) })
      self.client.didSubscribeTopics = { (_, success, failed) -> {
        if failed.count != topics.count {
          sendEvent(QuitoEvent.SUBSCRIBED, [
            QuitoEventParam.TOPIC: success.allKeys
          ])
          resolve(self.clientRef)
        } else {
          reject(NSError(domain: "Quito", code: 0, userInfo: ["topics": failed]))
        }
        if failed.count > 0 {
          forwardException(NSError(domain: "Quito", code: 0, userInfo: ["topics": failed]) )
        }
        self.client.didSubscribeTopics = { _, _, _ in }
      } }
    } catch error {
      eventEmitter.forwardException(error)
      reject(error)
    }
  }

  /**
   * Unsubscribes from one or more topics
   *
   * @param topics one or more topic ids to unsubscribe from
   * @param resolve resolve block of the JS promise to forward the result of the unsubscription attempt
   * @param reject reject block of the JS promise to forward the result of the unsubscription attempt
   */
  func unsubscribe(topics: Array<String>, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      self.client.unsubscribe(topics)
      self.client.didUnsubscribeTopics = { (_, unsubscribed) -> {
        sendEvent(QuitoEvent.UNSUBSCRIBED, [
            QuitoEventParam.TOPIC: unsubscribed
          ])
        if unsubscribed.count == topics.count {
          resolve(self.clientRef)
        } else {
          let failed = topics.filter { t in return !unsubscribed.contains(t) }
          reject(NSError(domain: "Quito", code: 0, userInfo: ["topics": failed ]))
        }
        self.client.didUnsubscribeTopics =  { _, _ in }
      } }
    } catch error {
      eventEmitter.forwardException(error)
      reject(error)
    }
  }

  /**
   * Publishes a message to a topic.
   *
   * @param topic The topic to publish to.
   * @param payloadBase64 The message to publish.
   * @param resolve resolve block of the JS promise to forward the result of the publishing attempt
   * @param reject reject block of the JS promise to forward the result of the publishing attempt
   */
  func publish(topic: String, payloadBase64: String, options: PublishOptions, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      let payload = [UInt8](Data(base64Encoded: payloadBase64))
      let message = CocoaMQTTMessage(topic, payload, UInt8(options.qos), options.retained)
      message.duplicated = options.isDuplicate
      self.client.didPublishMessage = { (_, msg, _) -> {
        sendEvent(QuitoEvent.UNSUBSCRIBED, [
            QuitoEventParam.TOPIC: topic,
            QuitoEventParam.PAYLOAD: payloadBase64
          ])
        resolve(self.clientRef)
        self.client.didPublishMessage = { _, _, _ in }
      } }
      self.client.publish(message)
    } catch error {
      eventEmitter.forwardException(error)
      reject(error)
    }
  }

  /**
   * Disconnects the client from the MQTT broker
   *
   * @param resolve resolve block of the JS promise to forward the result of the disconnect attempt
   * @param reject reject block of the JS promise to forward the result of the disconnect attempt
   */
  func disconnect(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    do {
      self.client.didDisconnect = { (_, err: Error?) -> {
        if err != nil {
          eventEmitter.forwardException(err)
          reject(err)
        } else {
          eventEmitter.sendEvent(QuitoEvent.DISCONNECTED)
          resolve(self.clientRef)
        }
        self.client.didDisconnect = { _, _ in }
      } }
    } catch error {
      eventEmitter.forwardException(error)
      reject(error)
    }
  }
}
