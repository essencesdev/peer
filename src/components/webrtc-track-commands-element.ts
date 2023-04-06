import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";
import { errorNotificationElement } from "./error-notification-element.js";

// the plan was to be able to add tracks within windows but that doesn't work
// atm
export class WebRtcTrackCommandsElement extends ShadowedWithStylesheetElement {
	onStreamSelected: ((stream: MediaStream) => void) | null = null;
	onStreamSelectCancelled: (() => void) | null = null;

	constructor() {
		super();
		const style = document.createElement("style");
		style.innerHTML = `
			dialog {
				border: 1px solid var(--grey-2);
				background: var(--bg);
				color: var(--fg);
				font-family: Verdana, Geneva, Tahoma, sans-serif;
				font-size: 16px;
			}
			.button-container {
				display: flex;
				justify-content: space-evenly;
			}
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
			p.innerText =
				"Pick a type of stream to add, screen, audio, or video";
			dialog.appendChild(p);
			this.shadowRoot!.appendChild(dialog);
			const cleanup = () => this.shadowRoot!.removeChild(dialog);

			const container = document.createElement("div");
			container.classList.add("button-container");
			const screenShare = document.createElement("button");
			screenShare.classList.add("icon-button", "screen-icon");
			const audioShare = document.createElement("button");
			audioShare.classList.add("icon-button", "microphone-icon");
			const videoShare = document.createElement("button");
			videoShare.classList.add("icon-button", "video-icon");

			container.appendChild(screenShare);
			container.appendChild(audioShare);
			container.appendChild(videoShare);
			dialog.appendChild(container);

			dialog.onclose = () => cleanup();

			screenShare.onclick = () => {
				navigator.mediaDevices
					.getDisplayMedia({ audio: true, video: true })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.catch((e) => errorNotificationElement.addError(e));
			};

			audioShare.onclick = () => {
				navigator.mediaDevices
					.getUserMedia({ audio: true, video: false })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.catch((e) => errorNotificationElement.addError(e));
			};

			videoShare.onclick = () => {
				navigator.mediaDevices
					.getUserMedia({ audio: false, video: true })
					.then((stream) => {
						if (this.onStreamSelected)
							this.onStreamSelected(stream);
					})
					.then(() => dialog.close())
					.catch((e) => errorNotificationElement.addError(e));
			};

			dialog.showModal();
		};

		this.shadowRoot!.appendChild(button);
	}
}

customElements.define("webrtc-track-commands", WebRtcTrackCommandsElement);
