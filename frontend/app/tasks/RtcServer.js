import { Task } from '../Task';

const Accept = Symbol('accept');

export class RtcServer extends Task
{
	static helpText = 'RTC Server.';
	static useText  = '';

	title     = 'RTC Server Task';
	connected = false;

	init()
	{
		const rtcConfig = {iceServers: [
			{urls: 'stun:stun1.l.google.com:19302'},
			{urls: 'stun:stun2.l.google.com:19302'}
		]};

		this.peerServer = new RTCPeerConnection(rtcConfig);

		this.peerServer.addEventListener('icecandidate', () => {
			let localDescription = JSON.stringify(
				this.peerServer.localDescription, null, 4
			);

			this.print('Server description');

			this.print(localDescription);
		});

		this.peerServer.addEventListener('iceconnectionstatechange', () => {
			let state = this.peerServer.iceConnectionState;

			this.print(`RTC state: ${state}`);
		});

		this.peerServer.addEventListener('datachannel', event => {

			this.peerServerChannel = event.channel;

			this.peerServerChannel.addEventListener('open', () => {
				this.print('Remote peer client accepted!');

				this.connected = true;
			});

			this.peerServerChannel.addEventListener('close', () => {
				this.print('Peer reset connection.');

				this[Accept]();
			});

			this.finally(()=>{
				if(this.peerServerChannel)
				{
					this.print('Terminating connection...');
					this.peerServerChannel.close();
				}
			});

			this.peerServerChannel.addEventListener('message', event => {
				this.print(`> ${event.data}`);
				console.log(event);
			});

		});

		this.printErr(`Please supply SDP offer string.`);

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
			this.answer(input);
			return;
		}

		this.print(`< ${input}`);
		this.peerServerChannel.send(input);
	}

	answer(offerString)
	{
		const offer = JSON.parse(offerString);

		this.peerServer.setRemoteDescription(offer);

		this.peerServer.createAnswer(
			(answer) => {
				
				this.peerServer.setLocalDescription(answer);
			
			}, (error) => {
				
				console.error(error);
				
				this.printErr(`Unexpected exception.`);

				this[Accept]();
			}
		);
	}

	done()
	{
		
	}
}