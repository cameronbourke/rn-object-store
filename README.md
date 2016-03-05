rn-object-store
=========================

A lightweight wrapper around React Native's `AsyncStorage`, which makes working with objects in AsyncStorage a breeze. Particularly handy when you want to get or set a value in a nested object that is saved locally.

## Installation

```
npm install --save rn-object-store
```

## API Reference

The api surface for rn-object-store is really small. There are only three methods available: `get, set, remove`.

Save a key and associated value.

`.set([String path], [value])`

Get a value for the given path.

`.get([String path])`

Delete the value associated with a given path and remove the key.

`.remove([String path])`

**Note** `path` is string that represents the path to the value you want to interact on. For example, say you've got an object with the key `movies` in `AsyncStorage`, that has a nested object with the key `shawshank_redemption`, with a property named `released`. To get that value, you simply would pass that to the `get` method like so:

```js
store.get('movies/shawshank_redemption/released')
.then((value) => console.log(value))
// would log out --> 1994
```

## Usage
```js
// using ES6 modules to import rn-object-store

import React from 'react-native';
import store from 'rn-object-store';

class Movie extends React.Component {
	...

	componentDidMount() {
		const key = this.props.route.id;

		store.get(`movies/${key}`).then((movie) => {
			this.setState({ movie });
		});

	componentWillUnmount() {
		// the movie obj has been edited and now needs to be updated
		const key   = this.props.route.id;
		const movie = this.state.movie;
		store.set(`movies/${key}`, movie).then((key) => {
			console.log('key updated is: ' + key);
		});
	}
}
```

In the example above, what if the `movies` object is `undefined`? We can only set an object if the base object, in this case `movies` is an object. There is two ways of handling this case, the first would be to catch the error in `componentDidMount` of the `Movie` component:

```js
componentWillUnmount() {
	const key   = this.props.route.id;
	const movie = this.state.movie;
	store.set(`movies/${key}`, movie).then((key) => {
		console.log('key updated is: ' + key);
	})

	// if the value you are trying to set is undefined
	// the error value will be inside a catch

	.catch((err) => {
		store.set('movies', {})
		.then(() => store.set(`movies/${key}`, movie))
	});

	// however this approach requires us to call store.set() twice
}
```

A better approach would be to check if the `movies` object is defined when the root component's constructor is called.

```js
class App extends React.Component {
	constructor() {
		super();

		store.get('movies')
		.catch(store.set('movies', {}))
	}
}
```

## Todo

- Let `remove()` accept an array of paths to delete
- Add unit tests

## License

MIT Licensed Copyright (c) Cameron Bourke 2016
