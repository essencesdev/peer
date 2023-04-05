import { debug } from "../logging.js";

type ChannelListener = (d: Message, e: MessageEvent<any>) => void;

type Message =
	| TextMessage
	| MediaStreamMessage
	| IceCandidateMessage
	| MediaStreamAcceptMessage
	| MediaStreamDeclineMessage;
interface TextMessage {
	type: "text";
	data: string;
}
interface MediaStreamMessage {
	id: number;
	type: "media";
	data: RTCSessionDescriptionInit;
	trackIds: string[];
}
interface MediaStreamAcceptMessage {
	id: number;
	type: "media-accept";
	data: RTCSessionDescriptionInit;
}
interface MediaStreamDeclineMessage {
	id: number;
	type: "media-decline";
}
interface IceCandidateMessage {
	type: "ice-candidate";
	data: RTCIceCandidate;
}

// currently we skip the data property check if the type is complex

export function isValidIceCandidateMessage(
	message: Message
): message is IceCandidateMessage {
	return (
		message !== null &&
		typeof message === "object" &&
		"type" in message &&
		message.type === "ice-candidate"
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

export function isValidMediaMessage(
	message: Message
): message is MediaStreamMessage {
	return (
		message !== null &&
		typeof message === "object" &&
		"id" in message &&
		typeof message.id === "number" &&
		"type" in message &&
		message.type === "media" &&
		Array.isArray(message.trackIds)
	);
}

export function isValidMediaAcceptMessage(
	message: Message
): message is MediaStreamAcceptMessage {
	return (
		message !== null &&
		typeof message === "object" &&
		"id" in message &&
		typeof message.id === "number" &&
		"type" in message &&
		message.type === "media-accept"
	);
}

export function isValidMediaDeclineMessage(
	message: Message
): message is MediaStreamDeclineMessage {
	return (
		message !== null &&
		typeof message === "object" &&
		"id" in message &&
		typeof message.id === "number" &&
		"type" in message &&
		message.type === "media-decline"
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
