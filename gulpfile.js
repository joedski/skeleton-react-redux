'use strict';

/**
Most of this file is pulled, verbatim, from https://github.com/sogko/gulp-recipes/tree/master/browserify-separating-app-and-vendor-bundles
I highly recommend reading through their comments there, it's most excellent.
**/

const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const sourcemaps = require( 'gulp-sourcemaps' );

const source = require( 'vinyl-source-stream' );
const buffer = require( 'vinyl-buffer' );
const browserify = require( 'browserify' );
const babelify = require( 'babelify' );
const es3ify = require( 'es3ify' );
const bowerResolve = require( 'bower-resolve' );
const nodeResolve = require( 'resolve' );

const helpers = require( './gulpfile.helpers' );



//////// Config

// Use environment variable rather than `gulp --type=production`.
const production = (process.env.NODE_ENV == 'production');

const config = {};

//// General config.
// The public dir: Where things will get written to.
config.public = './public';

//// Vendor File Config
// Bundle name for the vendor files.
config.vendorBundleName = 'vendor.js';
config.vendorSourcemapsRelativeDest = './';

//// App Configuration
// Whether or not Browserify should automatically enter your app's entry point.
// Set this to false if you want to enter via preloader, for instance.
config.automaticallyEnterApp = true;
config.appBase = './source';

config.appAssetsBase = `${ config.appBase }/assets`;
config.appAssets = `${ config.appAssetsBase }/**/*`;
config.appAssetsWatch = [ config.appAssets ];

config.appBundleName = 'app.js';
config.appEntry = `${ config.appBase }/index.js`;
config.appEntryModuleId = 'app';
config.appWatch = [
	`${ config.appBase }/**/*`
].concat( config.appAssetsWatch.map( watch => `!${watch}` ) );

config.appSourcemapsRelativeDest = './';



////////

gulp.task( 'default', [ 'build-scripts', 'build-assets' ]);

gulp.task( 'watch', () => {
	gulp.watch( config.appWatch, [ 'build-app' ]);
	gulp.watch( config.appAssetsWatch, [ 'build-assets' ]);
})



//// Scripts

// also add a preloader here if using one of those.
gulp.task( 'build-scripts', [ 'build-app', 'build-vendor' ]);

gulp.task( 'build-vendor', () => {
	var bundler = browserify({
			debug: ! production
		})
		// TODO: AFAIK Browserify doesn't apply transforms to node_modules.
		// Check if that's actually the case here.  If so, I can omit these.
		// However, I also seem to recall es3ify making a difference, so.
		.transform( babelify, {
			presets: [ 'es2015', 'react', 'stage-0' ]
		})
		.transform( es3ify )
		;

	helpers.getBowerPackageIds().forEach( id => {
		bundler.require( bowerResolve.fastReadSync( id ), { expose: id });
	});

	helpers.getNPMPackageIds().forEach( id => {
		bundler.require( nodeResolve.sync( id ), { expose: id });
	});

	let bufferedStream = bundler.bundle()
		// Browserify Errors.
		.on( 'error', err => {
			gutil.log( err.message );
			this.emit( 'end' );
		})
		.pipe( source( config.vendorBundleName ) )
		.pipe( buffer() )
		;

	let outputStream = bufferedStream
		.pipe( sourcemaps.init({
			loadMaps: true
		}) )
		.pipe( helpers.getConfiguredUglify() )
		// Uglify Errors.
		.on( 'error', err => {
			gutil.log( err.message );

			if( err.fileName && err.lineNumber ) {
				console.error( `location: ${ err.fileName }:${ err.lineNumber }` );
			}

			this.emit( 'end' );
		})
		.pipe( sourcemaps.write( config.vendorSourcemapsRelativeDest ) )
		.pipe( gulp.dest( config.public ) )
		;

	return outputStream;
});

gulp.task( 'build-app', () => {
	let bundler = browserify({
			debug: ! production
		})
		.transform( babelify, {
			presets: [ 'es2015', 'react', 'stage-0' ]
		})
		.transform( es3ify )
		;

	if( config.automaticallyEnterApp ) {
		bundler.add( config.appEntry );
	}
	else {
		bundler.require( config.appEntry, { expose: config.appEntryModuleId });
	}

	helpers.getBowerPackageIds().forEach( id => {
		bundler.external( id );
	});

	helpers.getNPMPackageIds().forEach( id => {
		bundler.external( id );
	});

	let outputStream = bundler.bundle()
		.pipe( source( config.appBundleName ) )
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



//// Assets

gulp.task( 'build-assets', () => {
	gulp.src( config.appAssets, { base: config.appAssetsBase })
		.pipe( gulp.dest( config.public ) )
		;
});
