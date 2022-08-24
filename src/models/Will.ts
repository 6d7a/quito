import type { QoS } from './QoS';

export type Will = {
  topic: string;
  payload: string;
  qos: QoS;
  retain: boolean;
};
