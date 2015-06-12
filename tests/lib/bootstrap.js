( function() {

// Create a module that disables back compat for UI modules
define( "jquery-no-back-compat", [ "jquery" ], function( $ ) {
	$.uiBackCompat = false;

	return $;
} );

// Create a dummy bridge if we're not actually testing in PhantomJS
if ( !/PhantomJS/.test( navigator.userAgent ) ) {
	define( "phantom-bridge", function() {} );
}

// Load all modules in series
function requireModules( dependencies, callback, modules ) {
	if ( !dependencies.length ) {
		if ( callback ) {
			callback.apply( null, modules );
		}
		return;
	}

	if ( !modules ) {
		modules = [];
	}

	var dependency = dependencies.shift();
	require( [ dependency ], function( module ) {
		modules.push( module );
		requireModules( dependencies, callback, modules );
	} );
}

// Load a set of test file along with the required test infrastructure
function requireTests( dependencies, noBackCompat ) {
	dependencies = [
		"lib/qunit",
		noBackCompat ? "jquery-no-back-compat" : "jquery",
		"jquery-simulate"
	].concat( dependencies );

	// Load the TestSwarm injector, if necessary
	if ( parseUrl().swarmURL ) {
		dependencies.push( "testswarm" );
	}

	requireModules( dependencies, function( QUnit ) {
		QUnit.start();
	} );
}

// Parse the URL into key/value pairs
function parseUrl() {
	var data = {};
	var parts = document.location.search.slice( 1 ).split( "&" );
	var length = parts.length;
	var i = 0;
	var current;

	for ( ; i < length; i++ ) {
		current = parts[ i ].split( "=" );
		data[ current[ 0 ] ] = current[ 1 ];
	}

	return data;
}

function jqueryUrl() {
	var version = parseUrl().jquery;
	var url;

	if ( version === "git" || version === "compat-git" ) {
		url = "http://code.jquery.com/jquery-" + version;
	} else {
		url = "../../../external/jquery-" + ( version || "1.11.3" ) + "/jquery";
	}

	return url;
}

// Load test modules based on data attributes
// - modules: list of test modules to load
// - widget: A widget to load test modules for
//   - Automatically loads common, core, events, methods, and options
// - deprecated: Loads the deprecated test modules for a widget
// - no-back-compat: Set $.uiBackCompat to false
return function( options ) {

	// Read the modules
	var modules = options[ "modules" ];
	if ( modules ) {
		modules = modules
			.replace( /^\s+|\s+$/g, "" )
			.split( /\s+/ );
	} else {
		modules = [];
	}
	var widget = options[ "widget" ];
	var deprecated = !!options[ "deprecated" ];
	var noBackCompat = !!options[ "no-back-compat" ];

	if ( widget ) {
		modules = modules.concat([
			( deprecated ? "common-deprecated" : "common" ),
			"core",
			"events",
			"methods",
			"options"
		]);
		if ( deprecated ) {
			modules = modules.concat( "deprecated" );
		}
	}

	requireTests( modules, noBackCompat );
};

} )();
