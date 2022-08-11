# RN-MQTT

A TCP-capable MQTT client for React Native. The module provides a Typescript API for native MQTT clients on iOS and Android.

- on Android, rn-mqtt relies on [Paho](https://www.eclipse.org/paho/index.php?page=clients/java/index.php)
- ~~on iOS, rn-mqtt uses [CocoaMQTT](https://github.com/emqx/CocoaMQTT)~~

The module provides both promise- and callback-based methods to interact with the native clients.

## Installation

```sh
npm install rn-mqtt
```

To make an unencrypted connection to an MQTT broker, make sure a consuming android application allows cleartext traffic, either generally by setting the _android:usesCleartextTraffic_ flag in the application field of the AndroidManifest.xml, or by adding a [security configuration](https://developer.android.com/training/articles/security-config).

## Usage

The module provides promise- and callback-based methods to interact with the native clients.

#### Callback-based usage

```typescript
import { RnMqtt } from 'rn-mqtt';

const MqttClient = new RnMqtt({
  clientId: 'my-mqtt-client-over-tcp',
  uri: 'mqtt://test.mosquitto.org:1883',
  host: 'test.mosquitto.org', // optional, will be read from uri string if not provided, or default to "localhost"
  port: 1883, // optional, will be read from uri string if not provided, or default to 1883
  protocol: 'mqtt', // optional, will be read from uri string if not provided, or default to "tcp"
  keepalive: 60, // optional, defaults to 60s
  protocolLevel: 4, // optional, defaults to 4
  clean: true, // optional, defaults to true
});

MqttClient.init() // call init() to create native client and set up native event listeners
  .then(() => {
    // Subscribing to event callbacks
    MqttClient.on(RnMqttEvent.CONNECTING, () => {
      // called when client is connecting
    });
    MqttClient.on(RnMqttEvent.CONNECTED, () => {
      // called when client is connected
    });
    MqttClient.on(RnMqttEvent.SUBSCRIBED, (topic: string) => {
      // called when client has subscribed to a topic
    });
    MqttClient.on(RnMqttEvent.UNSUBSCRIBED, (topic: string) => {
      // called when client has unsubscribed from a topic
    });
    MqttClient.on(RnMqttEvent.MESSAGE_RECEIVED, (topic: string, payload: Buffer) => {
      // called when client has received a message
    });
    MqttClient.on(RnMqttEvent.MESSAGE_PUBLISHED, () => {
      // called when client has sent a message
    });
    MqttClient.on(RnMqttEvent.DISCONNECTED, () => {
      // called when client has disconnected
    });
    MqttClient.on(RnMqttEvent.CONNECTION_LOST, (error?: Error) => {
      // called when client has unexpectedly lost its connection to the broker
    });
    MqttClient.on(RnMqttEvent.EXCEPTION, (error: Error) => {
      // called when client encountered an error
    });
    MqttClient.on(RnMqttEvent.CLOSED, (error?: Error) => {
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
    MqttClient.unsubsctibe('first/topic');

    // publishing a message
    MqttClient.publish(
      'first/topic',
      'This is a test message',
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
import { RnMqtt } from 'rn-mqtt';

const MqttClient = new RnMqtt({
  clientId: 'my-mqtt-client-over-tcp',
  uri: 'mqtt://test.mosquitto.org:1883',
  host: 'test.mosquitto.org', // optional, will be read from uri string if not provided, or default to "localhost"
  port: 1883, // optional, will be read from uri string if not provided, or default to 1883
  protocol: 'mqtt', // optional, will be read from uri string if not provided, or default to "tcp"
  keepalive: 60, // optional, defaults to 60s
  protocolLevel: 4, // optional, defaults to 4
  clean: true, // optional, defaults to true
});

await MqttClient.init(); // call init() to create native client and set up native event listeners

// Most message callbacks are redundant 
// when using the Promise-based API
MqttClient.on(RnMqttEvent.MESSAGE_RECEIVED, (topic: string, payload: Buffer) => {
  // called when client has received a message
});
MqttClient.on(RnMqttEvent.CONNECTION_LOST, (error?: Error) => {
  // called when client has unexpectedly lost its connection to the broker
});
MqttClient.on(RnMqttEvent.EXCEPTION, (error: Error) => {
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
    'This is a test message',
    0, // Quality of service
    false // whether the message should be retained
  );
} catch (e: any) {
  // handle error
}

// checking client connection
const isConnected = await MqttClient.isConnected()

// shutting down client
try {
  await MqttClient.endAsync();
} catch (e: any) {
  // handle error
}
```
