export type Protocol = 'MQTT' | 'MQTTS' | 'WS' | 'WSS';
export const protocolFromString = (protocol: string): Protocol => {
  switch (protocol) {
    case 'mqtt':
    case 'tcp':
    case 'MQTT':
      return 'MQTT';
    case 'mqtts':
    case 'MQTTS':
      return 'MQTTS';
    case 'ws':
    case 'WS':
      return 'WS';
    case 'wss':
    case 'WSS':
      return 'WSS';
    default:
      throw new Error(`Unknown protocol ${protocol}`);
  }
};