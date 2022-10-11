import { Protocol } from "../../models/Protocol"
import { parseBrokerUrl, parseProtocolString } from "../../utils/helpers"

describe("url parsing", () => {
    it("parses a simple broker url", () => {
        expect(parseBrokerUrl("tcp://test.mosquitto.org:1883")).toEqual({
            host: "test.mosquitto.org",
            port: 1883,
            protocol: Protocol.TCP,
        })
    })

    it("parses a broker url with path", () => {
        expect(parseBrokerUrl("wss://test.mosquitto.org/secure:8081")).toEqual({
            host: "test.mosquitto.org/secure",
            port: 8081,
            protocol: Protocol.WSS,
            tls: true
        })
    })

    it("parses a broker url with subdomains", () => {
        expect(parseBrokerUrl("ssl://gateway.really-long-subdomain.mosquitto.org/secure:8081")).toEqual({
            host: "gateway.really-long-subdomain.mosquitto.org/secure",
            port: 8081,
            protocol: Protocol.TCP_TLS,
            tls: true
        })
    })

    it("throws error if broker url is invalid", () => {
        expect(() => parseBrokerUrl("sssl://url.with.typo:90")).toThrowError()
    })
})

describe("protocols", () => {
    it("parses accepted protocol strings", () => {
        expect(parseProtocolString("ws")).toBe(Protocol.WS)
        expect(parseProtocolString("wss")).toBe(Protocol.WSS)
        expect(parseProtocolString("tcp")).toBe(Protocol.TCP)
        expect(parseProtocolString("mqtt")).toBe(Protocol.TCP)
        expect(parseProtocolString("ssl")).toBe(Protocol.TCP_TLS)
        expect(parseProtocolString("mqtts")).toBe(Protocol.TCP_TLS)
    })

    it("throws an error on unknown protocol", () => {
        expect(() => parseProtocolString("unknown")).toThrowError()
    })
})