import type { QoS } from './QoS';

export type PublishOptions = {
  qos?: QoS;
  retain?: boolean;
  isDuplicate?: boolean;
};
