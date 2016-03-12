Skeleton: React+Redux in IE8
============================

A jumping-off point for creating React+Redux apps that support IE8.  To this end, it is locked to version 0.14.x of ReactJS.  Redux, being more or less just a pile of functions, doesn't have to worry as much about IE8's ES3 environment, unlike with FluxUtils.

Additionally, in a properly configured environment, this should provide ESLint-based linting and Flow type checking right off the bat.

The Gulpfile is largely taken from [sogko's _Browserify: Separating App and Vendor Bundles_ recipe](https://github.com/sogko/gulp-recipes/tree/master/browserify-separating-app-and-vendor-bundles).



Libraries
---------

### Compatibility

Ensuring broad compatibility across such a wide range of browserse basically requires updating them all to modern day JS Environments.  To that end, the following additional libraries are employed:

- [core-js](https://www.npmjs.com/package/core-js)
- [console-polyfill](https://www.npmjs.com/package/console-polyfill)
- [html5shiv](https://www.npmjs.com/package/html5shiv)


### Functionality

- [classnames](https://www.npmjs.com/package/classnames) to build CSS classname lists in a more JSlike fashion.
- [JSON3](https://www.npmjs.com/package/json3) for faster and more consistent JSON handling across all browsers.
- [Redux](http://redux.js.org/) to store app state in a central state atom.
- [ReduxThunk](https://www.npmjs.com/package/redux-thunk) for middleware supporting dispatching functions which themselves asynchronously dispatch actual actions later.
	- See [This StackOverflow answer](http://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559) for some detailed explanation.
	- See [the Async Actions section of the Redux Tutorial](http://redux.js.org/docs/advanced/AsyncActions.html) for a more step-by-step use of ReduxThunk.
- [ReduxLogger](https://www.npmjs.com/package/redux-logger) for middleware to log all actions dispatched the mutations they result in during development.
- [Reselect](https://github.com/reactjs/reselect) for derived data.


### Other Libraries

These are other things you might use in your project, depending on what you want/need.

- [ImmutableJS](https://facebook.github.io/immutable-js) for immutable collections that are easier to work with.  (`List#push` that returns a the new list, e.g.)
- [React Bootstrap](https://react-bootstrap.github.io/) for pre-made React Bootstrap components.



Other Features
--------------

### Tests

Testing is good.  This just has Mocha as a starting point.  Spec files are put in the `/test` dir.  Note how reducers are very easy to test!


### Preloader

When you need to use a preloader with some sort of progress indicator, ReactJS is a pretty large library, there's an option in the Gulpfile to treat the app entry file as another require rather than a Browserify entry point so that you can `require()` your app's entry point after you're certain everything is loaded.

Using it would work something like this:

```js
// gulpfile.js

//// Config
config.automaticallyEnterApp = false;

// ...
config.preloaderBundleName = 'preloader.js';
config.preloaderBase = './preloader';
config.preloaderEntry = `${config.preloaderBase}/index.js`;
config.preloaderWatch = `${config.preloaderBase}/**/*`;

//// Preloader
gulp.task( 'build-preloader', () => {
	let bundler = browserify({
			debug: ! production
		})
		.transform( babelify, {
			presets: [ 'es2015', 'react', 'stage-0' ]
		})
		.transform( es3ify )
		.add( config.preloaderEntry );
		;

	let outputStream = bundler.bundle()
		.pipe( source( config.preloaderBundleName ) )
		.pipe( buffer() )
		.pipe( sourcemaps.init({
			loadMaps: true
		}))
		.pipe( helpers.getConfiguredUglify() )
		.pipe( sourcemaps.write( config.appSourcemapsRelativeDest ) )
		.pipe( gulp.dest( config.public ) )
		;

	return outputStream;
});
```

Then, your preloader might look something like this:

```js
// preloader/index.js
import loadAll from './some-load-all';

loadAll([
	{ url: './vendor.js' },
	{ url: './app.js' },
	{ url: './app.css' }
], {
	progress: ( countLoaded, countTotal, itemJustLoaded ) => {
		document.getElementById( 'progress-bar' ).innerHTML =
			`<div class="progress-bar-progress" style="width: ${ countLoaded / countTotal * 100 }%;"></div>`;
	},
	complete: () => {
		// where 'app' is whatever you specify for gulpfile/config.appEntryModuleId.
		require( 'app' );
	},
	error: ( err ) => {
		// do something to signal the user that loading failed.
	}
});
```



Reasoning
---------


### ReactJS is huge, core-js is a lot of bulk

Admittedly, ReactJS and its dependencies form the bulk of the deliverable size, that with core-js weighing in about 600kB minified and uglified.  While it is large, it makes coding the UI much easier by reducing the number of different files needed to build a single UI component, as well as allowing easier onboarding of other developers.  In this sense, it represents a trade off between deliverable size/complexity and speed of development.


### Why Not Flux Utils

Although technically, the given Flux Utils can be made to work in an ES3 environment, trying to force the use non-strict classes in ES6 class Babel plugin breaks the precompiled Flux Utils as they're compiled with strict classes.  Redux is simpler in that it does not use classes at all, nor does it need a dispatcher, mutations being carried out instead by a top-level reducer function composed of smaller discrete reducer functions.


### ImmutableJS and IE8

ImmutableJS isn't included here as it's both orthogonal to this skeleton and installation and use is dead simple.  If you do want to use ImmutableJS in IE8 and other ES3 environments, though, about the only real caveat is that you cannot use property access to get Records' fields as ES3 does not support getters/setters, meaning you must always use `record.get()` and `record.set()`.

Additionally, due to sticking to the `es2015` Babel preset, you cannot readily use ES6 class extensions is ES3 environments since you'd have to enable loose classes, which itself requires ditching that Babel preset and including all of the plugins in it.  This means you cannot easily add Flow type checking to your Records by first creating a Record class with defaults as normal then subclassing that to add typing.


### ES6 in Enterprise Environments (ES3)

ES6, though some of the features are a bit to get used to, provides a great number of affordances in the grammar that ease expressing programmer intent.  Mostly, these can be translated to ES3 with minimal unexpected behavior, but there are still considerations one must keep in mind when targeting an ES3 environment even with transpilation, the lack of getters/setters being just one of them.

If you run into `Object doesn't support this property or method` errors in IE, make sure you've got `es3ify` still running (it should be) and haven't tried to call a property that's defined by a getter.
