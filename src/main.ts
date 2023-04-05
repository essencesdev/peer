import {
	connection,
	createNewSdp,
	receiveNewSdp,
} from "./webrtc/webrtc-core.js";
import { WebRtcVideoElement } from "./components/webrtc-video-element.js";
import { WebRtcChatElement } from "./components/webrtc-chat-element.js";
import {
	send,
	listen,
	isValidTextMessage,
	isValidVideoMessage,
	isValidVideoAcceptMessage,
	isValidVideoDeclineMessage,
} from "./webrtc/messaging.js";
import { debug } from "./logging.js";

const screenShare = document.getElementById(
	"share-screen"
) as HTMLButtonElement;
const mainSection = document.getElementById("main-screen") as HTMLDivElement;

const chat = document.getElementById("webrtc-chat") as WebRtcChatElement;
chat.onSend = (message) => {
	chat.appendMessageToChat(true, message);
	send({ type: "text", data: message });
};

listen((message) => {
	if (isValidTextMessage(message)) {
		chat.appendMessageToChat(false, message.data);
	} else if (isValidVideoMessage(message)) {
		chat.appendRequestToChat(
			"would like to stream media",
			() =>
				receiveNewSdp(message.data).then((sdp) => {
					if (sdp)
						send({
							id: message.id,
							type: "video-accept",
							data: sdp,
						});
				}),
			() => send({ id: message.id, type: "video-decline" })
		);
	} else if (isValidVideoAcceptMessage(message)) {
		chat.appendMessageToChat(false, "accepted your video request");
		receiveNewSdp(message.data);
	} else if (isValidVideoDeclineMessage(message)) {
		chat.appendMessageToChat(false, "declined your video request");
	}
});

screenShare.onclick = () => {
	navigator.mediaDevices
		// firefox can't return multiple tracks
		.getDisplayMedia({ audio: true, video: true })
		.then((stream) => {
			chat.appendMessageToChat(true, "requested to stream video");
			const video = createVideoElement(true);

			for (const track of stream.getTracks()) {
				connection.addTrack(track);
				video.addTrack(track);
			}

			return createNewSdp();
		})
		.then((sdp) => {
			send({ id: Date.now(), type: "video", data: sdp });
		});
};

connection.addEventListener("track", (event) => {
	debug("track", "event=", event);

	const video = createVideoElement(false);
	video.addTrack(event.track);
});

function createVideoElement(source: boolean): WebRtcVideoElement {
	const video = document.createElement("webrtc-video") as WebRtcVideoElement;
	video.isSource = source;
	mainSection.appendChild(video);

	return video;
}
