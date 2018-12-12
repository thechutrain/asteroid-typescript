import Game from '../game/Game';

export interface IBrowserEventModel {
	event: string;
	cb: (e: any) => void;
	selector?: string;
}

export const documentEventListeners: IBrowserEventModel[] = [
	// TODO: perhaps add checks to make sure there is a Game object, prior
	// to emitting any events?
	{
		event: 'keydown',
		cb(e: any) {
			if (e.keyCode === 78) {
				(window as any).Game.emitEvent('debug:next-frame');
			}
			if (e.keyCode === 38) {
				(window as any).Game.emitEvent('throttle-on');
			} else if (e.keyCode === 39) {
				(window as any).Game.emitEvent('right-on');
			} else if (e.keyCode === 37) {
				(window as any).Game.emitEvent('left-on');
			} else if (e.keyCode === 32) {
				if (!(window as any).Game.initialized) {
					(window as any).Game.init();
				} else {
					(window as any).Game.emitEvent('fire-on');
				}
			} else if (e.keyCode === 80) {
				(window as any).Game.emitEvent('toggle-pause');
			}
		},
	},
	{
		event: 'keyup',
		cb(e: any) {
			if (e.keyCode === 38) {
				(window as any).Game.emitEvent('throttle-off');
			} else if (e.keyCode === 39) {
				(window as any).Game.emitEvent('right-off');
			} else if (e.keyCode === 37) {
				(window as any).Game.emitEvent('left-off');
			} else if (e.keyCode === 32) {
				(window as any).Game.emitEvent('fire-off');
			}
		},
	},
];

export default documentEventListeners;
