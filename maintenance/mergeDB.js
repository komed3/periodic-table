/**
 * periodic table
 * maintenance script: buildTextIndex
 * 
 * (re)build text index for all elements from wikipedia
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

    const database = core.DB( process.argv[2] );
    const file = process.argv[3];

    /**
     * load merge file
     */

    console.log( 'read file to merge ...' );

    const input = JSON.parse(
        fs.readFileSync( file, 'utf8' )
    );

    console.log( '... done' );

    /**
     * try to merge files
     */

    console.log( 'merge files ...' );

    const result = merge.all( [ database, input ] );

    console.log( '... done' );

    /**
     * save database changes
     */

    console.log( 'save changes to database ...' );

    fs.writeFile(
        './_db/' + process.argv[2] + '.json',
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

}