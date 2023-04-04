import { debug } from "../logging.js";
import { init } from "./messaging.js";
import { errorNotificationElement } from "../components/error-notification-element.js";

type Callback = (c: CallbackData) => void;
type CallbackData = CandidatesReady | MainDataChannelReady;

interface CandidatesReady {
	type: "CandidatesReady";
	data: RTCSessionDescription;
}

interface MainDataChannelReady {
	type: "MainDataChannelReady";
	data: RTCDataChannel;
}

const configuration = {
	iceServers: [{ urls: "stun:stun.services.mozilla.com:3478" }],
	// iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

let connection = new RTCPeerConnection(configuration);
let mainDataChannel: RTCDataChannel | null = null;
let callback: Callback = console.log;

connection.addEventListener("connectionstatechange", function l(event) {
	debug("connectionstatechange", "event=", event);
	if (connection.connectionState === "failed") {
		errorNotificationElement.addErrorMessage(
			"Connection State has changed to failed. Maybe refresh the page and try again?"
		);
	}
});
connection.addEventListener("icecandidateerror", function l(event) {
	debug("icecandidateerror", "event=", event);
	errorNotificationElement.addErrorMessage(
		"icecandidateerror event fired. Not sure what this is."
	);
});
connection.addEventListener("iceconnectionstatechange", function l(event) {
	debug("iceconnectionstatechange", "event=", event);
});
connection.addEventListener("icegatheringstatechange", function l(event) {
	debug("icegatheringstatechange", "event=", event);
});
connection.addEventListener("negotiationneeded", function l(event) {
	debug("negotiationneeded", "event=", event);
});
connection.addEventListener("signalingstatechange", function l(event) {
	debug("signalingstatechange", "event=", event);
});

connection.addEventListener("datachannel", function l(event) {
	connection.removeEventListener("datachannel", l);
	const originalMainDataChannel = mainDataChannel;
	if (mainDataChannel === null) mainDataChannel = event.channel;
	debug(
		"datachannel",
		"event=",
		event,
		"mainDataChannel=",
		mainDataChannel,
		"originalMainDataChannel=",
		originalMainDataChannel
	);
	init(mainDataChannel);
	callback({
		type: "MainDataChannelReady",
		data: mainDataChannel!,
	});
});

connection.addEventListener("icecandidate", function l(candidate) {
	debug("icecandidate", "candidate=", candidate);
	if (candidate.candidate === null) {
		connection.removeEventListener("icecandidate", l);
		if (connection.localDescription === null) {
			throw new Error(
				"Impossible: connection.localDescription=null after " +
					"gathering candidates"
			);
		}
		callback({
			type: "CandidatesReady",
			data: connection.localDescription,
		});
	}
});

export async function createSignal(): Promise<RTCSessionDescriptionInit> {
	mainDataChannel = connection.createDataChannel("core-channel");
	init(mainDataChannel);
	mainDataChannel.onopen = () => {
		callback({
			type: "MainDataChannelReady",
			data: mainDataChannel!,
		});
	};
	const offer = await connection.createOffer({
		offerToReceiveAudio: true,
		offerToReceiveVideo: true,
	});
	await connection.setLocalDescription(offer);
	return offer;
}

export async function receiveSignal(signal: RTCSessionDescriptionInit) {
	connection.setRemoteDescription(new RTCSessionDescription(signal));
	if (signal.type === "answer") return;
	const answer = await connection.createAnswer();
	await connection.setLocalDescription(answer);
	return answer;
}

export function getState() {
	return {
		connection,
		mainDataChannel,
		callback,
	};
}

export function setState(state: { callback: Callback }) {
	// connection = state.connection ?? connection;
	// mainDataChannel = state.mainDataChannel ?? mainDataChannel;
	callback = state.callback ?? callback;
}
