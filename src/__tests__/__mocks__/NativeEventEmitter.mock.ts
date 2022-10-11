class NativeEventEmitterMock {
  isTestEventEmitter = true
  listeners: { event: string; callback: (event: any) => void }[] = [];

  constructor(_: any) {}

  resetMock() {
    this.listeners = []
  }
  triggerEvent(eventType: string, params: any) {
    this.listeners.filter(l => l.event === eventType).forEach(l => l.callback(params))
  }
  removeAllListeners(eventType: string) {
    this.listeners = this.listeners.filter((l) => l.event !== eventType);
  }
  addListener(eventType: string, callback: (event: any) => void) {
    this.listeners.push({ event: eventType, callback });
  }
}

export const mockEmitter = new NativeEventEmitterMock({})