import type { Buffer } from 'buffer/';
import type { QoS } from './QoS';

export type RnMqttWill = {
  topic: string;
  payload: Buffer;
  qos: QoS;
  retain: boolean;
  willDelayIntervalSec?: number;
  isPayloadUtf8Encoded?: boolean;
  messageExpiryIntervalSec?: number;
  contentType?: string;
  responseTopic?: string;
  correlationData?: Buffer;
  userProperties?: { [key: string]: string };
};
