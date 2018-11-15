const fakeJQuery = {
	// Source: https://toddmotto.com/javascript-hasclass-addclass-removeclass-toggleclass/#adding-a-class-with-addclass
	hasClass(elem: HTMLElement, className: string) {
		return new RegExp(` {$className} `).test(` ${elem.className} `);
	},

	addClass(elem: HTMLElement, className: string) {
		if (!this.hasClass(elem, className)) {
			elem.className += ` ${className}`;
		}
	},
};

export default fakeJQuery;
