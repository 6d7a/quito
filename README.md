# Quito ![Logo](./docs/assets/quito_round.svg)

A TCP-capable MQTT client for React Native. The module provides a Typescript API for native MQTT clients on iOS and Android.

- on Android, quito relies on [Paho](https://www.eclipse.org/paho/index.php?page=clients/java/index.php)
- on iOS, quito uses [CocoaMQTT](https://github.com/emqx/CocoaMQTT)

The module provides both promise- and callback-based methods to interact with the native clients.

This libraries owes a lot to [davesters](https://github.com/davesters)' and [SudoPlz](https://github.com/SudoPlz)' respective libraries, so thank you :100:

## Installation

```sh
npm install quito
```

To make an unencrypted connection to an MQTT broker, make sure a consuming android application allows cleartext traffic, either generally by setting the _android:usesCleartextTraffic_ flag in the application field of the AndroidManifest.xml, or by adding a [security configuration](https://developer.android.com/training/articles/security-config).

## Usage

The module provides promise- and callback-based methods to interact with the native clients.

#### Callback-based usage

```typescript
import { Quito, QuitoOptionsBuilder } from 'quito';

// build a config using the QuitoOptionsBuilder
const config = new QuitoOptionsBuilder()
  .uri('tcp://test.mosquitto.org:1883')
  .clientId('quito-test-client')
  .build();

const MqttClient = new Quito(config);

MqttClient.init() // call init() to create native client and set up native event listeners
  .then(() => {
    // Subscribing to event callbacks
    MqttClient.on(QuitoEvent.CONNECTING, () => {
      // called when client is connecting
    });
    MqttClient.on(QuitoEvent.CONNECTED, () => {
      // called when client is connected
    });
    MqttClient.on(QuitoEvent.SUBSCRIBED, (topic: string) => {
      // called when client has subscribed to a topic
    });
    MqttClient.on(QuitoEvent.UNSUBSCRIBED, (topic: string) => {
      // called when client has unsubscribed from a topic
    });
    MqttClient.on(
      QuitoEvent.MESSAGE_RECEIVED,
      (topic: string, payload: Uint8Array) => {
        // called when client has received a message
      }
    );
    MqttClient.on(
      QuitoEvent.MESSAGE_PUBLISHED,
      (topic: string, payload: Uint8Array) => {
        // called when client has sent a message
      }
    );
    MqttClient.on(QuitoEvent.DISCONNECTED, () => {
      // called when client has disconnected
    });
    MqttClient.on(QuitoEvent.CONNECTION_LOST, (error?: Error) => {
      // called when client has unexpectedly lost its connection to the broker
    });
    MqttClient.on(QuitoEvent.EXCEPTION, (error: Error) => {
      // called when client encountered an error
    });
    MqttClient.on(QuitoEvent.CLOSED, (error?: Error) => {
      // called when client was closed
    });

    // connecting to the MQTT broker
    MqttClient.connect();

    // subscribing to a message topic
    // both a single topic or an array of topics are supported
    MqttClient.subscribe([
      {
        topic: 'first/topic',
        qos: 2, // Quality of Service
      },
      {
        topic: 'second/topic',
        qos: 1,
      },
    ]);

    // unsubscribing from a message topic
    // both a single topic string or an array of topic strings are supported
    MqttClient.unsubscribe('first/topic');

    // publishing a message
    MqttClient.publish(
      'first/topic',
      Buffer.from('This is a test message!'),
      0, // Quality of service
      false // whether the message should be retained
    );

    // checking client connection
    MqttClient.isConnected().then((isConnected: Boolean) => {
      // process connection state
    });

    // shutting down client
    MqttClient.end();
  });
```

#### Promise-based usage

```typescript
import { Quito, QuitoOptionsBuilder } from 'quito';

// build a config using the QuitoOptionsBuilder
const config = new QuitoOptionsBuilder()
  .uri('tcp://test.mosquitto.org:1883')
  .clientId('quito-test-client')
  .build();

const MqttClient = new Quito(config);

await MqttClient.init(); // call init() to create native client and set up native event listeners

// Most message callbacks are redundant
// when using the Promise-based API
MqttClient.on(
  QuitoEvent.MESSAGE_RECEIVED,
  (topic: string, payload: Uint8Array) => {
    // called when client has received a message
  }
);
MqttClient.on(QuitoEvent.CONNECTION_LOST, (error?: Error) => {
  // called when client has unexpectedly lost its connection to the broker
});
MqttClient.on(QuitoEvent.EXCEPTION, (error: Error) => {
  // called when client encountered an error
});

// connecting to the MQTT broker
try {
  await MqttClient.connectAsync();
} catch (e: any) {
  // handle error
}

// subscribing to a message topic
// both a single topic or an array of topics are supported
try {
  await MqttClient.subscribeAsync([
    {
      topic: 'first/topic',
      qos: 2, // Quality of Service
    },
    {
      topic: 'second/topic',
      qos: 1,
    },
  ]);
} catch (e: any) {
  // handle error
}

// unsubscribing from a message topic
// both a single topic string or an array of topic strings are supported
try {
  await MqttClient.unsubscribeAsync('first/topic');
} catch (e: any) {
  // handle error
}

// publishing a message
try {
  await MqttClient.publishAsync(
    'first/topic',
    Buffer.from('This is a test message!'),
    0, // Quality of service
    false // whether the message should be retained
  );
} catch (e: any) {
  // handle error
}

// checking client connection
const isConnected = await MqttClient.isConnected();

// shutting down client
try {
  await MqttClient.endAsync();
} catch (e: any) {
  // handle error
}
```

### Quito Options

Use the QuitoOptionsBuilder to generate a config for the Quito MQTT client. The following options for configuring the Quito MQTT client are available:

- `clientId`: _string_ - Identifier used in the communication with the MQTT bromker
- `username`: _string_ - Username used to authenticate the client against the broker
- `password`: _string_ - Password used to authenticate the client against the broker
- `keepaliveSec`: _number_ - Maximum time interval in seconds between control packets
- `connectTimeoutMs`: _number_ - Maximum time interval the client will wait for the network connection to the MQTT broker to be established
- `will`: _Will_ - MQTT message that the broker will send, should the client connect ungracefully.
  - `topic`: _string_ - Topic the will will be published to
  - `payload`: _string_ - Message of the will Base64-encoded
  - `qos`: _QoS_ - quality of service of the will
  - `retain`: _boolean_ - Indicates whether the will should be retained
- `tls`: _boolean_ - Whether the client will secure the connection to the broker using TLS. Depending on the host platform, the options vary.
  - **On Android**: If `tls == true`, at least the broker's CA certificate `android_caBase64` is required. If the broker expects the client to present a certificate as well, the shared `android_caBase64` plus `android_certificateBase64`, `keyStoreKey`, and `keyStorePassword` options become mandatory
  - **On iOS**: If `tls == true` and no `ios_certKeyP12Base64` is provided, broker certificates will not be validated. If `tls == true` and `ios_certKeyP12Base64` is provided, the client wil authenticate using the contained crypto.
- `ios_certKeyP12Base64`: _String_ - Base64-encoded PKCS12 archive containing client certificate and key
- `android_caBase64`: _String_ - Base64-encoded CA certificate (DER) used by the MQTT broker
- `android_certificateBase64`: _String_ - Base64-encoded self-signed X509 certificate (DER) of the client
- `android_privateKeyBase64`: _string_ - Base64-encoded RSA private key of the client
- `keyStorePassword`: _string_ - Password used in creating the client's keystore
- `cleanSession`: _boolean_ - When set to `true`, the broker will open a non-persistent connection, during which it will not store any subscription information or undelivered messages for the client
- `protocol`: _Protocol_ - Identifies the protocol used in the connection to the broker
- `protocolVersion`: _number_ - Identies the MQTT version used in the connection to the broker
- `reconnectPeriod`: _number_ - Time interval to elapse before a client will attempt to reconnect an unexpectedly disconnected client
- `host`: _string_ - Host name of the MQTT broker to connect to
- `port`: _number_ - Port number of the MQTT broker to connect to