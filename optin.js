"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2016 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "optin",
			"path": "optin/optin.js",
			"file": "optin.js",
			"module": "optin",
			"author": "Richeve S. Bebedor",
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/optin.git",
			"global": true,
		}
	@end-module-configuration

	@module-documentation:
		Include client files.

		This will also provide statistics of the loaded client files.
	@end-module-documentation

	@include:
		{
			"doubt": "doubt",
			"falzy": "falzy",
			"harden": "harden",
			"lilfy": "lilfy",
			"truly": "truly",
			"truu": "truu"
		}
	@end-include
*/

if( typeof require == "function" ){
	var doubt = require( "doubt" );
	var falzy = require( "falzy" );
	var harden = require( "harden" );
	var lilfy = require( "lilfy" );
	var truly = require( "truly" );
	var truu = require( "truu" );
}

if( typeof window != "undefined" &&
	!( "doubt" in window ) )
{
	throw new Error( "doubt is not defined" );
}

if( typeof window != "undefined" &&
	!( "falzy" in window ) )
{
	throw new Error( "falzy is not defined" );
}

if( typeof window != "undefined" &&
	!( "harden" in window ) )
{
	throw new Error( "harden is not defined" );
}

if( typeof window != "undefined" &&
	!( "lilfy" in window ) )
{
	throw new Error( "lilfy is not defined" );
}

if( typeof window != "undefined" &&
	!( "truly" in window ) )
{
	throw new Error( "truly is not defined" );
}

if( typeof window != "undefined" &&
	!( "truu" in window ) )
{
	throw new Error( "truu is not defined" );
}

harden( "STYLE", "style" );
harden( "SCRIPT", "script" );

/*;
	@option:
		{
			"name:required": "string",
			"path:required": "string",
			"type": [
				"style",
				"script"
			],
			"version": "string",
			"callback": "string",

			"pointer": "string",
			"file": "string",
			"basePath": "string",

			"dependency": "[ 'object' ]"
		}
	@end-option
*/
var optin = function optin( option ){
	/*;
		@meta-configuration:
			{
				"option:required": [
					"object",
					"string"
				]
			}
		@end-meta-configuration
	*/

	if( typeof option == "string" ){
		if( typeof module == "object" && typeof module.require == "function" ){
			return module.require( option );

		}else{
			let token = option;
			let name = token.match( optin.MODULE_NAME_PATTERN )[ 1 ];
			let file = token.match( optin.MODULE_FILE_PATTERN );

			option = { "name": name, "file": file };
		}
	}

	if( !optin.BOOTED ){
		throw new Error( "optin is not loaded properly" );
	}

	option = option || { };

	let dependency = option.dependency;
	if( truu( dependency ) && doubt( dependency ).ARRAY ){
		let element = [ ];

		dependency = dependency.reverse( );

		while( dependency.length ){
			element.push( optin( dependency.pop( ) ) );
		}

		return element;
	}

	let name = option.name;
	if( falzy( name ) ){
		throw new Error( "name not specified" );
	}

	if( name in optin.data.dependency ){
		console.log( name, "is already in the dependency list" );

		return optin.data.dependency[ name ].element;
	}

	let basePath = option.basePath ||
		window.BASE_LIBRARY_PATH ||
		optin.DEFAULT_BASE_PATH;

	let file = option.file;

	let path = option.path;

	if( falzy( path ) && truly( name ) && truly( file ) ){
		path = [ basePath, name, file ].join( "/" );
	}

	if( falzy( path ) ){
		throw new Error( "path not specified" );
	}

	let type = option.type;
	if( falzy( type ) ){
		if( optin.STYLE_EXTENSION_PATTERN.test( path ) ){
			option.type = STYLE;

		}else if( optin.SCRIPT_EXTENSION_PATTERN.test( path ) ){
			option.type = SCRIPT;
		}
	}

	type = option.type;

	if( falzy( type ) ){
		throw new Error( "unknown dependency type" );
	}

	optin.data.dependency[ option.name ] = option;

	let element = null;
	if( type == STYLE ){
		element = document.createElement( "link" );
		element.setAttribute( "class", STYLE );

	}else if( type == SCRIPT ){
		element = document.createElement( "script" );
		element.setAttribute( "class", SCRIPT );

	}else{
		throw new Error( "unknown dependency type" );
	}

	option.element = element;

	element.setAttribute( "name", name );

	let version = option.version;
	if( truly( version ) ){
		element.setAttribute( "version", version );

		if( optin.QUERY_SEPARATOR_PATTERN.test( path ) ){
			path = path + "&version=" + version;

		}else{
			path = "?version=" + version;
		}
	}

	let pointer = option.pointer;
	if( truly( pointer ) ){
		if( optin.QUERY_SEPARATOR_PATTERN.test( path ) ){
			path = `${ path }&pointer=${ lilfy( pointer ) }`;

		}else{
			path = "?pointer=" + lilfy( pointer );
		}
	}

	if( type == STYLE ){
		element.setAttribute( "href", path );
		element.setAttribute( "rel", "stylesheet" );

	}else if( type == SCRIPT ){
		element.setAttribute( "src", path );
		element.setAttribute( "type", "application/javascript" );
	}

	let callback = option.callback;
	if( falzy( callback ) && optin.CALLBACK_PATTERN.test( path ) ){
		callback = path.match( optin.CALLBACK_NAME_PATTERN )[ 1 ];
	}

	if( truly( callback ) && !optin.CALLBACK_PATTERN.test( path ) ){
		if( optin.QUERY_SEPARATOR_PATTERN.test( path ) ){
			path = `${ path }&callback=${ callback }`;

		}else{
			path = `?callback=${ callback }`;
		}
	}

	if( truly( callback ) ){
		element.setAttribute( "onload", `optin.done( this, ${ callback } );` );

	}else{
		element.setAttribute( "onload", "optin.done( this );" );
	}

	element.setAttribute( "onerror", "optin.failed( this );" );

	optin.push( element );

	return element;
};

harden( "boot",
	function boot( ){
		harden( "head", document.querySelector( "head" ), optin );

		harden( "body", document.querySelector( "body" ), optin );

		harden( "onError",
			function onError( event ){
				console.debug( "error during loading", event );
			}, optin );

		window.addEventListener( "error", optin.onError );

		harden( "BOOTED", "booted", optin );

		return optin;
	}, optin );

harden( "data", optin.data || { }, optin );

harden( "dependency", optin.data.dependency || { }, optin.data );

harden( "queue", optin.queue || [ ], optin );

harden( "push",
	function push( element ){
		optin.queue.push( element );

		optin.load( );

		return optin;
	}, optin );

harden( "load",
	function load( ){
		if( optin.data.current ){
			return;
		}

		let element = optin.queue.pop( );

		if( !element ){
			let dependencyList = Object.keys( optin.data.dependency );

			let totalDependency = dependencyList.length;
			let loadedDependency = dependencyList
				.filter( function onEachDependency( name ){
					var data = optin.data.dependency[ name ];

					return ( data.status == "success" );
				} ).length;

			dependencyList = dependencyList
				.map( function onEachDependency( name ){
					let data = optin.data.dependency[ name ];

					let duration = ( data.timeEnd || data.timeStart ) - data.timeStart;
					data.duration = duration;

					let path = data.path;
					let status = data.status;
					console.log( `${ name }@${ path }:${ status }-${ duration }ms` );

					return data;
				} );

			let averageDuration = ( dependencyList
				.reduce( function onEachDependency( total, data ){
					return total + ( data.duration || 0 );
				}, 0 ) / loadedDependency ).toFixed( 2 );

			console.log( "all dependency loaded",
				`(${ loadedDependency }/${ totalDependency })`
				`${ averageDuration }ms` );

			return;
		}

		let type = element.getAttribute( "class" );
		let name = element.getAttribute( "name" );

		optin.data.current = name;

		optin.data.dependency[ name ].timeStart = Date.now( );

		if( type == STYLE ){
			optin.head.appendChild( element );

		}else if( type == SCRIPT ){
			optin.body.appendChild( element );
		}

		return optin;
	}, optin );

harden( "done",
	function done( self, callback ){
		if( self.getAttribute( "name" ) == optin.data.current ){
			let name = optin.data.current;

			let data = optin.data.dependency[ name ];

			data.timeEnd = Date.now( );
			data.status = "success";

			console.debug( name, "is loaded", self );

			delete optin.data.current;
		}

		if( typeof callback == "function" ){
			callback( );
		}

		optin.load( );

		return optin;
	}, optin );

harden( "failed",
	function failed( self ){
		if( self.getAttribute( "name" ) == optin.data.current ){
			let name = optin.data.current;

			console.debug( "failed loading", name, self );

			optin.data.dependency[ name ].status = "failed";

			delete optin.data.current;
		}

		optin.load( );

		return optin;
	}, optin );

harden.bind( optin )( "DEFAULT_BASE_PATH", "/library" );

harden.bind( optin )( "STYLE_EXTENSION_PATTERN", /(\.css|\.scss|\.less|\.style)$/ );

harden.bind( optin )( "SCRIPT_EXTENSION_PATTERN", /(\.js|\.jsx|\.script)$/ );

harden.bind( optin )( "MODULE_NAME_PATTERN", /([a-zA-Z0-9\-\_\.]+?)(?:\.[a-z]+)?$/ );

harden.bind( optin )( "MODULE_FILE_PATTERN", /[a-zA-Z0-9\-\_\.]+$/ );

harden.bind( optin )( "CALLBACK_PATTERN", /callback\=[a-zA-Z][a-zA-Z0-9_$]+?/ );

harden.bind( optin )( "CALLBACK_NAME_PATTERN", /callback\=([a-zA-Z][a-zA-Z0-9_$]+?)/ );

harden.bind( optin )( "QUERY_SEPARATOR_PATTERN", /\?/ );
