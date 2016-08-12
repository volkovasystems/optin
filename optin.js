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
			"class": true
		}
	@end-module-configuration

	@module-documentation:
		Include client files.

		This will also provide statistics of the loaded client files.
	@end-module-documentation

	@include:
		{
			"harden": "harden",
			"lilfy": "lilfy"
		}
	@end-include
*/

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

			"dependency": "Array"
		}
	@end-option
*/
var optin = function optin( option ){
	/*;
		@meta-configuration:
			{
				"option:required": "object"
			}
		@end-meta-configuration
	*/
	if( !optin.BOOTED ){
		throw new Error( "optin is not loaded properly" );
	}

	option = option || { };

	var dependency = option.dependency;
	if( dependency &&
		Array.isArray( dependency ) )
	{
		var element = [ ];

		dependency = dependency.reverse( );

		while( dependency.length ){
			element.push( optin( dependency.pop( ) ) );
		}

		return element;
	}

	var pointer = option.pointer;
	var file = option.file;
	var basePath = option.basePath;

	var name = option.name;
	if( !name ){
		throw new Error( "name not specified" );
	}

	if( name in optin.data.dependency ){
		console.log( name, "is already in the dependency list" );

		return optin.data.dependency[ name ].element;
	}

	var path = option.path;

	if( !path && name && file ){
		basePath = basePath ||
			window.BASE_LIBRARY_PATH ||
			"/library";

		path = [ basePath, name, file ].join( "/" );
	}

	if( !path ){
		throw new Error( "path not specified" );
	}

	var type = option.type;
	if( !type ){
		if( ( /(\.css|\.scss|\.less|\.style)$/ ).test( path ) ){
			option.type = STYLE;

		}else if( ( /(\.js|\.jsx|\.script)$/ ).test( path ) ){
			option.type = SCRIPT;
		}
	}

	type = option.type;

	if( !type ){
		throw new Error( "unknown dependency type" );
	}

	optin.data.dependency[ option.name ] = option;

	var element = null;
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

	var version = option.version;
	if( version ){
		element.setAttribute( "version", version );

		if( ( /\?/ ).test( path ) ){
			path = path + "&version=" + version;

		}else{
			path = "?version=" + version;
		}
	}

	if( pointer ){
		if( ( /\?/ ).test( path ) ){
			path = path + "&pointer=" + lilfy( pointer );

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

	var callback = option.callback;
	if( !callback &&
		( /callback\=[a-zA-Z][a-zA-Z0-9_$]+?/ ).test( path ) )
	{
		callback = ( path.match( /callback\=([a-zA-Z][a-zA-Z0-9_$]+?)/ ) || [ ] )[ 1 ];
	}

	if( callback &&
		!( /callback\=[a-zA-Z][a-zA-Z0-9_$]+?/ ).test( path ) )
	{
		if( ( /\?/ ).test( path ) ){
			path = path + "&callback=" + callback;

		}else{
			path = "?callback=" + callback;
		}
	}

	if( callback ){
		element.setAttribute( "onload",
			"optin.done( this, @callback );".replace( "@callback", callback ) );

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

		var element = optin.queue.pop( );

		if( !element ){
			var dependencyList = Object.keys( optin.data.dependency );

			var totalDependency = dependencyList.length;
			var loadedDependency = dependencyList
				.filter( function onEachDependency( name ){
					var data = optin.data.dependency[ name ];

					return ( data.status == "success" );
				} ).length;

			dependencyList = dependencyList
				.map( function onEachDependency( name ){
					var data = optin.data.dependency[ name ];

					var duration = ( data.timeEnd || data.timeStart ) - data.timeStart;
					data.duration = duration;

					console.log( name, "@", data.path, data.status, duration, "ms"  );

					return data;
				} );

			var averageDuration = ( dependencyList
				.reduce( function onEachDependency( total, data ){
					return total + data.duration;
				}, 0 ) / loadedDependency ).toFixed( 2 );

			console.log( "all dependency loaded",
				[ "(", loadedDependency, "/", totalDependency, ")" ].join( "" ),
				averageDuration, "ms" );

			return;
		}

		var type = element.getAttribute( "class" );
		var name = element.getAttribute( "name" );

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
			var name = optin.data.current;

			var data = optin.data.dependency[ name ];

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
			var name = optin.data.current;

			console.debug( "failed loading", name, self );

			optin.data.dependency[ name ].status = "failed";

			delete optin.data.current;
		}

		optin.load( );

		return optin;
	}, optin );
