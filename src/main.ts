import {
	connection,
	createNewSdp,
	receiveNewSdp,
} from "./webrtc/webrtc-core.js";
import { WebRtcMediaElement } from "./components/webrtc-media-element.js";
import { WebRtcChatElement } from "./components/webrtc-chat-element.js";
import { WebRtcTrackCommandsElement } from "./components/webrtc-track-commands-element.js";
import {
	send,
	listen,
	isValidTextMessage,
	isValidMediaMessage,
	isValidMediaAcceptMessage,
	isValidMediaDeclineMessage,
} from "./webrtc/messaging.js";
import { debug } from "./logging.js";

const mainSection = document.getElementById("main-screen") as HTMLDivElement;
const mainTrackCommands = document.getElementById(
	"main-webrtc-track-commands"
) as WebRtcTrackCommandsElement;
mainTrackCommands.onStreamSelected = (stream, id) => {
	id ??= Date.now();

	chat.appendMessageToChat(true, "requested to stream media");
	const media = createMediaElement(true);
	const trackIds: string[] = [];

	for (const track of stream.getTracks()) {
		connection.addTrack(track);
		media.addTrack(track);
		trackIds.push(track.id);
	}

	createNewSdp().then((sdp) => {
		send({ id: id!, type: "media", data: sdp, trackIds });
	});
};

const chat = document.getElementById("webrtc-chat") as WebRtcChatElement;
chat.onSend = (message) => {
	chat.appendMessageToChat(true, message);
	send({ type: "text", data: message });
};

listen((message) => {
	if (isValidTextMessage(message)) {
		chat.appendMessageToChat(false, message.data);
	} else if (isValidMediaMessage(message)) {
		chat.appendRequestToChat(
			"would like to stream media",
			() =>
				receiveNewSdp(message.data).then((sdp) => {
					if (sdp)
						send({
							id: message.id,
							type: "media-accept",
							data: sdp,
						});
				}),
			() => send({ id: message.id, type: "media-decline" })
		);
	} else if (isValidMediaAcceptMessage(message)) {
		chat.appendMessageToChat(false, "accepted your media request");
		receiveNewSdp(message.data);
	} else if (isValidMediaDeclineMessage(message)) {
		chat.appendMessageToChat(false, "declined your media request");
	}
});

// we can save elements by id, then apply track to specific elements
// based on the id of the media message

connection.addEventListener("track", (event) => {
	debug("track", "event=", event);

	const media = createMediaElement(false);
	media.addTrack(event.track);
});

function createMediaElement(source: boolean): WebRtcMediaElement {
	const media = document.createElement("webrtc-media") as WebRtcMediaElement;
	media.isSource = source;
	mainSection.appendChild(media);

	return media;
}
