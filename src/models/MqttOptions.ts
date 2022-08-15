import type { Protocol } from './Protocol';
import type { RnMqttWill } from './Will';

export type RnMqttOptions = {
  clientId?: string;
  username?: string;
  password?: string;
  keepalive?: number;
  connectTimeoutMs?: number;
  will?: RnMqttWill;
  tls?: boolean;
  certificatePath?: string;
  keyStorePassword?: string;
  clean?: boolean;
  protocol: Protocol;
  protocolVersion?: number;
  reconnectPeriod?: number;
  host: string;
  port: number;
};
