import type { RnMqttWill } from './RnMqttWill';

export type RnMqttOptions = {
  clientId?: string;
  username?: string;
  password?: string;
  keepalive?: number;
  connectTimeoutMs?: number;
  will?: RnMqttWill;
  clean?: boolean;
  protocol?: 'mqtt' | 'mqtts' | 'ws' | 'wss';
  protocolVersion?: number;
  reconnectPeriod?: number;
};
