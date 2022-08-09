import type { QoS } from "./QoS";

export type MqttSubscription = {
  topic: string;
  qos: QoS;
};