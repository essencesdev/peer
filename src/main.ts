import {
	createSignal,
	receiveSignal,
	getState,
	setState,
} from "./webrtc/webrtc-core.js";

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
					cl.removeAttribute("loading");
					s.value = JSON.stringify(data);
				}, start + 1500 - Date.now());
				break;
			case "MainDataChannelReady":
				s1.setAttribute("fadeaway", String(true));
				break;
			default:
				const x: never = type;
		}
	},
});

let start = Date.now();
cs.onclick = () => {
	createSignal().then(() => {
		start = Date.now();
		cl.setAttribute("loading", String(true));
	});
};

rs.onclick = () => {
	receiveSignal(JSON.parse(s.value));
	start = Date.now();
	cl.setAttribute("loading", String(true));
};
