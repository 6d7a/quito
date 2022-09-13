import * as React from 'react';
import { Buffer } from 'buffer';

import { SafeAreaView, Text, TextInput, Button } from 'react-native';
import { Quito, QuitoEvent, QuitoOptionsBuilder } from 'quito';

export default function App() {
  const [mqttClient, setMqttClient] = React.useState<Quito>();
  const [message, setMessage] = React.useState('');
  const [log, setLog] = React.useState('');
  const [toPublish, setToPublish] = React.useState('');

  React.useEffect(() => {
    const config = new QuitoOptionsBuilder()
      .uri('tcp://test.mosquitto.org:1883')
      .clientId('quito-example')
      .tls(false)
      .keepalive(60)
      .connectTimeoutMs(60000)
      .ca(
        Buffer.from(
          'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVBekNDQXV1Z0F3SUJBZ0lVQlkxaGxDR3ZkajROaEJYa1ovdUxVWk5JTEF3d0RRWUpLb1pJaHZjTkFRRUwKQlFBd2daQXhDekFKQmdOVkJBWVRBa2RDTVJjd0ZRWURWUVFJREE1VmJtbDBaV1FnUzJsdVoyUnZiVEVPTUF3RwpBMVVFQnd3RlJHVnlZbmt4RWpBUUJnTlZCQW9NQ1UxdmMzRjFhWFIwYnpFTE1Ba0dBMVVFQ3d3Q1EwRXhGakFVCkJnTlZCQU1NRFcxdmMzRjFhWFIwYnk1dmNtY3hIekFkQmdrcWhraUc5dzBCQ1FFV0VISnZaMlZ5UUdGMFkyaHYKYnk1dmNtY3dIaGNOTWpBd05qQTVNVEV3TmpNNVdoY05NekF3TmpBM01URXdOak01V2pDQmtERUxNQWtHQTFVRQpCaE1DUjBJeEZ6QVZCZ05WQkFnTURsVnVhWFJsWkNCTGFXNW5aRzl0TVE0d0RBWURWUVFIREFWRVpYSmllVEVTCk1CQUdBMVVFQ2d3SlRXOXpjWFZwZEhSdk1Rc3dDUVlEVlFRTERBSkRRVEVXTUJRR0ExVUVBd3dOYlc5emNYVnAKZEhSdkxtOXlaekVmTUIwR0NTcUdTSWIzRFFFSkFSWVFjbTluWlhKQVlYUmphRzl2TG05eVp6Q0NBU0l3RFFZSgpLb1pJaHZjTkFRRUJCUUFEZ2dFUEFEQ0NBUW9DZ2dFQkFNRTBIS21JemZUT3drS0xUM1RISGUrT2JkaXphbVBnClVabUQ2NFRmM3pKZE5lWUdZbjRDRVhieVA2ZnkzdFdjOFMyYm9XNmR6ckg4U2RGZjl1bzMyMEdKQTlCN1UxRlcKVGUzeGRhL0xtM0pGZmFIamtXdzdqQndjYXVRWmpwR0lOSGFwSFJscGlDWnNxdUF0aE9neFc5U2dEZ1lsR3pFQQpzMDZwa0VGaU13K3FEZkxvL3N4RktCNnZRbEZla01lQ3ltakxDYk53UEp5cXloRm1QV3dpby9QRE1ydUJUelBICjNjaW9CbnJKV0tYYzNPalhkTEdGSk9majdwUDBqL2RyMkxINzJlU3Z2M1BRUUZsOTBDWlBGaHJDVWNSSFNTeG8KRTZ5akdPZG56N2Y2UHZlTElCNTc0a1FPUnd0OGVQbjB5aWRyVEMxaWN0aWtFRDNuSFloTVVPVUNBd0VBQWFOVApNRkV3SFFZRFZSME9CQllFRlBWVjZ4QlVGUGlHS0R5bzVWMytIYmg0TjlZU01COEdBMVVkSXdRWU1CYUFGUFZWCjZ4QlVGUGlHS0R5bzVWMytIYmg0TjlZU01BOEdBMVVkRXdFQi93UUZNQU1CQWY4d0RRWUpLb1pJaHZjTkFRRUwKQlFBRGdnRUJBR2E5a1MyMU43MFRoTTYvSGo5RDdtYlZ4S0xCalZXZTJUUHNHZmJsM3JFRGZaK09LUloyajZBQwo2cjdqYjRUWk8zZHpGMnA2ZGdicmxVNzFZLzRLMFRkeklqUmozY1EzS1NtNDFKdlVRMGhaL2MwNGlHRGcveFdmCitwcDU4bmZQQVl3dWVycnVQTldtbFN0V0FYZjBVVHFSdGc0aFFEV0J1VUZESlR1V3V1QnZFWHVkejc0ZWgvd0sKc013ZnUxSEZ2ank1WjBpTURVOFBVRGVwalZvbE9DdWU5YXNobFM0RUI1SUVDZFNSMlRJdG5BSWlJd2lteDgzOQpMZFVkUnVkYWZNdTVUNVhtYTE4Mk9DMC91L3hSbEVtK3R2S0dHbWZGY04wcGlxVmw4T3JTUEJnSWxiKzFJS0pFCm0vWHJpV3IvQ3E0aC9KZkI3TlRzZXpWc2xna0Jhb1U9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0=',
          'base64'
        )
      )
      .build();
    const client = new Quito(config);

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
  }, []);

  return (
    <SafeAreaView style={{padding: 20}}>
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
          mqttClient?.publishAsync('quito/test', toPublish);
        }}
      />
    </SafeAreaView>
  );
}
