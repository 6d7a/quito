import type { NativeQuito } from "src/models/NativeQuito";
import type { PublishOptions } from "src/models/PublishOptions";
import type { QuitoOptions } from "src/models/QuitoOptions";
import type { QuitoSubscription } from "src/models/QuitoSubscription";

type PublishedMsg = {
    topic: string;
    payloadBase64: string;
    publishOptions: PublishOptions;
}

class QuitoNativeMock implements NativeQuito {
    options: QuitoOptions | undefined
    connectionState = false
    private _subscriptions: QuitoSubscription[] = []
    private _publishedMessages: PublishedMsg[] = []

    resetMock() {
        this._publishedMessages = []
        this._subscriptions = []
        this.options = undefined
        this.connectionState = false
    }
    async addListener(_?: string) {}
    async removeListeners(_?: number) {}

    async createClient(options: QuitoOptions): Promise<string> {
        this.options = options
        return "test-client"
    }

    async connect(_: string) {
        this.connectionState = true
    }
    async disconnect(_: string) {
        this.connectionState = false
    }
    async reconnect(_: string) {
        this.connectionState = true
    }
    async isConnected(_: string) {
        return this.connectionState
    }
    async subscribe(topics: QuitoSubscription[], _: string) {
        this._subscriptions.push(...topics)
    }
    async unsubscribe(topics: string[], _: string) {
        this._subscriptions = this._subscriptions.filter(s => !topics.includes(s.topic))
    }
    async publish(topic: string, payload: string, options: PublishOptions, _: string) {
        this._publishedMessages.push({ topic, payloadBase64: payload, publishOptions: options })
    }
    async end(_1: string, _2: boolean) {
        this.connectionState = false
    }
}

export const mockQuitoNative = new QuitoNativeMock()