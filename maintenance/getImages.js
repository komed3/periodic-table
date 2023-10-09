/**
 * periodic table
 * maintenance script: getImages
 * 
 * get images from wikimedia
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

const axios = require( 'axios' );
const im = require( 'imagemagick' );
const fs = require( 'fs' );
const core = require( './../lib/core' );

/**
 * define contants
 */

const path = './public/images/';
const elements = core.DB( 'elements' );

/**
 * proceed maintenance script
 */

/**
 * get image from url
 * @param {String} el element name
 * @param {String} url image url
 */
async function getImage( el, url ) {

    console.log( 'proceed image for "' + el + '" ...' );

    const response = await axios.get( url, { responseType: 'arraybuffer' } );
    const filetype = url.split( '.' ).reverse()[0].toString().toLowerCase();
    const filepath = path + el + '.' + filetype;

    fs.writeFile( filepath, response.data, ( err ) => {

        if( err ) {

            /**
             * fetch error
             */

            throw err;

        } else {

            console.log( '... image for "' + el + '" downloaded successfully' );

            /**
             * generate thumbnail
             */

            im.crop( {
                srcData: fs.readFileSync( filepath, 'binary' ),
                format: 'jpg',
                width: 600,
                height: 400,
                quality: 0.9,
                gravity: 'center'
            }, ( err, stdout, stderr ) => {

                if( err ) {

                    /**
                     * fetch error
                     */

                    throw err;

                } else {

                    fs.writeFileSync( path + el + '-thumb.jpg', stdout, 'binary' );

                    console.log( '... thumbnail for "' + el + '" generated successfully' );

                }

            } );

            /**
             * resize image
             */

            im.resize( {
                srcData: fs.readFileSync( filepath, 'binary' ),
                format: 'jpg',
                width: 2048,
                height: 1024,
                quality: 0.8
            }, ( err, stdout, stderr ) => {

                if( err ) {

                    /**
                     * fetch error
                     */

                    throw err;

                } else {

                    fs.writeFileSync(
                        filetype != 'jpg' ? path + el + '.jpg' : filepath,
                        stdout, 'binary'
                    );

                    console.log( '... image for "' + el + '" resized successfully' );

                    /**
                     * delete image if filetype != jpg
                     */

                    if( filetype != 'jpg' ) {

                        fs.unlink( filepath, ( err ) => {

                            if( err ) {

                                /**
                                 * fetch error
                                 */

                                throw err;

                            } else {

                                console.log( '... image for "' + el + '" with file type "' + filetype + '" deleted successfully' );

                            }

                        } );

                    }

                }

            } );

        }

    } );

}

/**
 * check if image folder exists
 */

if( !fs.existsSync( path ) ) {

    /**
     * create language directory
     */

    fs.mkdirSync( path, { recursive: true } );

}

/**
 * loop through elements database
 */

for( const [ el, data ] of Object.entries( elements ) ) {

    if( 'image' in data ) {

        getImage( el, data.image.url );

    }

}