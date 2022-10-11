import { mockQuitoNative } from './__mocks__/QuitoNative.mock';
import { mockEmitter } from './__mocks__/NativeEventEmitter.mock';

jest.mock('../models/NativeQuito', () => ({
  QuitoNative: mockQuitoNative,
  QuitoEventEmitter: () => mockEmitter,
}));

import { Protocol, Quito, QuitoOptions } from '../index';
import type { QuitoSubscription } from 'src/models/QuitoSubscription';

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

describe('connection', () => {
  let quito: Quito;

  beforeEach(done => {
    quito = new Quito({
      clientId: 'test-client-23f78ee01a',
      host: 'test.mosquitto.org',
      port: 8080,
      protocol: Protocol.WS,
    });
    quito.init().then(done)
  });

  afterEach(() => {
    mockQuitoNative.resetMock()
  })

  it("passes a connection prompt to native Quito", () => {
    expect(mockQuitoNative.connectionState).toBe(false)
    quito.connect()
    expect(mockQuitoNative.connectionState).toBe(true)
  })

  it("passes an async connection prompt to native Quito", done => {
    expect(mockQuitoNative.connectionState).toBe(false)
    quito.connectAsync().then(() => {
      expect(mockQuitoNative.connectionState).toBe(true)
      done()
    })
  })

  it("passes a disconnect prompt to native Quito", () => {
    mockQuitoNative.connectionState = true
    quito.disconnect()
    expect(mockQuitoNative.connectionState).toBe(false)
  })

  it("passes an async connection prompt to native Quito", done => {
    mockQuitoNative.connectionState = true
    quito.disconnectAsync().then(() => {
      expect(mockQuitoNative.connectionState).toBe(false)
      done()
    })
  })

  it("passes on subscription to one topic", () => {
    const sub: QuitoSubscription = {topic: "first/topic/#", qos: 0}
    quito.subscribe(sub)
    expect(mockQuitoNative.subscriptions).toEqual([sub])
  })

  it("passes on async subscription to one topic", done => {
    const sub: QuitoSubscription = {topic: "first/topic/#", qos: 0}
    quito.subscribeAsync(sub).then(() => {
      expect(mockQuitoNative.subscriptions).toEqual([sub])
      done()
    })
  })

  it("passes on subscription to an array of topics", () => {
    const subs: QuitoSubscription[] = [{topic: "first/topic/#", qos: 0},{topic: "second/topic/#", qos: 2}]
    quito.subscribe(...subs)
    expect(mockQuitoNative.subscriptions).toEqual(subs)
  })

  it("passes on async subscription to an array of topics", done => {
    const subs: QuitoSubscription[] = [{topic: "first/topic/#", qos: 0},{topic: "second/topic/#", qos: 2}]
    quito.subscribeAsync(...subs).then(() => {
      expect(mockQuitoNative.subscriptions).toEqual(subs)
      done()
    })
  })
});
