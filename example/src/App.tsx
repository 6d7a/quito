import * as React from 'react';
import { Buffer } from 'buffer';

import { SafeAreaView, Text, TextInput, Button } from 'react-native';
import {
  Protocol,
  Quito,
  QuitoEvent,
  QuitoOptions,
  QuitoOptionsBuilder,
} from 'quito';

export default function App() {
  const [mqttClient, setMqttClient] = React.useState<Quito>();
  const [message, setMessage] = React.useState('');
  const [log, setLog] = React.useState('');

  const [toPublish, setToPublish] = React.useState({ topic: '', payload: '' });
  const [toSubscribeTo, setToSubscribeTo] = React.useState('');
  const [toUnsubscribeFrom, setToUnsubscribeFrom] = React.useState('');

  const optionsBuilder = React.useRef(new QuitoOptionsBuilder());
  const [brokerUri, setBrokerUri] = React.useState(
    'tcp://test.mosquitto.org:1883'
  );
  const [options, setOptions] = React.useState<QuitoOptions>({
    host: 'test.mosquitto.org',
    port: 1883,
    protocol: Protocol.TCP,
    clientId: 'quito-example',
    keepaliveSec: 60,
    connectTimeoutMs: 60000,
    caBase64:
      'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVBekNDQXV1Z0F3SUJBZ0lVQlkxaGxDR3ZkajROaEJYa1ovdUxVWk5JTEF3d0RRWUpLb1pJaHZjTkFRRUwKQlFBd2daQXhDekFKQmdOVkJBWVRBa2RDTVJjd0ZRWURWUVFJREE1VmJtbDBaV1FnUzJsdVoyUnZiVEVPTUF3RwpBMVVFQnd3RlJHVnlZbmt4RWpBUUJnTlZCQW9NQ1UxdmMzRjFhWFIwYnpFTE1Ba0dBMVVFQ3d3Q1EwRXhGakFVCkJnTlZCQU1NRFcxdmMzRjFhWFIwYnk1dmNtY3hIekFkQmdrcWhraUc5dzBCQ1FFV0VISnZaMlZ5UUdGMFkyaHYKYnk1dmNtY3dIaGNOTWpBd05qQTVNVEV3TmpNNVdoY05NekF3TmpBM01URXdOak01V2pDQmtERUxNQWtHQTFVRQpCaE1DUjBJeEZ6QVZCZ05WQkFnTURsVnVhWFJsWkNCTGFXNW5aRzl0TVE0d0RBWURWUVFIREFWRVpYSmllVEVTCk1CQUdBMVVFQ2d3SlRXOXpjWFZwZEhSdk1Rc3dDUVlEVlFRTERBSkRRVEVXTUJRR0ExVUVBd3dOYlc5emNYVnAKZEhSdkxtOXlaekVmTUIwR0NTcUdTSWIzRFFFSkFSWVFjbTluWlhKQVlYUmphRzl2TG05eVp6Q0NBU0l3RFFZSgpLb1pJaHZjTkFRRUJCUUFEZ2dFUEFEQ0NBUW9DZ2dFQkFNRTBIS21JemZUT3drS0xUM1RISGUrT2JkaXphbVBnClVabUQ2NFRmM3pKZE5lWUdZbjRDRVhieVA2ZnkzdFdjOFMyYm9XNmR6ckg4U2RGZjl1bzMyMEdKQTlCN1UxRlcKVGUzeGRhL0xtM0pGZmFIamtXdzdqQndjYXVRWmpwR0lOSGFwSFJscGlDWnNxdUF0aE9neFc5U2dEZ1lsR3pFQQpzMDZwa0VGaU13K3FEZkxvL3N4RktCNnZRbEZla01lQ3ltakxDYk53UEp5cXloRm1QV3dpby9QRE1ydUJUelBICjNjaW9CbnJKV0tYYzNPalhkTEdGSk9majdwUDBqL2RyMkxINzJlU3Z2M1BRUUZsOTBDWlBGaHJDVWNSSFNTeG8KRTZ5akdPZG56N2Y2UHZlTElCNTc0a1FPUnd0OGVQbjB5aWRyVEMxaWN0aWtFRDNuSFloTVVPVUNBd0VBQWFOVApNRkV3SFFZRFZSME9CQllFRlBWVjZ4QlVGUGlHS0R5bzVWMytIYmg0TjlZU01COEdBMVVkSXdRWU1CYUFGUFZWCjZ4QlVGUGlHS0R5bzVWMytIYmg0TjlZU01BOEdBMVVkRXdFQi93UUZNQU1CQWY4d0RRWUpLb1pJaHZjTkFRRUwKQlFBRGdnRUJBR2E5a1MyMU43MFRoTTYvSGo5RDdtYlZ4S0xCalZXZTJUUHNHZmJsM3JFRGZaK09LUloyajZBQwo2cjdqYjRUWk8zZHpGMnA2ZGdicmxVNzFZLzRLMFRkeklqUmozY1EzS1NtNDFKdlVRMGhaL2MwNGlHRGcveFdmCitwcDU4bmZQQVl3dWVycnVQTldtbFN0V0FYZjBVVHFSdGc0aFFEV0J1VUZESlR1V3V1QnZFWHVkejc0ZWgvd0sKc013ZnUxSEZ2ank1WjBpTURVOFBVRGVwalZvbE9DdWU5YXNobFM0RUI1SUVDZFNSMlRJdG5BSWlJd2lteDgzOQpMZFVkUnVkYWZNdTVUNVhtYTE4Mk9DMC91L3hSbEVtK3R2S0dHbWZGY04wcGlxVmw4T3JTUEJnSWxiKzFJS0pFCm0vWHJpV3IvQ3E0aC9KZkI3TlRzZXpWc2xna0Jhb1U9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0=',
  });

  React.useEffect(() => {
    mqttClient?.end();

    const client = new Quito(options);

    client
      .init()
      .then(() => {
        client.on(QuitoEvent.CONNECTION_LOST, (msg, code, trace) => {
          setLog(`Error code ${code}: ${msg}\n${trace}`);
        });

        client.on(QuitoEvent.MESSAGE_RECEIVED, (topic, message) => {
          setMessage(`TOPIC "${topic}" ---> ${message}`);
        });

        client
          .connectAsync()
          .then(() => {
            client
              .subscribeAsync({ topic: 'quito/test', qos: 0 })
              .then(() => {
                setMqttClient(client);
              })
              .catch((e) => setLog(e.message));
          })
          .catch((e) => setLog(e.message));
      })
      .catch((e) => setLog(e.message));
  }, [options]);

  return (
    <SafeAreaView style={{ padding: 20 }}>
      <Text>Example App: Incoming messages will be printed below</Text>

      <Text testID="messageOutput">Message: {message}</Text>
      <Text testID="logOutput">Logs: {log}</Text>
      <TextInput
        testID="publishTopicInput"
        multiline
        placeholder="topic"
        numberOfLines={1}
        onChangeText={(text) => setToPublish({ ...toPublish, topic: text })}
        value={toPublish.topic}
        style={{ padding: 10 }}
      />
      <TextInput
        testID="publishMsgInput"
        multiline
        placeholder="message"
        numberOfLines={1}
        onChangeText={(text) => setToPublish({ ...toPublish, payload: text })}
        value={toPublish.payload}
        style={{ padding: 10 }}
      />
      <Button
        testID='sendButton'
        title={'send'}
        onPress={() => {
          mqttClient?.publishAsync(
            toPublish.topic,
            Buffer.from(toPublish.payload, 'utf-8')
          );
        }}
      />
      <TextInput
        testID='subscribeInput'
        multiline
        placeholder="topic to subscribe to"
        numberOfLines={1}
        onChangeText={(text) => setToSubscribeTo(text)}
        value={toSubscribeTo}
        style={{ padding: 10 }}
      />
      <Button
        testID='subscribeButton'
        title={'subscribe to'}
        onPress={() => {
          mqttClient
            ?.subscribeAsync({ topic: toSubscribeTo, qos: 0 })
            .catch((err) => setLog(err));
        }}
      />
      <TextInput
        testID='unsubscribeInput'
        multiline
        placeholder="topic to unsubscribe from"
        numberOfLines={1}
        onChangeText={(text) => setToUnsubscribeFrom(text)}
        value={toUnsubscribeFrom}
        style={{ padding: 10 }}
      />
      <Button
        testID='unsubscribeButton'
        title={'unsubscribe from'}
        onPress={() => {
          mqttClient
            ?.unsubscribeAsync(toUnsubscribeFrom)
            .catch((err) => setLog(err));
        }}
      />
      <TextInput
        testID='brokerUriInput'
        onChangeText={(text) => setBrokerUri(text)}
        value={brokerUri}
        style={{ padding: 10 }}
      />
      <Button
        testID='configUpdateButton'
        title={'update quito config'}
        onPress={() =>
          setOptions(optionsBuilder.current.uri(brokerUri).build())
        }
      />
    </SafeAreaView>
  );
}
