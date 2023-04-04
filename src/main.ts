import {
	createSignal,
	receiveSignal,
	getState,
	setState,
} from "./webrtc/webrtc-core.js";

import { errorNotificationElement } from "./components/error-notification-element.js";

(window as any).getState = getState;
(window as any).setState = setState;

const s = document.getElementById("signal") as HTMLTextAreaElement;
const cs = document.getElementById("create-signal") as HTMLButtonElement;
const rs = document.getElementById("receive-signal") as HTMLButtonElement;
const cl = document.getElementById("code-loader") as HTMLDivElement;
const s1 = document.getElementById("connection-screen") as HTMLElement;

setState({
	callback: ({ type, data }) => {
		switch (type) {
			case "CandidatesReady":
				setTimeout(() => {
					onLoadingFinished();
					s.value = compress(data);
				}, minLoadTime + start - Date.now());
				break;
			case "MainDataChannelReady":
				onLoadingFinished();
				s1.setAttribute("fadeaway", String(true));
				break;
			default:
				const x: never = type;
		}
	},
});

let start = Date.now();
const minLoadTime = 1000;
cs.onclick = () => {
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
function compress(data: RTCSessionDescription) {
	return btoa(JSON.stringify(data));
}

function decompress(data: string): RTCSessionDescription {
	return JSON.parse(atob(data));
}
