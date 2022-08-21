import { Protocol } from './Protocol';
import type { Will } from './Will';
import type { Buffer } from 'buffer';
import { parseBrokerUrl } from '../utils/helpers';

export type QuitoOptions = {
  clientId?: string;
  username?: string;
  password?: string;
  keepaliveSec?: number;
  connectTimeoutMs?: number;
  will?: Will;
  tls?: boolean;
  caBase64?: String;
  certificateBase64?: String;
  privateKeyBase64?: string;
  keyStorePassword?: string;
  cleanSession?: boolean;
  protocol?: Protocol;
  protocolVersion?: number;
  reconnectPeriod?: number;
  host?: string;
  port?: number;
};

/**
 * This class serves to create an options object for the MQTT client.
 */
export class QuitoOptionsBuilder {
  private _options: QuitoOptions = {};

  public uri(uri: string): QuitoOptionsBuilder;
  public uri(
    host: string,
    port: number,
    protocol: Protocol
  ): QuitoOptionsBuilder;
  public uri(
    hostOrUri: string,
    port?: number,
    protocol?: Protocol
  ): QuitoOptionsBuilder {
    if (port === undefined) {
      const uri = hostOrUri;
      const { host, port, protocol, tls } = parseBrokerUrl(uri);
      this._options.host = host;
      this._options.port = port;
      this._options.protocol = protocol;
      this._options.tls = tls;
    } else {
      if (protocol === undefined) {
        throw new Error('Missing protocol prefix in broker url');
      }
      this._options.host = hostOrUri;
      this._options.port = port;
      this._options.protocol = protocol;

      this._options.tls =
        protocol === Protocol.TCP_TLS || protocol === Protocol.WSS;
    }

    return this;
  }

  public clientId(clientId: string): QuitoOptionsBuilder {
    this._options.clientId = clientId;
    return this;
  }

  public username(username: string): QuitoOptionsBuilder {
    this._options.username = username;
    return this;
  }

  public password(password: string): QuitoOptionsBuilder {
    this._options.password = password;
    return this;
  }

  public keepalive(keepalive: number): QuitoOptionsBuilder {
    this._options.keepaliveSec = keepalive;
    return this;
  }

  public connectTimeoutMs(connectTimeoutMs: number): QuitoOptionsBuilder {
    this._options.connectTimeoutMs = connectTimeoutMs;
    return this;
  }

  public will(will: Will): QuitoOptionsBuilder {
    this._options.will = will;
    return this;
  }

  public tls(tls: boolean): QuitoOptionsBuilder {
    if (this._options.tls !== undefined && this._options.tls !== tls) {
      throw new Error('TLS is required by the chosen protocol.');
    }
    if (this._options.protocol === Protocol.TCP && tls === true) {
      this._options.protocol = Protocol.TCP_TLS;
    }
    this._options.tls = tls;
    return this;
  }

  public ca(ca: Buffer): QuitoOptionsBuilder {
    this._options.caBase64 = ca.toString('base64');
    return this;
  }

  public caBase64(caBase64: String): QuitoOptionsBuilder {
    this._options.caBase64 = caBase64;
    return this;
  }

  public clientCertificate(
    certificateDer: Buffer,
    keyRsaDer: Buffer,
    keyStorePassword: string
  ): QuitoOptionsBuilder {
    this._options.certificateBase64 = certificateDer.toString('base64');
    this._options.privateKeyBase64 = keyRsaDer.toString('base64');
    this._options.keyStorePassword = keyStorePassword;
    return this;
  }

  public certificate(certificate: Buffer): QuitoOptionsBuilder {
    this._options.certificateBase64 = certificate.toString('base64');
    return this;
  }

  public certificateBase64(certificateBase64: String): QuitoOptionsBuilder {
    this._options.certificateBase64 = certificateBase64;
    return this;
  }

  public keyStoreKey(keyStoreKey: string): QuitoOptionsBuilder {
    this._options.privateKeyBase64 = keyStoreKey;
    return this;
  }

  public keyStorePassword(keyStorePassword: string): QuitoOptionsBuilder {
    this._options.keyStorePassword = keyStorePassword;
    return this;
  }

  public cleanSession(cleanSession: boolean): QuitoOptionsBuilder {
    this._options.cleanSession = cleanSession;
    return this;
  }

  public protocolVersion(protocolVersion: number): QuitoOptionsBuilder {
    this._options.protocolVersion = protocolVersion;
    return this;
  }

  public reconnectPeriod(reconnectPeriod: number): QuitoOptionsBuilder {
    this._options.reconnectPeriod = reconnectPeriod;
    return this;
  }

  public build(): QuitoOptions {
    if (this._options.host === undefined) {
      throw new Error('Please provide a broker url to connect to.');
    }
    return this._options;
  }
}
