import { NativeModules, Platform, NativeEventEmitter } from 'react-native';
import type { RnMqttOptions } from './models/MqttOptions';
import type { MqttSubscription } from './models/MqttSubscription';
import type { PublishOptions } from './models/PublishOptions';
import { RnMqttEvent } from './models/rnevents/RnMqttEvent';
import { RnMqttEventParams } from './models/rnevents/RnMqttEventParams';
import { parseUri } from './utils/parseUri';

const LINKING_ERROR =
  `The package 'rn-mqtt' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const RnMqttModule = NativeModules.RnMqtt
  ? NativeModules.RnMqtt
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class RnMqtt {
  private _options: RnMqttOptions;
  private _clientRef?: string;
  private _eventHandler: any = {};
  private _eventEmitter = new NativeEventEmitter(RnMqttModule);

  constructor(options: RnMqttOptions) {
    const parsedUri = parseUri(options.brokerUri);
    this._options = {
      ...options,
      host: parsedUri.host,
      port: parsedUri.port,
      protocol: parsedUri.protocol,
    };
  }

  async init(): Promise<void> {
    this._clientRef = await RnMqttModule.createClient(this._options);
    this._setupEventListeners();
  }

  public on(event: RnMqttEvent.CONNECTED, cb: () => void): this;
  public on(event: RnMqttEvent.CONNECTING, cb: () => void): this;
  public on(
    event: RnMqttEvent.CONNECTION_LOST,
    cb: (errorMsg?: string, errorCode?: number, stackTrace?: string) => void
  ): this;
  public on(event: RnMqttEvent.SUBSCRIBED, cb: (topic: string) => void): this;
  public on(event: RnMqttEvent.UNSUBSCRIBED, cb: (topic: string) => void): this;
  public on(
    event: RnMqttEvent.MESSAGE_RECEIVED,
    cb: (topic: string, payloadAsUtf8: string) => void
  ): this;
  public on(
    event: RnMqttEvent.MESSAGE_PUBLISHED,
    cb: (topic: string, payloadAsUtf8: string) => void
  ): this;
  public on(event: RnMqttEvent.DISCONNECTED, cb: () => void): this;
  public on(
    event: RnMqttEvent.EXCEPTION,
    cb: (errorMsg?: string, errorCode?: number, stackTrace?: string) => void
  ): this;
  public on(event: RnMqttEvent.CLOSED, cb: () => void): this;
  public on(event: string, cb: Function): this {
    this._eventHandler[event] = cb;
    return this;
  }

  connect(): void {
    RnMqttModule.connect(this._clientRef);
  }

  async connectAsync(): Promise<void> {
    await RnMqttModule.connect(this._clientRef);
  }

  disconnect(): void {
    RnMqttModule.disconnect(this._clientRef);
  }

  async disconnectAsync(): Promise<void> {
    await RnMqttModule.disconnect(this._clientRef);
  }

  subscribe(topics: MqttSubscription[]): void {
    RnMqttModule.subscribe(topics, this._clientRef);
  }

  async subscribeAsync(topics: MqttSubscription[]): Promise<void> {
    await RnMqttModule.subscribe(topics, this._clientRef);
  }

  unsubscribe(topic: string | string[]): void {
    const readableTopics = Array.from([topic].flat());
    RnMqttModule.unsubscribe(readableTopics, this._clientRef);
  }

  async unsubscribeAsync(topic: string | string[]): Promise<void> {
    const readableTopics = Array.from([topic].flat());
    await RnMqttModule.unsubscribe(readableTopics, this._clientRef);
  }

  publish(
    topic: string,
    payloadAsHexString: string,
    options: PublishOptions
  ): void {
    RnMqttModule.publish(topic, payloadAsHexString, options, this._clientRef);
  }

  async publishAsync(
    topic: string,
    payloadAsHexString: string,
    options: PublishOptions
  ): Promise<void> {
    RnMqttModule.publish(topic, payloadAsHexString, options, this._clientRef);
  }

  reconnect(): void {
    RnMqttModule.reconnect(this._clientRef);
  }

  async isConnected(): Promise<boolean> {
    return await RnMqttModule.isConnected(this._clientRef);
  }

  end(force: Boolean = false): void {
    RnMqttModule.end(this._clientRef, force);
    this._removeEventListeners();
  }

  async endAsync(force: Boolean = false): Promise<void> {
    await RnMqttModule.end(this._clientRef, force);
    this._removeEventListeners();
  }

  close = this.end;
  closeAsync = this.endAsync;

  private _removeEventListeners(): void {
    this._eventEmitter.removeAllListeners(RnMqttEvent.CLIENT_REF_UNKNOWN);
    this._eventEmitter.removeAllListeners(RnMqttEvent.CONNECTED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.CONNECTING);
    this._eventEmitter.removeAllListeners(RnMqttEvent.CONNECTION_LOST);
    this._eventEmitter.removeAllListeners(RnMqttEvent.DELIVERY_COMPLETE);
    this._eventEmitter.removeAllListeners(RnMqttEvent.DISCONNECTED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.EXCEPTION);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MESSAGE_RECEIVED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.RECONNECT);
    this._eventEmitter.removeAllListeners(RnMqttEvent.SUBSCRIBED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.UNSUBSCRIBED);
  }

  private _setupEventListeners(): void {
    this._addEventListener(RnMqttEvent.CONNECTING);
    this._addEventListener(RnMqttEvent.CONNECTED);
    this._addEventListener(
      RnMqttEvent.CONNECTION_LOST,
      RnMqttEventParams.ERR_MESSAGE,
      RnMqttEventParams.ERR_CODE,
      RnMqttEventParams.STACKTRACE
    );
    this._addEventListener(
      RnMqttEvent.EXCEPTION,
      RnMqttEventParams.ERR_MESSAGE,
      RnMqttEventParams.ERR_CODE,
      RnMqttEventParams.STACKTRACE
    );
    this._addEventListener(RnMqttEvent.SUBSCRIBED, RnMqttEventParams.TOPIC);
    this._addEventListener(RnMqttEvent.UNSUBSCRIBED, RnMqttEventParams.TOPIC);
    this._addEventListener(RnMqttEvent.DISCONNECTED);
    this._addEventListener(
      RnMqttEvent.MESSAGE_RECEIVED,
      RnMqttEventParams.TOPIC,
      RnMqttEventParams.PAYLOAD
    );
    this._addEventListener(
      RnMqttEvent.MESSAGE_PUBLISHED,
      RnMqttEventParams.TOPIC,
      RnMqttEventParams.PAYLOAD
    );
  }

  private _addEventListener(
    eventType: RnMqttEvent,
    ...eventParams: RnMqttEventParams[]
  ): void {
    this._eventEmitter.addListener(eventType, (event) => {
      if (event[RnMqttEventParams.CLIENT_REF] !== this._clientRef) return;

      this._eventHandler[eventType]?.call(
        this,
        ...eventParams.map((e) => event[e])
      );
    });
  }
}
