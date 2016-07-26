'use strict';

const uglify = require( 'gulp-uglify' );
const bowerResolve = require( 'bower-resolve' );
const nodeResolve = require( 'resolve' );
const browserify = require( 'browserify' );
const babelify = require( 'babelify' );
const es3ify = require( 'es3ify' );

const production = (process.env.NODE_ENV == 'production');

exports.bundler = browserifyBundler;
exports.getBowerPackageIds = getBowerPackageIds;
exports.getNPMPackageIds = getNPMPackageIds;
exports.getConfiguredUglify = getConfiguredUglify;

function browserifyBundler( options ) {
	options = Object.assign({
		babelify: true,
		es3ify: false,
		debug: false,
		vendor: false,
		appEntry: '',
		appEntryModuleId: '',
	}, options );

	let bundler = browserify({
		debug: options.debug,
	});

	if( options.babelify ) {
		bundler.transform( babelify );
	}

	if( options.es3ify ) {
		bundler.transform( es3ify );
	}

	if( options.appEntry ) {
		if( options.appEntryModuleId ) {
			bundler.require( options.appEntry, { expose: options.appEntryModuleId });
		}
		else {
			bundler.add( options.appEntry );
		}
	}

	if( options.vendor ) {
		getBowerPackageIds().forEach( id => {
			bundler.require( bowerResolve.fastReadSync( id ), { expose: id });
		});

		getNPMPackageIds().forEach( id => {
			bundler.require( nodeResolve.sync( id ), { expose: id });
		});
	}
	else {
		getBowerPackageIds().forEach( id => { bundler.external( id ) });
		getNPMPackageIds().forEach( id => { bundler.external( id ) });
	}

	return bundler;
}

function getBowerPackageIds() {
	let bowerManifest = {};

	try {
		bowerManifest = require( './bower.json' );
	}
	catch( error ) {
		// No bower manifest.
	}

	return Object.keys( bowerManifest.dependencies || {} ) || [];
}

function getNPMPackageIds() {
	let packageManifest = {};

	try {
		packageManifest = require( './package.json' );
	}
	catch( error ) {
		// No package.json...?
	}

	return Object.keys( packageManifest.dependencies || {} ) || [];
}

function getConfiguredUglify() {
	return uglify({
		preserveComments: ! production,
		compress: production ? {} : false,
		output: production ? null : {
			beautify: true,
		},
		// Note: If you have issues with Uglify stomping on names it shouldn't, then set this to just false.
		mangle: production
	});
}
