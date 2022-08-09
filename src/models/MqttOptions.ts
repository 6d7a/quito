import type { Protocol } from './Protocol';
import type { RnMqttWill } from './Will';

export type RnMqttOptions = {
  brokerUri: string;
  clientId?: string;
  username?: string;
  password?: string;
  keepalive?: number;
  connectTimeoutMs?: number;
  will?: RnMqttWill;
  clean?: boolean;
  protocol?: Protocol;
  protocolVersion?: number;
  reconnectPeriod?: number;
  host?: string;
  port?: number;
};
