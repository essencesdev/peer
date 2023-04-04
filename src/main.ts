import { getState, createNewSdp } from "./webrtc/webrtc-core.js";

const button = document.getElementById("b") as HTMLButtonElement;

button.onclick = () => {
	navigator.mediaDevices
		.getDisplayMedia({ audio: true, video: true })
		.then((stream) => {
			for (const track of stream.getTracks()) {
				console.log("adding track", track);
				getState().connection.addTrack(track);
			}
			return createNewSdp();
		})
		.then(console.log);
};
