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

  public on(event: RnMqttEvent.MQTT_CONNECTED, cb: () => void): this;
  public on(event: RnMqttEvent.MQTT_CONNECTING, cb: () => void): this;
  public on(
    event: RnMqttEvent.MQTT_CONNECTION_LOST,
    cb: (errorMsg?: string, errorCode?: number, stackTrace?: string) => void
  ): this;
  public on(
    event: RnMqttEvent.MQTT_SUBSCRIBED,
    cb: (topic: string) => void
  ): this;
  public on(
    event: RnMqttEvent.MQTT_UNSUBSCRIBED,
    cb: (topic: string) => void
  ): this;
  public on(
    event: RnMqttEvent.MQTT_MESSAGE_ARRIVED,
    cb: (topic: string, payloadAsHex: string) => void
  ): this;
  public on(
    event: RnMqttEvent.MQTT_MESSAGE_PUBLISHED,
    cb: (topic: string, payloadAsHex: string) => void
  ): this;
  public on(event: RnMqttEvent.MQTT_DISCONNECTED, cb: () => void): this;
  public on(
    event: RnMqttEvent.MQTT_EXCEPTION,
    cb: (errorMsg?: string, errorCode?: number, stackTrace?: string) => void
  ): this;
  public on(event: RnMqttEvent.MQTT_CLOSED, cb: () => void): this;
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
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_CLIENT_REF_UNKNOWN);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_CONNECTED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_CONNECTING);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_CONNECTION_LOST);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_DELIVERY_COMPLETE);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_DISCONNECTED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_EXCEPTION);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_MESSAGE_ARRIVED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_RECONNECT);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_SUBSCRIBED);
    this._eventEmitter.removeAllListeners(RnMqttEvent.MQTT_UNSUBSCRIBED);
  }

  private _setupEventListeners(): void {
    this._addEventListener(RnMqttEvent.MQTT_CONNECTING);
    this._addEventListener(RnMqttEvent.MQTT_CONNECTED);
    this._addEventListener(
      RnMqttEvent.MQTT_CONNECTION_LOST,
      RnMqttEventParams.MQTT_PARAM_ERR_MESSAGE,
      RnMqttEventParams.MQTT_PARAM_ERR_CODE,
      RnMqttEventParams.MQTT_PARAM_STACKTRACE
    );
    this._addEventListener(
      RnMqttEvent.MQTT_EXCEPTION,
      RnMqttEventParams.MQTT_PARAM_ERR_MESSAGE,
      RnMqttEventParams.MQTT_PARAM_ERR_CODE,
      RnMqttEventParams.MQTT_PARAM_STACKTRACE
    );
    this._addEventListener(
      RnMqttEvent.MQTT_SUBSCRIBED,
      RnMqttEventParams.MQTT_PARAM_TOPIC
    );
    this._addEventListener(
      RnMqttEvent.MQTT_UNSUBSCRIBED,
      RnMqttEventParams.MQTT_PARAM_TOPIC
    );
    this._addEventListener(RnMqttEvent.MQTT_DISCONNECTED);
    this._addEventListener(
      RnMqttEvent.MQTT_MESSAGE_ARRIVED,
      RnMqttEventParams.MQTT_PARAM_TOPIC,
      RnMqttEventParams.MQTT_PARAM_MESSAGE
    );
    this._addEventListener(
      RnMqttEvent.MQTT_MESSAGE_PUBLISHED,
      RnMqttEventParams.MQTT_PARAM_TOPIC,
      RnMqttEventParams.MQTT_PARAM_MESSAGE
    );
  }

  private _addEventListener(
    eventType: RnMqttEvent,
    ...eventParams: RnMqttEventParams[]
  ): void {
    this._eventEmitter.addListener(eventType, (event) => {
      if (event[RnMqttEventParams.MQTT_PARAM_CLIENT_REF] !== this._clientRef)
        return;

      this._eventHandler[eventType]?.call(
        this,
        ...eventParams.map((e) => event[e])
      );
    });
  }
}
