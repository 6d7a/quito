import CocoaMQTT

enum QoS: UInt8 {
  case AT_MOST_ONCE = 0
  case AT_LEAST_ONCE = 1 
  case EXACTLY_ONCE = 2

    func cocoaQos() -> CocoaMQTTQoS {
      switch self {
        case .AT_MOST_ONCE:
          return CocoaMQTTQoS.qos0
        case .AT_LEAST_ONCE:
          return CocoaMQTTQoS.qos1
        case .EXACTLY_ONCE:
          return CocoaMQTTQoS.qos2
      }
    }
}
