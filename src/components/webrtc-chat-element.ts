import { WindowElement } from "./window-element.js";

export class WebRtcChatElement extends WindowElement {
	#chatDisplay: HTMLDivElement;
	#chatInput: HTMLTextAreaElement;
	#chatSend: HTMLButtonElement;
	#chatInputContainer: HTMLDivElement;

	onSend: ((message: string) => void) | null = null;

	constructor() {
		super();

		const styleSheet = document.createElement("link");
		styleSheet.rel = "stylesheet";
		styleSheet.href = "components/webrtc-chat.css";
		this.shadowRoot!.appendChild(styleSheet);

		const chatContainer = document.createElement("div");
		chatContainer.id = "chat-container";

		this.#chatDisplay = document.createElement("div");
		this.#chatDisplay.id = "chat-display";

		this.#chatInputContainer = document.createElement("div");
		this.#chatInputContainer.id = "chat-input-container";

		this.shadowRoot!.appendChild(chatContainer);

		chatContainer.appendChild(this.#chatDisplay);
		chatContainer.appendChild(this.#chatInputContainer);

		this.#chatInput = document.createElement("textarea");
		this.#chatInput.id = "chat-input";
		this.#chatInput.placeholder = "Type here...";
		this.#chatInput.classList.add("text");

		this.#chatSend = document.createElement("button");
		this.#chatSend.id = "chat-send";
		this.#chatSend.classList.add("rounded-button");
		this.#chatSend.disabled = true;

		this.#chatInputContainer.appendChild(this.#chatInput);
		this.#chatInputContainer.appendChild(this.#chatSend);

		// send message
		this.#chatSend.onclick = () => {
			if (this.onSend) this.onSend(this.#chatInput.value);
			this.#chatInput.value = "";
			this.#scrollToBottom();
		};

		// scale text area and other checks
		this.#chatInput.onkeyup = this.#chatInput.onkeydown = () => {
			this.#enableDisableSend();
			this.#scaleChatInput();
		};
	}

	#scrollToBottom() {
		this.#chatDisplay.scrollTop = this.#chatDisplay.scrollHeight;
	}

	#scaleChatInput() {
		this.#chatInput.style.height = "auto";
		this.#chatInput.style.height = `${this.#chatInput.scrollHeight}px`;
		this.#chatInputContainer.style.height = `${
			this.#chatInput.scrollHeight
		}px`;
	}

	#enableDisableSend() {
		if (this.#chatInput.value.length === 0)
			this.#chatSend.setAttribute("disabled", String(true));
		else this.#chatSend.removeAttribute("disabled");
	}

	appendMessageToChat(source: boolean, text: string, system: boolean) {
		const p = document.createElement("p");
		p.innerText = text;
		p.classList.add(
			source ? "from-me" : "from-them",
			system ? "system-text" : "text",
			"message"
		);

		this.appendElementToChat(p);
		return p;
	}

	appendElementToChat(e: HTMLElement) {
		this.#chatDisplay.appendChild(e);
		this.#scrollToBottom();
		return e;
	}

	appendRequestToChat(
		msg: string,
		onAccept: () => void,
		onDecline: () => void
	) {
		const p = document.createElement("p");
		p.innerText = msg;
		p.classList.add("from-them", "system-text", "message");

		const div = document.createElement("div");
		div.classList.add("buttons-container");
		const accept = document.createElement("button");
		accept.innerText = "accept";
		const decline = document.createElement("button");
		decline.innerText = "decline";

		accept.onclick = () => {
			onAccept();
			accept.setAttribute("disabled", "");
			decline.setAttribute("disabled", "");
		};
		decline.onclick = () => {
			onDecline();
			accept.setAttribute("disabled", "");
			decline.setAttribute("disabled", "");
		};

		div.appendChild(accept);
		div.appendChild(decline);
		p.appendChild(div);

		this.appendElementToChat(p);
		return p;
	}
}

customElements.define("webrtc-chat", WebRtcChatElement);
