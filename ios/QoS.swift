import CocoaMQTT

enum QoS: UInt8 {
  case AT_MOST_ONCE = 0
  case AT_LEAST_ONCE = 1 
  case EXACTLY_ONCE = 2

  var cocoaQos: CocoaMQTTQoS {
      switch self {
        case .AT_MOST_ONCE:
          CocoaMQTTQoS.qos0
        case .AT_LEAST_ONCE:
          CocoaMQTTQoS.qos1
        case .EXACTLY_ONCE:
          CocoaMQTTQoS.qos2
        default:
          "tcp://"
      }
    }
}