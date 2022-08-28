enum Protocol: String {
  case WS = "WS"
  case WSS = "WSS"
  case TCP_TLS = "TCP_TLS"
  case TCP = "TCP"

  var urlPrefix: String {
      switch self {
        case .WS:
          "ws://"
        case .WSS:
          "wss://"
        case .TCP_TLS:
          "ssl://"
        default:
          "tcp://"
      }
    }
}
