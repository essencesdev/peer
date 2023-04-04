import { debug } from "../logging.js";

let channel: RTCDataChannel | null = null;
type ChannelListener = (e: MessageEvent<any>) => void;

const listeners: Set<ChannelListener> = new Set();

export function init(c: RTCDataChannel) {
	debug("init", "c=", c);
	channel = c;
	channel.onmessage = (event) => {
		for (const listener of listeners) {
			listener(event);
		}
	};
}

export function send(message: string) {
	debug("send", "message=", message);
	if (!channel) throw new Error();
	channel.send(message);
}

export function listen(fn: ChannelListener) {
	if (listeners.has(fn)) {
		throw new Error("already have function " + fn.name);
	}
	return listeners.add(fn);
}

export function stopListening(fn: ChannelListener) {
	return listeners.delete(fn);
}
