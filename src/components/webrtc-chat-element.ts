import { ShadowedWithStylesheetElement } from "./shadowed-with-stylesheet-element.js";
import { send, listen, isValidTextMessage } from "../webrtc/messaging.js";

class WebRtcChatElement extends ShadowedWithStylesheetElement {
	#chatDisplay: HTMLDivElement;
	#chatInput: HTMLTextAreaElement;
	#chatSend: HTMLButtonElement;
	#chatHeader: HTMLDivElement;
	#chatInputContainer: HTMLDivElement;

	constructor() {
		super();

		const style = document.createElement("style");
		style.innerHTML = `
			:host {
				position: absolute;
				display: block;
				width: 50%;
				height: 50%;
				border: 1px solid var(--grey-2);
				resize: both;
				overflow: auto;
				display: flex;
				flex-direction: column;

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
			#chat-header {
				flex: 0 0 calc(var(--base-sizing) * 2);
				background: var(--grey-1);
				cursor: grab;
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

		this.#chatHeader = document.createElement("div");
		this.#chatHeader.id = "chat-header";

		const chatContainer = document.createElement("div");
		chatContainer.id = "chat-container";

		this.#chatDisplay = document.createElement("div");
		this.#chatDisplay.id = "chat-display";
		this.#chatDisplay.classList.add("text");

		this.#chatInputContainer = document.createElement("div");
		this.#chatInputContainer.id = "chat-input-container";
		this.#chatInputContainer.classList.add("text");

		this.shadowRoot!.appendChild(this.#chatHeader);
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
			const text = this.#chatInput.value;
			// style this if send fails
			const p = this.#appendToChat(true, text);
			this.#chatInput.value = "";
			this.#onTextChanged();
			send({ type: "text", data: text });
		};

		// scale text area and other checks
		this.#chatInput.onkeyup = this.#chatInput.onkeydown = () => {
			this.#onTextChanged();
		};

		// receive messages
		listen((message) => {
			if (isValidTextMessage(message)) {
				this.#appendToChat(false, message.data);
			}
		});

		// draggable window
		this.#chatHeader.onmousedown = (event) => {
			event.preventDefault();

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
	}

	#onTextChanged() {
		if (this.#chatInput.value.length === 0)
			this.#chatSend.setAttribute("disabled", String(true));
		else this.#chatSend.removeAttribute("disabled");
		this.#chatInput.style.height = "auto";
		this.#chatInput.style.height = `${this.#chatInput.scrollHeight}px`;
		this.#chatInputContainer.style.height = `${
			this.#chatInput.scrollHeight
		}px`;
	}

	#appendToChat(source: boolean, text: string) {
		const p = document.createElement("p");
		p.innerText = text;
		p.classList.add(source ? "from-me" : "from-them");
		p.classList.add("message");

		this.#chatDisplay.appendChild(p);
		return p;
	}
}

customElements.define("webrtc-chat", WebRtcChatElement);
