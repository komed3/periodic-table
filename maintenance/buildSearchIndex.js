/**
 * periodic table
 * maintenance script: buildSearchIndex
 * 
 * build search index for all elements
 * 
 * @author      komed3 (Paul Köhler)
 * @version     2.0.0
 */

/**
 * load config
 */
const yaml = require( 'js-yaml' );
const config = require( 'config' );

/**
 * load required modules
 */
require( 'log-timestamp' );

/**
 * proceed maintenance script
 */

if( process.argv[2] == undefined ) {

    /**
     * ERROR: no language code given
     */

    console.error( 'ERROR: no language code given' );

    process.exit( 1 );

} else if( !config.get( 'i18n.languages' ).includes( process.argv[2] ) ) {

    /**
     * ERROR: wrong language code
     */

    console.error( 'ERROR: wrong language code' );

    process.exit( 1 );

} else {

    /**
     * define constants
     */

    const locale = process.argv[2];

    /**
     * load required modules
     */

    console.log( 'load required modules' );

    const fs = require( 'fs' );
    const core = require( './../lib/core' );

    /**
     * load elements database
     */

    console.log( 'load elements database' );

    const elements = core.DB( 'elements' );

    /**
     * loop through elements
     */

    console.log( 'loop through elements' );

    var index = {};

    for( const [ key, el ] of Object.entries( elements ) ) {

        console.log( 'build search index for [' + el.number + ']' + el.symbol + ' ...' );

        /**
         * get element text index
         */

        let text = core.DB( 'text/' + locale + '/' + key );

        /**
         * check if text index is available
         */

        if( 'plain' in text ) {

            index[ key ] = text.plain
                .toString().toLowerCase().trim()
                .replaceAll( /[^a-zA-Z ]/g, '' )
                .replaceAll( /[\s+]/g, ' ' );

            console.log( '... done' );

        } else {

            /**
             * skip element
             */

            index[ key ] = '';

            console.log( '... skipped' );

        }

    }

    /**
     * save search index
     */

    console.log( 'save search index ...' );

    fs.writeFile(
        __dirname + '/../_db/search_' + locale + '.json',
        JSON.stringify( index, null, 4 ),
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