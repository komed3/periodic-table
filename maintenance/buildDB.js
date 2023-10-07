/**
 * periodic table
 * maintenance script: buildTextIndex
 * 
 * build minified database files to save space
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

console.log( 'load required modules' );

const fs = require( 'fs' );
const core = require( './../lib/core' );

/**
 * proceed maintenance script
 */

databases.forEach( ( DB ) => {

    /**
     * load database
     */

    console.log( 'load "' + DB + '" database ...' );

    let database = core.DB( DB );

    console.log( '... done' );

    /**
     * save minified database
     */

    console.log( 'save minified database ...' );

    fs.writeFile(
        './_db/' + DB + '.min.json',
        JSON.stringify( database ),
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

} );