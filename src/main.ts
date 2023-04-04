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

setState({
	callback: ({ type, data }) => {
		switch (type) {
			case "CandidatesReady":
				s.value = JSON.stringify(data);
				s.style.border = "10px solid lightgreen";
				break;
			default:
				const x: never = type;
		}
	},
});

cs.onclick = () => {
	createSignal().then(
		(signal) => (s.value = "OLD: " + JSON.stringify(signal))
	);
	s.style.border = "none";
};

rs.onclick = () => {
	receiveSignal(JSON.parse(s.value));
	s.style.border = "none";
};
