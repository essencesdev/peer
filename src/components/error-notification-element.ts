import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";
import { error } from "../logging.js";

class ErrorNotificationElement extends ShadowedWithStylesheetElement {
	constructor() {
		super();

		const styleSheet = document.createElement("link");
		styleSheet.rel = "stylesheet";
		styleSheet.href = "components/error-notification.css";
		this.shadowRoot!.appendChild(styleSheet);
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
