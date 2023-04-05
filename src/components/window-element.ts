import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";

let zIndexHack = 1;

export class WindowElement extends ShadowedWithStylesheetElement {
	onClose: ((self: this) => void) | null = null;

	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			:host {
				position: absolute;
				display: block;
				width: 33%;
				height: 33%;
				border: 1px solid var(--grey-2);
				resize: both;
				overflow: auto;
				display: flex;
				flex-direction: column;
				background: var(--bg);
			}
			.window-header {
				flex: 0 0 32px;
				background: var(--grey-1);
				cursor: grab;
				display: flex;
				align-items: center;
				padding-left: 8px;
			}
			.close-button {
				width: 16px;
				height: 16px;
				border-radius: 100%;
				background-color: var(--red-1);
				border: none;
				cursor: pointer;
			}
		`;

		this.shadowRoot!.appendChild(style);

		const windowHeader = document.createElement("div");
		windowHeader.classList.add("window-header");

		if (!this.hasAttribute("data-cant-close")) {
			const closeButton = document.createElement("button");
			closeButton.classList.add("close-button");

			closeButton.onclick = (event) => {
				event.preventDefault();

				if (this.onClose) this.onClose(this);

				this.parentNode?.removeChild(this);
			};
			windowHeader.appendChild(closeButton);
		}

		windowHeader.onmousedown = (event) => {
			event.preventDefault();

			this.style.zIndex = String(zIndexHack++);

			let initX = event.clientX;
			let initY = event.clientY;

			document.onmouseup = () => {
				document.onmousemove = null;
				document.onmouseup = null;
			};

			document.onmousemove = (event) => {
				const dX = event.clientX - initX;
				const dY = event.clientY - initY;
				initX = event.clientX;
				initY = event.clientY;
				this.style.left = `${this.offsetLeft + dX}px`;
				this.style.top = `${this.offsetTop + dY}px`;
			};
		};

		this.shadowRoot!.appendChild(windowHeader);
	}
}
