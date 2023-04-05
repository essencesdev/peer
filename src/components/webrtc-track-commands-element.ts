import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";

export class WebRtcTrackCommandsElement extends ShadowedWithStylesheetElement {
	onStreamSelected: ((stream: MediaStream) => void) | null = null;
	onStreamSelectCancelled: (() => void) | null = null;

	constructor() {
		super();

		const button = document.createElement("button");
		button.innerText = "add stream";
		button.onclick = () => {
			// recreating dialog is trash but idk how to hook it up "nicely"
			// otherwise
			const dialog = document.createElement("dialog");
			const p = document.createElement("p");
			p.innerText = "The dialog";
			dialog.appendChild(p);
			document.body.appendChild(dialog);
			const cleanup = () => document.body.removeChild(dialog);
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
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.finally(() => cleanup());
			};

			audioShare.onclick = () => {
				navigator.mediaDevices
					.getUserMedia({ audio: true, video: false })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.finally(() => cleanup());
			};

			videoShare.onclick = () => {
				navigator.mediaDevices
					.getUserMedia({ audio: false, video: true })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.finally(() => cleanup());
			};

			dialog.showModal();
		};

		this.shadowRoot!.appendChild(button);
	}
}

customElements.define("webrtc-track-commands", WebRtcTrackCommandsElement);
