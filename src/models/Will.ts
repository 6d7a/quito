import type { Buffer } from 'buffer/';
import type { QoS } from './QoS';

export type Will = {
  topic: string;
  payload: Buffer;
  qos: QoS;
  retain: boolean;
};
