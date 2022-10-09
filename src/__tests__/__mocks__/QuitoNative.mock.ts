import type { PublishOptions } from "src/models/PublishOptions";
import type { QuitoOptions } from "src/models/QuitoOptions";
import type { QuitoSubscription } from "src/models/QuitoSubscription";

type PublishedMsg = {
    topic: string;
    payloadBase64: string;
    publishOptions: PublishOptions;
}

class QuitoNativeMock {
    options: QuitoOptions | undefined
    private _subscriptions: QuitoSubscription[] = []
    private _publishedMessages: PublishedMsg[] = []
    private _connectionState = false

    createClient(options: QuitoOptions): string {
        this.options = options
        return "test-client"
    }

    connect(_: string) {
        this._connectionState = true
    }
    disconnect(_: string) {
        this._connectionState = false
    }
    reconnect(_: string) {
        this._connectionState = true
    }
    isConnected(_: string) {
        return this._connectionState
    }
    subscribe(topics: QuitoSubscription[], _: string) {
        this._subscriptions.push(...topics)
    }
    unsubscribe(topics: string[], _: string) {
        this._subscriptions = this._subscriptions.filter(s => !topics.includes(s.topic))
    }
    publish(topic: string, payload: string, options: PublishOptions, _: string) {
        this._publishedMessages.push({ topic, payloadBase64: payload, publishOptions: options })
    }
    end(_1: string, _2: boolean) {
        this._connectionState = false
    }
}

export default new QuitoNativeMock()