/**
 * periodic table
 * maintenance script: buildTextIndex
 * 
 * merge database with a given json file
 * 
 * @author      komed3 (Paul Köhler)
 * @version     2.0.0
 */

/**
 * load config
 */

const yaml = require( 'js-yaml' );
const config = require( 'config' );

const databases = config.get( 'maintenance.databases' );

/**
 * load required modules
 */

require( 'log-timestamp' );

const fs = require( 'fs' );
const merge = require( 'deepmerge' );
const core = require( './../lib/core' );

/**
 * proceed maintenance script
 */

if( process.argv[2] == undefined ) {

    /**
     * ERROR: no DB name given
     */

    console.error( 'ERROR: no database name given' );
    console.log( 'possible values are "' + databases.join( '", "' ) + '"' );

    process.exit( 1 );

} else if( !databases.includes( process.argv[2] ) ) {

    /**
     * ERROR: wrong databse name
     */

    console.error( 'ERROR: "' + process.argv[2] + '" is not a valid database to merge into' );

    process.exit( 1 );

} else if( process.argv[3] == undefined ) {

    /**
     * ERROR: no file given
     */

    console.error( 'ERROR: no path or file to merge given' );

    process.exit( 1 );

} else if( !fs.existsSync( process.argv[3] ) ) {

    /**
     * ERROR: file not exists
     */

    console.error( 'ERROR: the given path "' + process.argv[3] + '" do not exist' );

    process.exit( 1 );

} else {

    /**
     * define constants
     */

    const DB = process.argv[2];
    const file = process.argv[3];

    /**
     * load database
     */

    console.log( 'load database "' + DB + '" ...' );

    var database = core.DB( DB );

    console.log( '... done' );

    /**
     * load file to merge
     */

    console.log( 'read file "' + file + '" to merge ...' );

    var input = JSON.parse( fs.readFileSync( file, 'utf8' ) );
    var keys = Object.keys( input );

    console.log( '... done; ' + keys.length + ' entries found' );

    /**
     * update timestamps
     */

    console.log( 'update timestamps ...' );

    Object.keys( input ).forEach( ( k ) => {
        input[ k ][ '@modified' ] = ( new Date() ).toJSON()
    } );

    console.log( '... done' );

    /**
     * try to merge files
     */

    console.log( 'merge files ...' );

    var result = merge.all( [ database, input ] );

    console.log( '... done' );

    /**
     * sort keys in database
     */

    if( [ 'elements' ].includes( DB ) ) {

        console.log( 'sort keys in database "' + DB + '" ...' );

        for( const [ el, data ] of Object.entries( result ) ) {

            result[ el ] = Object.keys( data ).sort().reduce( ( obj, key ) => {

                obj[ key ] = data[ key ];

                return obj;

            }, {} );

        }

        console.log( '... done' );

    }

    /**
     * save database changes
     */

    console.log( 'save changes to "' + DB + '" database ...' );

    fs.writeFile(
        './_db/' + DB + '.json',
        JSON.stringify( result, null, 4 ),
        { flag: 'w' }, ( error ) => {

            if( error ) {

                /**
                 * fetch error
                 */

                return console.error( error );

            } else {

                console.log( '... done' );

            }

        }
    );

    console.log( 'save changes to minified "' + DB + '" database ...' );

    fs.writeFile(
        './_db/' + DB + '.min.json',
        JSON.stringify( result ),
        { flag: 'w' }, ( error ) => {

            if( error ) {

                /**
                 * fetch error
                 */

                return console.error( error );

            } else {

                console.log( '... done' );

            }

        }
    );

}