import { AsyncStorage } from 'react-native';
import Promise from 'native-promise-only';

const toString = (str) => (typeof str !== 'string') ? str.toString() : str;
const isObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
const splitPath = (path) => {
	const divider = /\./g.test(path) ? '.' : '/';
	return path.split(divider);
}

const get = (path, defaultValue = {}) => {
	const paths = splitPath(toString(path));
	const [key, ...nestedProps] = paths;

	return new Promise((resolve, reject) => {
		AsyncStorage.getItem(key)

		.then((value) => {

			const parsedValue = JSON.parse(value);
			const getValue = (target, key, currentValue) => (currentValue === undefined) ? defaultValue : currentValue;
			const resolved = (nestedProps.length > 0) ?
			findNestedValue(parsedValue, getValue, nestedProps, reject) : (parsedValue || defaultValue)

			resolve(resolved);
		});

	});
};

const set = (path, value) => {
	const paths = splitPath(toString(path));
	const [key, ...nestedProps] = paths;

	return new Promise((resolve, reject) => {

		const setItem = (key, value) => {
			AsyncStorage.setItem(key, JSON.stringify(value))
			.then(() => resolve({ key }));
		};

		if (nestedProps.length < 1) setItem(key, value);

		else {
			get(key).then((target) => {

				const updateValue = (target, key, currentValue) => {
					target[key] = value;
					return target;
				}
				// setNestedValue will mutate the value obj
				findNestedValue(target, updateValue, nestedProps, reject);
				setItem(key, target);
			});
		}

	});
};

const remove = (path, returnValue) => {
	const paths = splitPath(toString(path));
	const [key, ...nestedProps] = paths;

	return new Promise((resolve, reject) => {

		if (nestedProps.length < 1) {
			AsyncStorage.removeItem(key)
			.then(() => resolve(returnValue));
		}

		else {
			get(key).then((target) => {

				const deleteValue = (target, key, currentValue) => {
					delete target[key];
					return true;
				};
				// setNestedValue will mutate the value obj
				findNestedValue(target, deleteValue, nestedProps, reject);

				AsyncStorage.setItem(key, JSON.stringify(target))
				.then(() => resolve(target));
			});
		}

	});
};

const findNestedValue = (target, cb, keys, error, index = 0) => {
	const key = keys[index];
	const value = target[key];

	if ((keys.length - 1) === index) {
		return cb(target, key, value);
	}

	else {
		if (value === undefined) {
			error({ message: `${key} is undefined`, key });
			return false;
		}

		if (!isObject(value)) {
			error({ message: `${key} is not an object`, key });
			return false;
		}
	}

	findNestedValue(value, defaultValue, keys, index + 1);
};

export default {
	get,
	set,
	remove
};
