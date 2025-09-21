/**
 * periodic table
 * maintenance script: buildTextIndex
 * 
 * merge database with a given json file
 * 
 * @argument    {String} database name of the database to merge into
 * @argument    {String} path path to file to merge from
 */

'use strict';

/**
 * load config
 */

const yaml = require( 'js-yaml' );
const config = require( 'config' );

require( 'log-timestamp' );

const databases = config.get( 'maintenance.databases' );

/**
 * load required modules
 */

const fs = require( 'fs' );
const merge = require( 'deepmerge' );
const DB = require( './../src/database' );

/**
 * proceed maintenance script
 * check necessary args
 */

if( process.argv[2] == undefined ) {

    /**
     * ERROR: no database name given
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
     * ERROR: no file path to merge from given
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

    const dbname = process.argv[2];
    const file = process.argv[3];

    /**
     * load database
     */

    console.log( 'load database "' + dbname + '" ...' );

    var database = new DB( dbname ).database;

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

    if( [ 'elements' ].includes( dbname ) ) {

        console.log( 'sort keys in database "' + dbname + '" ...' );

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

    console.log( 'save changes to "' + dbname + '" database ...' );

    fs.writeFile(
        './_db/' + dbname + '.json',
        JSON.stringify( result, null, 2 ),
        { flag: 'w' }, ( error ) => {

            if( error ) {

                /**
                 * fetch error while saving changed database
                 */

                return console.error( error );

            } else {

                console.log( '... done' );

            }

        }
    );

}