import Game from '../game/Game';

interface BrowserEventModel {
	event: string;
	cb: (e: any) => void;
	selector?: string;
}

const documentEventListeners: BrowserEventModel[] = [
	// TODO: perhaps add checks to make sure there is a Game object, prior
	// to emitting any events?

	{
		event: 'keydown',
		cb(e) {
			if (e.keyCode === 38) {
				(<any>window).Game.emitEvent('throttle-on');
			} else if (e.keyCode === 39) {
				(<any>window).Game.emitEvent('right-on');
			} else if (e.keyCode === 37) {
				(<any>window).Game.emitEvent('left-on');
			} else if (e.keyCode === 32) {
				if (!(<any>window).Game.initialized) {
					(<any>window).Game.init();
				} else {
					(<any>window).Game.emitEvent('fire-on');
				}
			} else if (e.keyCode === 80) {
				(<any>window).Game.emitEvent('toggle-pause');
			}
		},
	},
	{
		event: 'keyup',
		cb(e) {
			if (e.keyCode === 38) {
				(<any>window).Game.emitEvent('throttle-off');
			} else if (e.keyCode === 39) {
				(<any>window).Game.emitEvent('right-off');
			} else if (e.keyCode === 37) {
				(<any>window).Game.emitEvent('left-off');
			} else if (e.keyCode === 32) {
				(<any>window).Game.emitEvent('fire-off');
			}
		},
	},
];

export default documentEventListeners;
