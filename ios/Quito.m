#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(Quito, RCTEventEmitter)

RCT_EXTERN_METHOD(createClient:(NSDictionary *)options
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(connect:(NSString *)clientRef
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(subscribe:(NSArray *)topics
                 clientRef: (NSString *)clientRef
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(unsubscribe:(NSArray *)topics
                 clientRef: (NSString *)clientRef
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(publish:(NSString *)topic
                 payloadAsUtf8String:(NSString *)payloadAsUtf8String
                 options:(NSDictionary *)options
                 clientRef: (NSString *)clientRef
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(disconnect:(NSString *)clientRef
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(close:(NSString *)clientRef
                 force:(BOOL)force
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(end:(NSString *)clientRef
                 force:(BOOL)force
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isConnected:(NSString *)clientRef
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reconnect:(NSString *)clientRef)

@end
