import { mockQuitoNative } from './__mocks__/QuitoNative.mock';
import { mockEmitter } from './__mocks__/NativeEventEmitter.mock';

jest.mock('../models/NativeQuito', () => ({
  QuitoNative: mockQuitoNative,
  QuitoEventEmitter: () => mockEmitter,
}));

import { Protocol, Quito, QuitoEvent, QuitoOptions } from '../index';
import { QuitoEventParam } from '../models/events/QuitoEventParam';
import type { QuitoSubscription } from '../models/QuitoSubscription';

describe('instantiate native Quito', () => {
  it('instantiates a Quito instance with mocks', () => {
    const quito = new Quito({});
    expect((quito as any)._eventEmitter.isTestEventEmitter).toBeTruthy();
  });

  it('creates a native Quito client with given options', (done) => {
    const options: QuitoOptions = {
      clientId: 'test-client-23f78ee01a',
      host: 'test.mosquitto.org',
      port: 8080,
      protocol: Protocol.WS,
    };
    const quito = new Quito(options);
    expect(mockQuitoNative.options).toBeUndefined();
    quito.init().then(() => {
      expect(mockQuitoNative.options).toEqual(options);
      done();
    });
  });
});

describe('connect, subscribe, publish', () => {
  let quito: Quito;

  beforeEach((done) => {
    quito = new Quito({
      clientId: 'test-client-23f78ee01a',
      host: 'test.mosquitto.org',
      port: 8080,
      protocol: Protocol.WS,
    });
    quito.init().then(done);
  });

  afterEach(() => {
    mockQuitoNative.resetMock();
    mockEmitter.resetMock();
  });

  it('passes a connection prompt to native Quito', () => {
    expect(mockQuitoNative.connectionState).toBe(false);
    quito.connect();
    expect(mockQuitoNative.connectionState).toBe(true);
  });

  it('passes an async connection prompt to native Quito', (done) => {
    expect(mockQuitoNative.connectionState).toBe(false);
    quito.connectAsync().then(() => {
      expect(mockQuitoNative.connectionState).toBe(true);
      done();
    });
  });

  it('passes a reconnection prompt to native Quito', () => {
    expect(mockQuitoNative.connectionState).toBe(false);
    quito.reconnect();
    expect(mockQuitoNative.connectionState).toBe(true);
  });

  it('passes a disconnect prompt to native Quito', () => {
    mockQuitoNative.connectionState = true;
    quito.disconnect();
    expect(mockQuitoNative.connectionState).toBe(false);
  });

  it('passes an async connection prompt to native Quito', (done) => {
    mockQuitoNative.connectionState = true;
    quito.disconnectAsync().then(() => {
      expect(mockQuitoNative.connectionState).toBe(false);
      done();
    });
  });

  it('passes on subscription to one topic', () => {
    const sub: QuitoSubscription = { topic: 'first/topic/#', qos: 0 };
    quito.subscribe(sub);
    expect(mockQuitoNative.subscriptions).toEqual([sub]);
  });

  it('passes on async subscription to one topic', (done) => {
    const sub: QuitoSubscription = { topic: 'first/topic/#', qos: 0 };
    quito.subscribeAsync(sub).then(() => {
      expect(mockQuitoNative.subscriptions).toEqual([sub]);
      done();
    });
  });

  it('passes on subscription to an array of topics', () => {
    const subs: QuitoSubscription[] = [
      { topic: 'first/topic/#', qos: 0 },
      { topic: 'second/topic/#', qos: 2 },
    ];
    quito.subscribe(...subs);
    expect(mockQuitoNative.subscriptions).toEqual(subs);
  });

  it('passes on async subscription to an array of topics', (done) => {
    const subs: QuitoSubscription[] = [
      { topic: 'first/topic/#', qos: 0 },
      { topic: 'second/topic/#', qos: 2 },
    ];
    quito.subscribeAsync(...subs).then(() => {
      expect(mockQuitoNative.subscriptions).toEqual(subs);
      done();
    });
  });

  it('passes on unsubscription from one topic', () => {
    const sub: QuitoSubscription = { topic: 'first/topic/#', qos: 0 };
    mockQuitoNative.subscriptions.push(sub);
    quito.unsubscribe(sub.topic);
    expect(mockQuitoNative.subscriptions).toEqual([]);
  });

  it('passes on async subscription to one topic', (done) => {
    const sub: QuitoSubscription = { topic: 'first/topic/#', qos: 0 };
    mockQuitoNative.subscriptions.push(sub);
    quito.unsubscribeAsync(sub.topic).then(() => {
      expect(mockQuitoNative.subscriptions).toEqual([]);
      done();
    });
  });

  it('passes on subscription to an array of topics', () => {
    const subs: QuitoSubscription[] = [
      { topic: 'first/topic/#', qos: 0 },
      { topic: 'second/topic/#', qos: 2 },
    ];
    mockQuitoNative.subscriptions.push(...subs);
    quito.unsubscribe(subs.map((s) => s.topic));
    expect(mockQuitoNative.subscriptions).toEqual([]);
  });

  it('passes on async subscription to an array of topics', (done) => {
    const subs: QuitoSubscription[] = [
      { topic: 'first/topic/#', qos: 0 },
      { topic: 'second/topic/#', qos: 2 },
    ];
    mockQuitoNative.subscriptions.push(...subs);
    quito.unsubscribeAsync(subs.map((s) => s.topic)).then(() => {
      expect(mockQuitoNative.subscriptions).toEqual([]);
      done();
    });
  });

  it('forwards a message to publish', () => {
    quito.publish('test/topic', Buffer.from('Test', 'utf-8'), {
      retain: false,
      qos: 0,
    });
    expect(mockQuitoNative.publishedMessages).toEqual([
      {
        topic: 'test/topic',
        payloadBase64: 'VGVzdA==',
        publishOptions: { retain: false, qos: 0 },
      },
    ]);
  });

  it('asynchronously forwards a message to publish', (done) => {
    quito
      .publishAsync('test/topic', Buffer.from('Test', 'utf-8'), {
        retain: false,
        qos: 0,
      })
      .then(() => {
        expect(mockQuitoNative.publishedMessages).toEqual([
          {
            topic: 'test/topic',
            payloadBase64: 'VGVzdA==',
            publishOptions: { retain: false, qos: 0 },
          },
        ]);
        done();
      });
  });

  it('shuts down a Quito client', () => {
    mockQuitoNative.connectionState = true;
    quito.end();
    expect(mockQuitoNative.connectionState).toBe(false);
  });

  it('asynchronously shuts down a Quito client', (done) => {
    mockQuitoNative.connectionState = true;
    quito.endAsync().then(() => {
      expect(mockQuitoNative.connectionState).toBe(false);
      done();
    });
  });

  it('closes a Quito client', () => {
    mockQuitoNative.connectionState = true;
    quito.close();
    expect(mockQuitoNative.connectionState).toBe(false);
  });

  it('asynchronously closes a Quito client', (done) => {
    mockQuitoNative.connectionState = true;
    quito.closeAsync().then(() => {
      expect(mockQuitoNative.connectionState).toBe(false);
      done();
    });
  });

  it("reports the native client's connection state", (done) => {
    quito.isConnected().then((connected) => {
      expect(connected).toBe(false);
      mockQuitoNative.connectionState = true;
      quito.isConnected().then((connected) => {
        expect(connected).toBe(true);
        done();
      });
    });
  });
});

describe('events', () => {
  const baseParams = { [QuitoEventParam.CLIENT_REF]: 'test-client' };

  let quito: Quito;

  beforeEach((done) => {
    quito = new Quito({
      clientId: 'test-client-23f78ee01a',
      host: 'test.mosquitto.org',
      port: 8080,
      protocol: Protocol.WS,
    });
    quito.init().then(done);
  });

  afterEach(() => {
    mockQuitoNative.resetMock();
    mockEmitter.resetMock();
  });

  it('discards event if clientRef does not match', () => {
    quito.on(QuitoEvent.CONNECTING, () => {
      throw Error('');
    });
    mockEmitter.triggerEvent(QuitoEvent.CONNECTING, {
      [QuitoEventParam.CLIENT_REF]: 'unknown-client',
    });
  });

  it('calls connecting callback', (done) => {
    quito.on(QuitoEvent.CONNECTING, done);
    mockEmitter.triggerEvent(QuitoEvent.CONNECTING, baseParams);
  });

  it('calls connected callback', (done) => {
    quito.on(QuitoEvent.CONNECTED, done);
    mockEmitter.triggerEvent(QuitoEvent.CONNECTED, baseParams);
  });

  it('calls connectionLost callback', (done) => {
    const reason = {
      [QuitoEventParam.ERR_MESSAGE]: 'Error Message',
      [QuitoEventParam.ERR_CODE]: 99,
      [QuitoEventParam.STACKTRACE]: 'Stack\tTrace',
    };
    quito.on(
      QuitoEvent.CONNECTION_LOST,
      (errMsg?: string, errCode?: number, stackTrace?: string) => {
        expect(errMsg).toBe(reason[QuitoEventParam.ERR_MESSAGE]);
        expect(errCode).toBe(reason[QuitoEventParam.ERR_CODE]);
        expect(stackTrace).toBe(reason[QuitoEventParam.STACKTRACE]);
        done();
      }
    );
    mockEmitter.triggerEvent(QuitoEvent.CONNECTION_LOST, {
      ...baseParams,
      ...reason,
    });
  });

  it('calls subscribed callback', (done) => {
    const sub = { topic: 'test/topic/#', qos: 0 };
    quito.on(QuitoEvent.SUBSCRIBED, (topic: string) => {
      expect(topic).toBe(sub.topic);
      done();
    });
    mockEmitter.triggerEvent(QuitoEvent.SUBSCRIBED, {
      ...baseParams,
      [QuitoEventParam.TOPIC]: sub.topic,
    });
  });

  it('calls unsubscribed callback', (done) => {
    const sub = { topic: 'test/topic/#', qos: 0 };
    quito.on(QuitoEvent.UNSUBSCRIBED, (topic: string) => {
      expect(topic).toBe(sub.topic);
      done();
    });
    mockEmitter.triggerEvent(QuitoEvent.UNSUBSCRIBED, {
      ...baseParams,
      [QuitoEventParam.TOPIC]: sub.topic,
    });
  });

  it('calls message received callback', (done) => {
    const msg = { topic: 'test/topic/#', payload: Uint8Array.from(Buffer.from("Test", "utf-8")) };
    quito.on(QuitoEvent.MESSAGE_RECEIVED, (topic: string, payload: Uint8Array) => {
      console.log(topic, payload)
      expect(topic).toBe(msg.topic);
      expect(payload).toStrictEqual(msg.payload);
      done();
    });
    mockEmitter.triggerEvent(QuitoEvent.MESSAGE_RECEIVED, {
      ...baseParams,
      [QuitoEventParam.TOPIC]: msg.topic,
      [QuitoEventParam.PAYLOAD]: "VGVzdA=="
    });
  });

  it('calls message published callback', (done) => {
    const msg = { topic: 'test/topic/#', payload: Uint8Array.from(Buffer.from("Test", "utf-8")) };
    quito.on(QuitoEvent.MESSAGE_PUBLISHED, (topic: string, payload: Uint8Array) => {
      console.log(topic, payload)
      expect(topic).toBe(msg.topic);
      expect(payload).toStrictEqual(msg.payload);
      done();
    });
    mockEmitter.triggerEvent(QuitoEvent.MESSAGE_PUBLISHED, {
      ...baseParams,
      [QuitoEventParam.TOPIC]: msg.topic,
      [QuitoEventParam.PAYLOAD]: "VGVzdA=="
    });
  });

  it('calls disconnected callback', (done) => {
    quito.on(QuitoEvent.DISCONNECTED, done);
    mockEmitter.triggerEvent(QuitoEvent.DISCONNECTED, baseParams);
  });

  it('calls closed callback', (done) => {
    quito.on(QuitoEvent.CLOSED, done);
    mockEmitter.triggerEvent(QuitoEvent.CLOSED, baseParams);
  });

  it('calls exception callback', (done) => {
    const reason = {
      [QuitoEventParam.ERR_MESSAGE]: 'Error Message',
      [QuitoEventParam.ERR_CODE]: 99,
      [QuitoEventParam.STACKTRACE]: 'Stack\tTrace',
    };
    quito.on(
      QuitoEvent.EXCEPTION,
      (errMsg?: string, errCode?: number, stackTrace?: string) => {
        expect(errMsg).toBe(reason[QuitoEventParam.ERR_MESSAGE]);
        expect(errCode).toBe(reason[QuitoEventParam.ERR_CODE]);
        expect(stackTrace).toBe(reason[QuitoEventParam.STACKTRACE]);
        done();
      }
    );
    mockEmitter.triggerEvent(QuitoEvent.EXCEPTION, {
      ...baseParams,
      ...reason,
    });
  });
});
