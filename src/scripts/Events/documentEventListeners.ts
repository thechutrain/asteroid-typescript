interface browserEventModel {
	event: string;
	cb: (e: any) => void;
	selector?: string;
}

const documentEventListeners: browserEventModel[] = [
	// Test event listener here
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
				(<any>window).Game.emitEvent('fire-on');
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
