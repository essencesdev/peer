import { connection, createNewSdp } from "./webrtc/webrtc-core.js";
import { WebRtcVideoElement } from "./components/webrtc-video-element.js";
import { send } from "./webrtc/messaging.js";
import { debug } from "./logging.js";

const screenShare = document.getElementById(
	"share-screen"
) as HTMLButtonElement;
const mainSection = document.getElementById("main-screen") as HTMLDivElement;

screenShare.onclick = () => {
	navigator.mediaDevices
		// firefox can't return multiple tracks
		.getDisplayMedia({ audio: true, video: true })
		.then((stream) => {
			for (const track of stream.getTracks()) {
				connection.addTrack(track);
			}
			return createNewSdp();
		})
		.then((sdp) => {
			send({ id: Date.now(), type: "video", data: sdp });
		});
};

connection.addEventListener("track", (event) => {
	debug("track", "event=", event);

	const video = document.createElement("webrtc-video") as WebRtcVideoElement;
	video.addTrack(event.track);

	mainSection.appendChild(video);
});
