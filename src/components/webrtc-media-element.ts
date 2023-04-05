import { WindowElement } from "./window-element.js";

export class WebRtcMediaElement extends WindowElement {
	#video: HTMLVideoElement;
	#stream: MediaStream = new MediaStream();
	#_isSource: boolean = true;

	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			.media-container {
				width: 100%;
				height: 100%;
				overflow: auto;
			}
			video {
				margin: 16px;
				width: calc(100% - 42px);
				height: calc(100% - 42px);
			}
			video[isSource] {
				border: 5px solid var(--red-1);
			}
		`;
		this.shadowRoot!.appendChild(style);

		const mediaContainer = document.createElement("div");
		mediaContainer.classList.add("media-container");

		this.#video = document.createElement("video");
		this.#video.srcObject = this.#stream;
		this.#video.setAttribute("isSource", "");
		this.#video.setAttribute("controls", "");
		this.#video.setAttribute("autoplay", "");

		mediaContainer.appendChild(this.#video);
		this.shadowRoot!.appendChild(mediaContainer);

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
			this.#video.removeAttribute("controls");
		} else {
			this.#video.removeAttribute("isSource");
			this.#video.setAttribute("controls", "");
		}
	}
}

customElements.define("webrtc-media", WebRtcMediaElement);
