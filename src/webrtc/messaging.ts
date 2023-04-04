import { debug } from "../logging.js";

type ChannelListener = (d: Message, e: MessageEvent<any>) => void;

type Message = TextMessage | VideoStreamMessage | IceCandidateMessage;
interface TextMessage {
	type: "text";
	data: string;
}
interface VideoStreamMessage {
	type: "video";
}
interface IceCandidateMessage {
	type: "ice-candidate";
	data: RTCIceCandidate;
}

export function isValidIceCandidateMessage(
	message: Message
): message is IceCandidateMessage {
	return (
		message !== null &&
		typeof message === "object" &&
		"type" in message &&
		message.type === "ice-candidate"
		// probably won't be because it's json stringified then parsed back out
		// message.data instanceof RTCIceCandidate
	);
}

export function isValidTextMessage(message: Message): message is TextMessage {
	return (
		message !== null &&
		typeof message === "object" &&
		"type" in message &&
		message.type === "text" &&
		"data" in message &&
		typeof message.data === "string"
	);
}

export function isValidVideoMessage(
	message: Message
): message is VideoStreamMessage {
	return (
		message !== null &&
		typeof message === "object" &&
		"type" in message &&
		message.type === "video"
	);
}

let channel: RTCDataChannel | null = null;
const listeners: Set<ChannelListener> = new Set();

export function init(c: RTCDataChannel) {
	debug("init", "c=", c);
	channel = c;
	channel.onmessage = (event) => {
		debug("channel.onmessage", "event=", event);
		const data = JSON.parse(event.data) as Message;
		for (const listener of listeners) {
			listener(data, event);
		}
	};
}

export function send(message: Message) {
	debug("send", "message=", message);
	if (!channel) throw new Error("sent message without channel");
	channel.send(JSON.stringify(message));
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
