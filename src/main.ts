import {
	connection,
	createNewSdp,
	receiveNewSdp,
} from "./webrtc/webrtc-core.js";
import { WebRtcMediaElement } from "./components/webrtc-media-element.js";
import { WebRtcChatElement } from "./components/webrtc-chat-element.js";
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
const screenShare = document.getElementById(
	"share-screen"
) as HTMLButtonElement;
const audioShare = document.getElementById("share-audio") as HTMLButtonElement;

screenShare.onclick = () => {
	navigator.mediaDevices
		// these seem to be video only
		// so TODO: add ability to add audio track to thing
		.getDisplayMedia({ audio: false, video: true })
		.then((stream) => {
			chat.appendMessageToChat(true, "requested to stream media");
			const media = createMediaElement(true);

			for (const track of stream.getTracks()) {
				connection.addTrack(track);
				media.addTrack(track);
			}

			return createNewSdp();
		})
		.then((sdp) => {
			send({ id: Date.now(), type: "media", data: sdp });
		});
};

audioShare.onclick = () => {
	navigator.mediaDevices
		// we need to alternate these arguments to share individual things
		.getUserMedia({ audio: true, video: false })
		.then((stream) => {
			chat.appendMessageToChat(true, "requested to stream media");
			const media = createMediaElement(true);

			for (const track of stream.getTracks()) {
				connection.addTrack(track);
				media.addTrack(track);
			}

			return createNewSdp();
		})
		.then((sdp) => {
			send({ id: Date.now(), type: "media", data: sdp });
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
