import type { QoS } from "./QoS";

export type QuitoSubscription = {
  topic: string;
  qos: QoS;
};