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

const mainTrackCommands = document.getElementById(
	"main-webrtc-track-commands"
) as WebRtcTrackCommandsElement;
mainTrackCommands.onStreamSelected = (stream) => {
	// unused atm, is there a way to signal certain tracks should be combined?
	// track ids are different between peers
	// nothing in track.settings
	const id = 1;

	chat.appendMessageToChat(true, "requested to stream media");
	const media = createMediaElement(true);

	for (const track of stream.getTracks()) {
		connection.addTrack(track);
		media.addTrack(track);
	}

	createNewSdp().then((sdp) => {
		send({ id, type: "media", data: sdp, trackIds: [] });
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

connection.addEventListener("track", (event) => {
	debug("track", "event=", event);

	const media = createMediaElement(false);
	media.addTrack(event.track);
});

function createMediaElement(source: boolean): WebRtcMediaElement {
	const media = document.createElement("webrtc-media") as WebRtcMediaElement;
	media.isSource = source;
	document.body.appendChild(media);

	return media;
}
