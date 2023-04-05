import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";
import { errorNotificationElement } from "./error-notification-element.js";

export class WebRtcTrackCommandsElement extends ShadowedWithStylesheetElement {
	onStreamSelected: ((stream: MediaStream) => void) | null = null;
	onStreamSelectCancelled: (() => void) | null = null;

	constructor() {
		super();
		const style = document.createElement("style");
		style.innerHTML = `
			.icon-button {
				width: 50px;
				height: 50px;
				font-size: 25px;
			}
			.screen-icon::after {
				content: "💻";
			}
			.microphone-icon::after {
				content: "🎤";
			}
			.video-icon::after {
				content: "🎥";
			}
		`;
		this.shadowRoot!.appendChild(style);

		const button = document.createElement("button");
		button.innerText = "add stream";
		button.onclick = () => {
			// recreating dialog is trash but idk how to hook it up "nicely"
			// otherwise
			const dialog = document.createElement("dialog");
			const p = document.createElement("p");
			p.innerText = "The dialog";
			dialog.appendChild(p);
			this.shadowRoot!.appendChild(dialog);
			const cleanup = () => this.shadowRoot!.removeChild(dialog);
			const screenShare = document.createElement("button");
			screenShare.classList.add("icon-button", "screen-icon");
			const audioShare = document.createElement("button");
			audioShare.classList.add("icon-button", "microphone-icon");
			const videoShare = document.createElement("button");
			videoShare.classList.add("icon-button", "video-icon");

			dialog.appendChild(screenShare);
			dialog.appendChild(audioShare);
			dialog.appendChild(videoShare);

			dialog.onclose = () => cleanup();

			screenShare.onclick = () => {
				navigator.mediaDevices
					.getDisplayMedia({ audio: true, video: true })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.catch(e => errorNotificationElement.addError(e));
			};

			audioShare.onclick = () => {
				navigator.mediaDevices
					.getUserMedia({ audio: true, video: false })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.catch(e => errorNotificationElement.addError(e));
			};

			videoShare.onclick = () => {
				navigator.mediaDevices
					.getUserMedia({ audio: false, video: true })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.catch(e => errorNotificationElement.addError(e));
			};

			dialog.showModal();
		};

		this.shadowRoot!.appendChild(button);
	}
}

customElements.define("webrtc-track-commands", WebRtcTrackCommandsElement);
