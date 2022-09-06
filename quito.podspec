require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "quito"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "13.0" }
  s.source       = { :git => "http://github.com/6d7a/quito.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true
  s.framework = "Foundation"

  s.dependency "React-Core"
  s.dependency "CocoaAsyncSocket"
  s.dependency "Starscream", "~> 3.1.1"
  s.dependency "CocoaMQTT/WebSockets", "2.0.5"
end
