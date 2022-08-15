import * as React from 'react';

import { View, Text, TextInput, Button } from 'react-native';
import { RnMqtt, RnMqttEvent, Protocol } from 'rn-mqtt';

export default function App() {
  const [mqttClient, setMqttClient] = React.useState<RnMqtt>();
  const [message, setMessage] = React.useState('');
  const [log, setLog] = React.useState('');
  const [toPublish, setToPublish] = React.useState('');

  React.useEffect(() => {
    const client = new RnMqtt({
      host: 'test.mosquitto.org',
      port: 8884,
      protocol: Protocol.SSL,
      clientId: 'rn-mqtt-example',
      tls: true,
    });

    client
      .init()
      .then(() => {
        client.on(RnMqttEvent.CONNECTION_LOST, (msg, code, trace) => {
          setLog(`Error code ${code}: ${msg}\n${trace}`);
        });

        client.on(RnMqttEvent.MESSAGE_RECEIVED, (topic, message) => {
          setMessage(`TOPIC "${topic}" ---> ${message}`);
        });

        client
          .connectAsync()
          .then(() => {
            client
              .subscribeAsync({ topic: 'rn-mqtt/test', qos: 0 })
              .then(() => {
                setMqttClient(client);
              })
              .catch((e) => setLog(e.message));
          })
          .catch((e) => setLog(e.message));
      })
      .catch((e) => setLog(e.message));
  }, []);

  return (
    <View>
      <Text>Example App: Incoming messages will be printed below</Text>
      <Text>Message: {message}</Text>
      <Text>Logs: {log}</Text>
      <TextInput
        multiline
        numberOfLines={1}
        onChangeText={(text) => setToPublish(text)}
        value={toPublish}
        style={{ padding: 10 }}
      />
      <Button
        title={'send'}
        onPress={() => {
          mqttClient?.publishAsync('rn-mqtt/test', toPublish);
        }}
      />
    </View>
  );
}
