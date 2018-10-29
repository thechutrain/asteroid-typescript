/** utility functions here
 *
 */

// #region debouncing & throttling
// source: https://css-tricks.com/debouncing-throttling-explained-examples/
function initThrottler(fn: (...args: []) => void, timeout: number) {
	let canRun = true;

	return function throttled() {
		if (canRun) {
			canRun = false;
			fn.apply(this, arguments);
			setTimeout(() => {
				canRun = true;
			}, timeout);
		}
	};
}

function initDebouncer(fn: (...args: []) => void, timout: number) {
	let timer: number;

	return function debounced() {
		if (timer) {
			window.clearTimeout(timer);
		}

		timer = window.setTimeout(function() {
			fn.apply(this, arguments);
		}, timout);
	};
}
// #endregion

// source: https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
function getClosest(elem: any, selector: string) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;
}

// TODO: need to still test this
// source: https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function clone(obj: any) {
	// let copy: Object | Date; // throws error with copy.setTime b/c it has Object
	let copy: any;

	// check if primitive value, then return (base case of recursive clone)
	if (typeof obj !== 'object' || obj == null) return obj;

	// copying if its a date
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}

	// Handle Array
	if (obj instanceof Array) {
		copy = [];
		obj.forEach((elem, index) => {
			copy[index] = elem;
		});
		return copy;
	}

	// Handle Obj
	if (obj instanceof Object) {
		copy = {};
		for (const attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				copy[attr] = clone(obj[attr]);
			}
		}
		return copy;
	}
}

function extend(...args: any[]) {
	const extendedObj: any = {};

	for (let i = 0; i < arguments.length; i++) {
		const obj = arguments[i];
		if (!(obj instanceof Object)) break;
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				extendedObj[key] = clone(obj[key]);
			}
		}
	}

	return extendedObj;
}

// var obj1 = { a: 'apple', s: { 's': 'special'}};
// var obj2 = { b: 'banana'};
// var obj3 = {a: 'almonds'};

// var test = extend (obj1, obj2, obj3);

// obj1.s = 'changed ....';

// console.log(test);
// console.log(obj1);

// module.exports = {
// 	initThrottler,
// 	initDebouncer,
// 	getClosest,
// 	clone,
// 	extend
// };

export { initThrottler, initDebouncer, getClosest, clone, extend };
