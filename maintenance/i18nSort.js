/**
 * periodic table
 * maintenance script: i18nSort
 * 
 * read all JSON files from ./i18n/, sort their keys
 */

const fs = require( 'fs' );
const path = require( 'path' );

require( 'log-timestamp' );

const I18N_DIR = path.resolve( './i18n' );

function sortJSONByKey ( json ) {

    const sortedKeys = Object.keys( json ).sort();
    const sortedJSON = {};

    sortedKeys.forEach( key => sortedJSON[ key ] = json[ key ] );

    return sortedJSON;

}

function processFile ( filePath ) {

    try {

        const raw = fs.readFileSync( filePath, 'utf-8' );
        const sorted = sortJSONByKey( JSON.parse( raw ) );

        fs.writeFileSync( filePath, JSON.stringify( sorted, null, 2 ) + '\n', 'utf-8' );

        console.log( `Sorted file: ${ path.basename( filePath ) }` );

    } catch ( err ) {

        console.error( `Error processing file ${ filePath }:`, err.message );

    }

}

function main () {

    if ( ! fs.existsSync( I18N_DIR ) ) {

        console.error( 'Directory ./i18n/ not found.' );
        process.exit( 1 );

    }

    const files = fs
        .readdirSync( I18N_DIR )
        .filter( ( f ) => f.endsWith( '.json' ) );

    if ( files.length === 0 ) {

        console.log( 'No JSON files found in ./i18n/.' );
        return;

    }

    files.forEach( ( file ) => {
        const filePath = path.join( I18N_DIR, file );
        processFile( filePath );
    } );

}

main();
