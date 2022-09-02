class Helpers{
static func getOrDefault<T>(dict: NSDictionary, key: String, defaultValue: T) -> T {
    if let value = dict[key] as! T? {
          return value
      } else {
          return defaultValue
      }
} 
}
