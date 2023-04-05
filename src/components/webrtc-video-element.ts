import { WindowElement } from "./window-element.js";

class WebRtcVideoElement extends WindowElement {
	#video: HTMLVideoElement;

	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			video {
				width: 100%;
				height: 100%;
			}
		`;

		this.#video = document.createElement("video");
		this.shadowRoot!.appendChild(this.#video);
	}
}

customElements.define("webrtc-video", WebRtcVideoElement);
