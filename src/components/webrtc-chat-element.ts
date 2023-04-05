import { WindowElement } from "./window-element.js";

export class WebRtcChatElement extends WindowElement {
	#chatDisplay: HTMLDivElement;
	#chatInput: HTMLTextAreaElement;
	#chatSend: HTMLButtonElement;
	#chatInputContainer: HTMLDivElement;

	onSend: ((message: string) => void) | null = null;

	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			:host {
				--chat-send-size: 40px;
				--chat-send-padding: 5px;
				--base-sizing: 16px;
			}
			* {
				box-sizing: border-box;
			}
			.text {
				font-family: Verdana, Geneva, Tahoma, sans-serif;
				font-size: 16px;
				background: var(--grey-1);
				color: var(--fg);
			}
			.from-me {
				color: var(--blue-1);
				text-align: right;
				margin-left: 25%;
				border-right: 3px solid var(--blue-2);
			}
			.from-me::before {
				content: "You";
				display: block;
				font-size: 80%;
			}
			.from-them {
				color: var(--orange-1);
				text-align: left;
				margin-right: 25%;
				border-left: 3px solid var(--orange-2);
			}
			.from-them::before {
				content: "Them";
				display: block;
				font-size: 80%;
			}
			.message {
				padding: var(--base-sizing);
			}
			#chat-container {
				flex: 1 1;
				display: flex;
				flex-direction: column;
				overflow: auto;
			}
			#chat-display {
				flex: 1 1 80%;
				margin: var(--base-sizing);
				padding: var(--base-sizing);
				overflow: auto;
				word-break: break-all;
			}
			#chat-input-container {
				flex: 0 0;
				margin: var(--base-sizing);
				margin-top: 0px; /* why no collapse */
				height: calc(var(--chat-send-size) + var(--chat-send-padding) * 2);
				position: relative;
			}
			#chat-input {
				height: 100%;
				width: 100%;
				border: none;
				outline: none;
				margin: 0;
				padding: var(--chat-send-padding);
				padding-left: calc(var(--chat-send-size) + var(--chat-send-padding) * 2);
				resize: none;
			}
			#chat-send {
				position: absolute;
				left: var(--chat-send-padding);
				top: var(--chat-send-padding);
				width: var(--chat-send-size);
				height: var(--chat-send-size);
			}
			#chat-send::after {
				content: "✉";
			}
		`;
		this.shadowRoot!.appendChild(style);

		const chatContainer = document.createElement("div");
		chatContainer.id = "chat-container";

		this.#chatDisplay = document.createElement("div");
		this.#chatDisplay.id = "chat-display";
		this.#chatDisplay.classList.add("text");

		this.#chatInputContainer = document.createElement("div");
		this.#chatInputContainer.id = "chat-input-container";
		this.#chatInputContainer.classList.add("text");

		this.shadowRoot!.appendChild(chatContainer);

		chatContainer.appendChild(this.#chatDisplay);
		chatContainer.appendChild(this.#chatInputContainer);

		this.#chatInput = document.createElement("textarea");
		this.#chatInput.id = "chat-input";
		this.#chatInput.placeholder = "Type here...";
		this.#chatInput.classList.add("text");

		this.#chatSend = document.createElement("button");
		this.#chatSend.id = "chat-send";
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

	appendMessageToChat(source: boolean, text: string) {
		const p = document.createElement("p");
		p.innerText = text;
		p.classList.add(source ? "from-me" : "from-them", "message");

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
		p.classList.add("from-them", "message");

		const div = document.createElement("div");
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
