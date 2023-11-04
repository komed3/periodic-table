/**
 * periodic table
 * maintenance script: buildTextIndex
 * 
 * (re)build text index for all elements from wikipedia
 * 
 * @argument    {String} locale language code
 * @argument    {String} rebuild force rebuilding text index
 */

'use strict';

/**
 * load config
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
    const url = 'https://' + locale + '.wikipedia.org/w/api.php';
    const dir = __dirname + '/../_db/text/' + locale;

    /**
     * force rebuilding text index
     */

    const rebuild = ( process.argv[3] || '' ).toString().toLowerCase() == 'rebuild';

    /**
     * load required modules
     */

    console.log( 'load required modules' );

    const fs = require( 'fs' );
    const wiki = require( 'wikijs' ).default;
    const DB = require( './../src/database' );

    /**
     * check if language directory exists
     */

    if( !fs.existsSync( dir ) ) {

        /**
         * create language directory
         */

        fs.mkdirSync( dir, { recursive: true } );

    }

    /**
     * load elements database
     */

    console.log( 'load elements database' );

    const elements = new DB( 'elements' );

    /**
     * loop through elements
     */

    console.log( 'loop through elements' );

    let skipped = 0;

    for( const [ key, el ] of Object.entries( elements.database ) ) {

        /**
         * fetch wiki page title from database
         */

        if( el.wiki && locale in el.wiki ) {

            let file = dir + '/' + key + '.json';

            /**
             * fetch if not exists or on forced rebuilding
             */

            if( !fs.existsSync( file ) || rebuild ) {

                console.log( 'update [' + el.number + ']' + el.symbol + ' ...' );

                /**
                 * wiki api request for element page summary text
                 */

                wiki( { apiUrl: url } )
                    .page( el.wiki[ locale ] )
                    .then( page => page.summary() )
                    .then( plain => {

                        /**
                         * prepare text
                         */

                        let text = plain
                            .replaceAll( '()', '' )
                            .replaceAll( '[]', '' )
                            .replaceAll( '{}', '' )
                            .replaceAll( /\.(\S)/g, '. $1' )
                            .split( /\r?\n|\r|\n/g );

                        /**
                         * (over)write text file
                         */

                        fs.writeFile( file, JSON.stringify( {
                            plain: text.join( ' ' ),
                            text: '<p>' + text.join( '</p><p>' ) + '</p>',
                            description: text[0]
                        }, null, 4 ), { flag: 'w' }, ( error ) => {

                            if( error ) {

                                /**
                                 * fetch error while creating file
                                 */

                                return console.error( error );

                            } else {

                                console.log( '... saved [' + el.number + ']' + el.symbol + ' into text database' );

                            }

                        } );

                    } );

            } else {

                /**
                 * skip element
                 */

                skipped++;

            }

        }

    }

    /**
     * skipped elements? output rebuild notice
     */

    if( skipped > 0 ) {

        console.log( skipped + ' elements skipped, to rebuild index use param "rebuild" after language code' );

    }

    /**
     * recommend to rebuild search index
     */

    console.log( 'to rebuild the search index, use the following command:' );
    console.log( 'npm run buildSeachIndex -- ' + locale );

}