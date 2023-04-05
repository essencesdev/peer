import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";

const dialog = document.createElement("dialog");
const p = document.createElement("p");
p.innerText = "The dialog";
dialog.appendChild(p);
document.body.appendChild(dialog);

export class WebRtcTrackCommandsElement extends ShadowedWithStylesheetElement {
	onStreamSelected:
		| ((stream: MediaStream, id: number | null) => void)
		| null = null;
	onStreamSelectCancelled: (() => void) | null = null;
	mediaStreamId: number | null = null;

	constructor() {
		super();

		const button = document.createElement("button");
		button.innerText = "add stream";
		button.onclick = () => {
			dialog.showModal();
		};

		const screenShare = document.createElement("button");
		screenShare.innerText = "screen";
		const audioShare = document.createElement("button");
		audioShare.innerText = "audio";
		const videoShare = document.createElement("button");
		videoShare.innerText = "video";

		dialog.appendChild(screenShare);
		dialog.appendChild(audioShare);
		dialog.appendChild(videoShare);

		screenShare.onclick = () => {
			navigator.mediaDevices
				.getDisplayMedia({ audio: true, video: true })
				.then((stream) => {
					if (this.onStreamSelected)
						this.onStreamSelected(stream, this.mediaStreamId);
				})
				.then(() => dialog.close());
		};

		audioShare.onclick = () => {
			navigator.mediaDevices
				.getUserMedia({ audio: true, video: false })
				.then((stream) => {
					if (this.onStreamSelected)
						this.onStreamSelected(stream, this.mediaStreamId);
				})
				.then(() => dialog.close());
		};

		videoShare.onclick = () => {
			navigator.mediaDevices
				.getUserMedia({ audio: false, video: true })
				.then((stream) => {
					if (this.onStreamSelected)
						this.onStreamSelected(stream, this.mediaStreamId);
				})
				.then(() => dialog.close());
		};

		this.shadowRoot!.appendChild(button);
	}
}

customElements.define("webrtc-track-commands", WebRtcTrackCommandsElement);
