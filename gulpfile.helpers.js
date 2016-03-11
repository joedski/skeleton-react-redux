'use strict';

const uglify = require( 'gulp-uglify' );

const production = (process.env.NODE_ENV == 'production');

exports.getBowerPackageIds = getBowerPackageIds;
exports.getNPMPackageIds = getNPMPackageIds;
exports.getConfiguredUglify = getConfiguredUglify;

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
