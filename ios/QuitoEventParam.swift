import Foundation

enum QuitoEventParam: String {
  case SERVER_URI = "SERVER_URI"
  case CLIENT_REF = "CLIENT_REF"
  case ERR_MESSAGE = "ERR_MESSAGE"
  case ERR_CODE = "ERR_CODE"
  case STACKTRACE = "STACKTRACE"
  case TOPIC = "TOPIC"
  case PAYLOAD = "PAYLOAD"
  case QOS = "QOS"
  case RETAIN = "RETAIN"
}