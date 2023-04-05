import { WindowElement } from "./window-element.js";

export class WebRtcVideoElement extends WindowElement {
	#video: HTMLVideoElement;
	#stream: MediaStream = new MediaStream();

	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			video {
				margin: 16px;
			}
		`;
		this.shadowRoot!.appendChild(style);

		this.#video = document.createElement("video");
		this.#video.srcObject = this.#stream;
		this.#video.setAttribute("controls", "");
		this.shadowRoot!.appendChild(this.#video);

		this.onClose = () => {
			for (const track of this.#stream.getTracks()) {
				track.stop();
			}
		};
	}

	addTrack(track: MediaStreamTrack) {
		this.#stream.addTrack(track);
	}
}

customElements.define("webrtc-video", WebRtcVideoElement);
