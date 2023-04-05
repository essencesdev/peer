import { WindowElement } from "./window-element.js";

export class WebRtcMediaElement extends WindowElement {
	#video: HTMLVideoElement;
	#stream: MediaStream = new MediaStream();

	#_isSource: boolean = true;

	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			video {
				margin: 16px;
			}
			video[isSource] {
				border: 5px solid var(--red-1);
			}
		`;
		this.shadowRoot!.appendChild(style);

		this.#video = document.createElement("video");
		this.#video.srcObject = this.#stream;
		this.#video.setAttribute("isSource", "");
		this.#video.setAttribute("controls", "");
		this.#video.setAttribute("autoplay", "");
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

	get isSource(): boolean {
		return this.#_isSource;
	}

	set isSource(source: boolean) {
		this.#_isSource = source;
		if (source) {
			this.#video.setAttribute("isSource", "");
		} else {
			this.#video.removeAttribute("isSource");
		}
	}
}

customElements.define("webrtc-media", WebRtcMediaElement);
