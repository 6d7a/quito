enum Protocol: String {
  case WS = "WS"
  case WSS = "WSS"
  case TCP_TLS = "TCP_TLS"
  case TCP = "TCP"

  func urlPrefix() -> String {
      switch self {
        case .WS:
          return "ws://"
        case .WSS:
          return "wss://"
        case .TCP_TLS:
          return "ssl://"
        default:
          return "tcp://"
      }
    }
}
