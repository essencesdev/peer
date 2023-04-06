import {
	createSignal,
	receiveSignal,
	setState,
	initializeEverything,
} from "./webrtc/webrtc-core.js";
import { debug } from "./logging.js";
import { errorNotificationElement } from "./components/error-notification-element.js";

declare const QRCode: any;

const d = document.getElementById("directions") as HTMLParagraphElement;
const s = document.getElementById("signal") as HTMLTextAreaElement;
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
				const { sdp, state } = data;
				setTimeout(() => {
					if (state === "connecting") {
						onLoadingFinished(
							"Now copy this text to the other instance " +
								"or scan the QR code so it opens the link on the same page of the other instance"
						);
						rs.setAttribute("hidden", "");
					} else {
						onLoadingFinished(
							"Copy this text to the other instance. " +
								"If copying text into this, replace the existing text and press the button."
						);
					}
					s.value = compress(sdp);
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
				onLoadingFinished("Starting...");
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

function onLoading() {
	d.innerText = "Loading...";
	s.setAttribute("disabled", "");
	rs.setAttribute("disabled", "");
	cl.setAttribute("loading", "");
}

function onLoadingFinished(message: string) {
	d.innerText = message;
	s.removeAttribute("disabled");
	rs.removeAttribute("disabled");
	cl.removeAttribute("loading");
}

// the sdp seems to be short enough if using ssl (~900) otherwise it is (4000+)
function compress(data: RTCSessionDescription) {
	debug("compress", "data=", data);
	return btoa(JSON.stringify(data));
}

function decompress(data: string): RTCSessionDescription {
	debug("decompress", "data=", data);
	return JSON.parse(atob(data));
}

// the url hash can contain the code
(function initSignalListeners() {
	let lastAttemptedHash: string | null = null;

	const loadSignal = (signal: string) => {
		start = Date.now();
		onLoading();
		return receiveSignal(decompress(signal)).catch((e) => {
			errorNotificationElement.addError(e);
			onLoadingFinished("Couldn't load this signal");
		});
	};

	// check if hash/signal exists on load, if it does and works then the only
	// thing left should be to send the response code
	if (window.location.hash) {
		lastAttemptedHash = window.location.hash;
		loadSignal(lastAttemptedHash.slice(1));
		rs.setAttribute("hidden", "");
	} else {
		start = Date.now();
		onLoading();
		createSignal();
		rs.onclick = () => loadSignal(s.value);
	}

	window.onhashchange = () => {
		debug("onhashchange", "hash=", window.location.hash);
		if (window.location.hash === lastAttemptedHash) {
			// perhaps caused by load checking it and the event also firing
			return;
		}
		lastAttemptedHash = window.location.hash;
		loadSignal(lastAttemptedHash.slice(1));
	};
})();

// radio input determine whether or not to show qr code/text code
(function initRadioInputs() {
	const toggleStates = (input: HTMLInputElement) => {
		if (input.value === "qrcode") {
			q.removeAttribute("hidden");
			s.setAttribute("hidden", "");
		} else {
			s.removeAttribute("hidden");
			q.setAttribute("hidden", "");
		}
	};

	// on load if something else is checked
	const checked = document.querySelector(
		"input[type='radio'][name='signal'][checked]"
	);
	if (!checked)
		errorNotificationElement.addErrorMessage(
			"Impossible: somehow have no radio inputs selected"
		);
	toggleStates(checked as HTMLInputElement);

	document
		.querySelectorAll("input[type='radio'][name='signal']")
		.forEach((element) => {
			const input = element as HTMLInputElement;
			input.onchange = () => {
				toggleStates(input);
			};
		});
})();
