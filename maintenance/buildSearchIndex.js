/**
 * periodic table
 * maintenance script: buildSearchIndex
 * 
 * build search index for all elements
 * 
 * @argument    {String} locale language code
 */

'use strict';

/**
 * load config + basics
 */

const yaml = require( 'js-yaml' );
const config = require( 'config' );

require( 'log-timestamp' );

/**
 * proceed maintenance script
 * check necessary args
 */

if( process.argv[2] == undefined ) {

    /**
     * ERROR: no language code given
     */

    console.error( 'ERROR: no language code given' );

    process.exit( 1 );

} else if( !config.get( 'i18n.list' ).includes( process.argv[2] ) ) {

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
    const DB = require( './../src/database' );

    /**
     * load elements database
     */

    console.log( 'load elements database' );

    const elements = new DB( 'elements' );

    /**
     * loop through elements
     */

    console.log( 'loop through elements' );

    var index = {};

    for( const [ key, el ] of Object.entries( elements.database ) ) {

        console.log( 'build search index for [' + el.number + ']' + el.symbol + ' ...' );

        /**
         * get element text index
         */

        let text = new DB( 'text/' + locale + '/' + key );

        /**
         * check if text index is available
         */

        if( text.has( 'plain' ) ) {

            /**
             * build text index for current element
             */

            index[ key ] = text.get( 'plain' )
                .toString().toLocaleLowerCase( locale ).trim()
                .replaceAll( /[^a-zA-ZäöüÄÖÜß ]/g, '' )
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
        JSON.stringify( index, null, 2 ),
        { flag: 'w' }, ( error ) => {

            if( error ) {

                /**
                 * fetch error while creating file
                 */

                return console.error( error );

            } else {

                console.log( '... done' );

            }

        }
    );

}