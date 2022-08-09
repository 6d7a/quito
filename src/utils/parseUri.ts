import { Protocol, protocolFromString } from 'src/models/Protocol';

export type MqttUri = {
  protocol: Protocol;
  host: string;
  port: number;
};

export const parseUri = (uri: string): MqttUri => {
  const pattern =
    /^((mqtt[s]?|ws[s]?|tcp?)?:(\/\/)([0-9a-zA-Z_\.\-]*):?(\d+))$/;
  const matches = uri.match(pattern);
  if (!matches) {
    throw new Error(
      `Uri passed to createClient ${uri} doesn't match a known protocol (mqtt://, tcp://, or ws://).`
    );
  }
  return {
    protocol: protocolFromString(matches[2]),
    host: matches[4],
    port: parseInt(matches[5]),
  };
};
