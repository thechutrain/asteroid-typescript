import * as Utils from '../index';

describe('utils tests', () => {
	it('should be able to extend a shallow object', () => {
		const orgValue = 'original value';
		const obj1 = { name: orgValue };
		const obj2 = Utils.extend(obj1);
		obj1.name = 'changed!!!';

		expect(obj2.name).toBe(orgValue);
	});

	it('should be able to extend multiple shallow object', () => {
		const obj1 = { name: 'apple', abstract: '__base__' };
		const obj2 = { abstract: 'overwritten' };
		const obj3 = Utils.extend(obj1, obj2);

		expect(obj3).toHaveProperty('name', 'apple');
		expect(obj3).toHaveProperty('abstract', 'overwritten');
	});

	it('should be able to extend a deep copy of an object', () => {
		const obj1 = { layerOne: { layerTwo: 'deep value' } };
		const obj2 = Utils.extend(obj1);
		// @ts-ignore
		obj1.layerOne = 'changed!!!';
		expect(obj2).toEqual({ layerOne: { layerTwo: 'deep value' } });
	});

	it('should be able to round numbers', () => {
		const f1 = 123.456789;
		expect(Utils.round(f1)).toBe(123.46);
	});
});
