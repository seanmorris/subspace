const socketProtocol = location.protocol === 'https:'
	? 'wss://'
	: 'ws://';

export class Config {};

Config.title = 'SubSpace 0x29a';
Config.socketHost = socketProtocol + location.hostname + ':9998';
