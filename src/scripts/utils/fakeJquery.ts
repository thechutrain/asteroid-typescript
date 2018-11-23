const fakeJQuery = {
	// Source: https://toddmotto.com/javascript-hasclass-addclass-removeclass-toggleclass/#adding-a-class-with-addclass
	hasClass(elem: HTMLElement, className: string) {
		return new RegExp(` {$className} `).test(` ${elem.className} `);
	},

	addClass(elem: HTMLElement, className: string) {
		if (!this.hasClass(elem, className)) {
			elem.className += ` ${className}`;
		}
		// TODO: cool, to make it chainable, return elem
	},

	// TODO: make a cool regular expression
	// Idea: ^(ab)$|^(ab) | (ab)$| (ab)
	// removeClass(elem: HTMLElement, className: string) {
	// 	if (this.hasClass(elem, className)) {

	// 	}
	// },
	removeClass(elem: HTMLElement, className: string) {
		let newClass = ` ${elem.className.replace(/[\t\r\n]/g, ' ')} `;
		const regExp = new RegExp(` ${className} `);

		// TODO: temp perhaps refactor the hasClass function?
		// if (this.hasClass(elem, className)) {
		if (regExp.test(newClass)) {
			while (newClass.indexOf(` ${className} `) >= 0) {
				newClass = newClass.replace(` ${className} `, ' ');
			}
			elem.className = newClass.replace(/^\s+|\s+$/g, '');
		}
	},

	// source: https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
	getClosest(elem: any, selector: string) {
		// tslint:disable-next-line
		for (; elem && elem !== document; elem = elem.parentNode) {
			if (elem.matches(selector)) return elem;
		}
		return null;
	},
};

export default fakeJQuery;
