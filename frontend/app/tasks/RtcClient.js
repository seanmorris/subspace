import { Task } from '../Task';

const Accept = Symbol('accept');

export class RtcClient extends Task
{
	static helpText = 'RTC Client.';
	static useText  = '';
	
	title     = 'RTC Client Task';
	connected = false;

	init()
	{
		const rtcConfig = {iceServers: [
			{urls: 'stun:stun1.l.google.com:19302'},
			{urls: 'stun:stun2.l.google.com:19302'}
		]};

		this.peerClient = new RTCPeerConnection(rtcConfig);

		this.peerClient.addEventListener('icecandidate', (event) => {
			console.log(event.candidate);

			let localDescription = JSON.stringify(
				this.peerClient.localDescription, null, 4
			);

			this.print('Client description');

			this.print(localDescription);
		});

		this.peerClient.addEventListener('iceconnectionstatechange', () => {
			let state = this.peerClient.iceConnectionState;

			this.print(`RTC state: ${state}`);
		});

		this.peerClientChannel = this.peerClient.createDataChannel("chat")

		this.peerClientChannel.addEventListener('open', () => {
			this.print('Remote peer server accepted!');

			this.connected = true;
		});

		this.peerClientChannel.addEventListener('close', () => {
			this.print('Peer reset connection.');

			this[Accept]();
		});

		this.finally(()=>{
			this.print('Terminating connection...');
			this.peerClientChannel.close()
		});

		this.peerClientChannel.addEventListener('message', event => {
			this.print(`> ${event.data}`);
			console.log(event);
		});

		this.peerClient.createOffer().then(offer => {
			this.peerClient.setLocalDescription(offer);
		});

		return new Promise(accept => {
			this[Accept] = accept;
		});	
	}

	main(input)
	{
		if(!input)
		{
			return;
		}

		if(!this.connected)
		{
			this.accept(input);
			return;
		}

		this.print(`< ${input}`);
		this.peerClientChannel.send(input);
	}

	accept(answerString)
	{
		if (!answerString)
		{
			this.print(`Please supply SDP offer string.`);
			return;
		}

		const answer = JSON.parse(answerString);

		const session = new RTCSessionDescription(answer);

		this.peerClient.setRemoteDescription(session);
	}
}