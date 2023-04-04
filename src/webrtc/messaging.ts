import { debug } from "../logging.js";

let channel: RTCDataChannel | null = null;

export function init(c: RTCDataChannel) {
	debug("init", "c=", c);
	channel = c;
	channel.onmessage = (event) => {
		console.log(event);
	};
}

export function send(message: string) {
	debug("send", "message=", message);
	if (!channel) throw new Error();
	channel.send(message);
}
