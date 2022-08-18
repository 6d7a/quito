import { Protocol } from '../models/Protocol';

export type UrlData = {
  host: string;
  port: number;
  protocol: Protocol;
  tls?: boolean;
};

export const parseBrokerUrl = (url: string): UrlData => {
  const destructured = url.match(
    /^((mqtt[s]?|ws[s]?|tcp?|ssl?)?:(\/\/)([0-9a-zA-Z_\.\-]*):?(\d+))$/
  );

  if (!destructured || destructured.length != 6) {
    throw new Error(`Invalid broker url: ${url}`);
  }

  const [, , protocolStr, , host, portStr] = destructured;

  const port = parseInt(portStr);

  if (isNaN(port)) {
    throw new Error(`Invalid port: ${portStr}`);
  }

  const protocol = parseProtocolString(protocolStr);

  const tls =
    protocol === Protocol.TCP_TLS || protocol === Protocol.WSS
      ? true
      : undefined;

  return { host, port, protocol, tls };
};

export const parseProtocolString = (protocolStr: string): Protocol => {
  switch (protocolStr) {
    case 'mqtt':
    case 'tcp':
      return Protocol.TCP;
    case 'ssl':
    case 'mqtts':
      return Protocol.TCP_TLS;
    case 'ws':
      return Protocol.WS;
    case 'wss':
      return Protocol.WSS;
    default:
      throw new Error(`Invalid protocol: ${protocolStr}`);
  }
};
