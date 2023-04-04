import { debug } from "../logging.js";
import { init, send, listen, isValidIceCandidateMessage } from "./messaging.js";
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

export async function createNewSdp(): Promise<RTCSessionDescriptionInit> {
	const offer = await connection.createOffer();
	await connection.setLocalDescription(offer);
	return offer;
}

export async function receiveNewSdp(signal: RTCSessionDescriptionInit) {
	await connection.setRemoteDescription(new RTCSessionDescription(signal));
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

(window as any).getState = getState;
(window as any).createNewSdp = createNewSdp;
(window as any).receiveNewSdp = receiveNewSdp;

export function setState(state: { callback: Callback }) {
	// connection = state.connection ?? connection;
	// mainDataChannel = state.mainDataChannel ?? mainDataChannel;
	callback = state.callback ?? callback;
}

// These are one time functions to set up the initial data channel that will be
// used as the signaling server for all future connection updates. We also use
// the channel as a simple chat thing!
export async function createSignal(): Promise<RTCSessionDescriptionInit> {
	mainDataChannel = connection.createDataChannel("core-channel");
	init(mainDataChannel);
	mainDataChannel.onopen = () => {
		callback({
			type: "MainDataChannelReady",
			data: mainDataChannel!,
		});
	};
	return createNewSdp();
}

export async function receiveSignal(signal: RTCSessionDescriptionInit) {
	return receiveNewSdp(signal);
}

export function initializeEverything() {
	// hook up anything that relies on a signaling server to use the datachannel
	connection.addEventListener("icecandidate", function l(event) {
		send({ type: "ice-candidate", data: event.candidate! });
	});
	listen((message) => {
		if (isValidIceCandidateMessage(message)) {
			connection.addIceCandidate(message.data);
		}
	});
}

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
