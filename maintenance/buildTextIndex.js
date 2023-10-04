/**
 * periodic table
 * maintenance script: buildTextIndex
 * 
 * (re)build text index for all elements from wikipedia
 * 
 * @author      komed3 (Paul Köhler)
 * @version     2.0.0
 */

if( process.argv[2] == undefined ) {

    console.error( 'ERROR: no language code given' );

    process.exit( 1 );

} else if( ![ 'en', 'de' ].includes( process.argv[2] ) ) {

    console.error( 'ERROR: wrong language code' );

    process.exit( 1 );

} else {

    const rebuild = ( process.argv[3] || '' ) == 'rebuild';

    const locale = process.argv[2];
    const url = 'https://' + locale + '.wikipedia.org/w/api.php';
    const dir = __dirname + '/../_db/text/' + locale;

    console.log( 'load required modules' );

    const fs = require( 'fs' );
    const wiki = require( 'wikijs' ).default;
    const core = require( './../lib/core' );

    if( !fs.existsSync( dir ) ) {

        fs.mkdirSync( dir );

    }

    console.log( 'load elements database' );

    const elements = core.DB( 'elements' );

    console.log( 'loop through elements' );

    let skipped = 0;

    for( const [ key, el ] of Object.entries( elements ) ) {

        if( el.wiki && locale in el.wiki ) {

            let file = dir + '/' + key + '.json';

            if( !fs.existsSync( file ) || rebuild ) {

                console.log( 'update [' + el.number + ']' + el.symbol + ' ...' );

                wiki( { apiUrl: url } )
                    .page( el.wiki[ locale ] )
                    .then( page => page.summary() )
                    .then( plain => {

                        let text = plain.split( /\r?\n|\r|\n/g );

                        fs.writeFile( file, JSON.stringify( {
                            plain: text.join( ' ' ),
                            text: '<p>' + text.join( '</p><p>' ) + '</p>',
                            description: text[0]
                        }, null, 4 ), { flag: 'w' }, ( error ) => {

                            if( error ) {

                                return console.error( error );

                            } else {

                                console.log( '... saved [' + el.number + ']' + el.symbol + ' into text database' );

                            }

                        } );

                    } );

            } else {

                skipped++;

            }

        }

    }

    if( skipped > 0 ) {

        console.log( skipped + ' elements skipped, to rebuild index use param "rebuild" after language code' );

    }

}