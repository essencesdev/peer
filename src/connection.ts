import {
	createSignal,
	receiveSignal,
	setState,
	initializeEverything,
} from "./webrtc/webrtc-core.js";
import { debug } from "./logging.js";
import { errorNotificationElement } from "./components/error-notification-element.js";

declare const QRCode: any;

const s = document.getElementById("signal") as HTMLTextAreaElement;
const cs = document.getElementById("create-signal") as HTMLButtonElement;
const rs = document.getElementById("receive-signal") as HTMLButtonElement;
const cl = document.getElementById("code-loader") as HTMLDivElement;
const s1 = document.getElementById("connection-screen") as HTMLElement;
const q = document.getElementById("qrcode") as HTMLDivElement;
const qrCode = new QRCode(q, {
	width: 800,
	height: 800,
	correctLevel: QRCode.CorrectLevel.L,
});

setState({
	callback: ({ type, data }) => {
		switch (type) {
			case "CandidatesReady":
				setTimeout(() => {
					onLoadingFinished();
					s.value = compress(data);
					try {
						const url = new URL(document.URL);
						url.hash = s.value;
						qrCode.makeCode(url.href);
					} catch (e) {
						errorNotificationElement.addErrorMessage(
							"Couldn't make qr code (probably because data was too long)"
						);
					}
				}, minLoadTime + start - Date.now());
				break;
			case "MainDataChannelReady":
				onLoadingFinished();
				s1.setAttribute("fadeaway", String(true));
				initializeEverything();
				break;
			default:
				const x: never = type;
		}
	},
});

let start = Date.now();
const minLoadTime = 1000;
cs.onclick = () => {
	debug("cs.oclick");
	onLoading();
	try {
		createSignal().then(() => {
			start = Date.now();
		});
	} catch (e) {
		errorNotificationElement.addError(e as Error);
	}
};

rs.onclick = () => {
	debug("rs.onclick", "s.value=", s.value);
	onLoading();
	try {
		receiveSignal(decompress(s.value));
		start = Date.now();
	} catch (e) {
		errorNotificationElement.addError(e as Error);
	}
};

function onLoading() {
	s.setAttribute("disabled", "");
	cs.setAttribute("disabled", "");
	rs.setAttribute("disabled", "");
	cl.setAttribute("loading", "");
}

function onLoadingFinished() {
	s.removeAttribute("disabled");
	rs.removeAttribute("disabled");
	cl.removeAttribute("loading");
}

// TODO: qr code - we'll need to compress the data somehow as the normal
// stringified version is too large for qr codes (~5000 chars)
// well it seems like on ssl it is much smaller (~800 chars), this is probably
// due to less ice candidates in the sdp
function compress(data: RTCSessionDescription) {
	debug("compress", "data=", data);
	return btoa(JSON.stringify(data));
}

function decompress(data: string): RTCSessionDescription {
	debug("decompress", "data=", data);
	return JSON.parse(atob(data));
}

window.onhashchange = () => {
	debug("onhashchange", "hash=", window.location.hash);
	onLoading();
	try {
		receiveSignal(decompress(window.location.hash.slice(1)));
		start = Date.now();
	} catch (e) {
		errorNotificationElement.addError(e as Error);
	}
};

document
	.querySelectorAll("input[type='radio'][name='signal']")
	.forEach((element) => {
		const input = element as HTMLInputElement;
		input.onchange = () => {
			if (input.value === "qrcode") {
				q.removeAttribute("hidden");
				s.setAttribute("hidden", "");
			} else {
				s.removeAttribute("hidden");
				q.setAttribute("hidden", "");
			}
		};
	});
