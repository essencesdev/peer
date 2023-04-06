import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";
import { error } from "../logging.js";

class ErrorNotificationElement extends ShadowedWithStylesheetElement {
	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			:host {
				position: absolute;
				display: block;
				z-index: 100;
				pointer-events: none;
			}
			* {
				box-sizing: border-box;
			}
			.error-message {
				font-family: Verdana, Geneva, Tahoma, sans-serif;
				font-size: 16px;
				background: var(--grey-1);
				color: var(--red-1);
				padding: 8px 8px 8px 16px;
				margin: 16px;
				border-left: 3px solid var(--red-2);
				border-radius: 0 4px 4px 0;
				cursor: pointer;
				display: block;
				pointer-events: auto;
			}
			.error-message::after {
				display: inline-block;
				margin-left: 32px;
				width: 16px;
				content: "";
			}
			.error-message:hover::after {
				content: "x"
			}
		`;
		this.shadowRoot!.appendChild(style);
	}

	addError(e: Error, log = true) {
		if (log) error(e);
		this.addErrorMessage(e.message, !log);
	}

	addErrorMessage(msg: string, log = true) {
		if (log) error(msg);
		const errorItem = document.createElement("div");
		errorItem.classList.add("error-message");
		errorItem.innerText = msg;
		this.shadowRoot!.appendChild(errorItem);

		errorItem.onmouseup = () => this.shadowRoot!.removeChild(errorItem);
	}
}

customElements.define("error-notification", ErrorNotificationElement);
export const errorNotificationElement = document.createElement(
	"error-notification"
) as ErrorNotificationElement;
document.body.appendChild(errorNotificationElement);
