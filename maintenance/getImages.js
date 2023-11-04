/**
 * periodic table
 * maintenance script: getImages
 * 
 * get images from wikimedia
 */

'use strict';

/**
 * load config
 */

const yaml = require( 'js-yaml' );
const config = require( 'config' );

require( 'log-timestamp' );

/**
 * load required modules
 */

const axios = require( 'axios' );
const im = require( 'imagemagick' );
const fs = require( 'fs' );
const DB = require( './../src/database' );

/**
 * define contants
 */

const path = './public/images/';
const elements = new DB( 'elements' );

/**
 * proceed maintenance script
 */

/**
 * [async] get image from url
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
             * fetch error while creating image
             */

            throw err;

        } else {

            console.log( '... image for "' + el + '" downloaded successfully' );

            /**
             * generate thumbnail image
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
                     * fetch error while creating thumbnail
                     */

                    throw err;

                } else {

                    fs.writeFileSync( path + el + '-thumb.jpg', stdout, 'binary' );

                    console.log( '... thumbnail for "' + el + '" generated successfully' );

                }

            } );

            /**
             * resize original image
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
                     * fetch error while resizing original image
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
                                 * fetch error while deleting image
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

for( const [ k, el ] of Object.entries( elements.database ) ) {

    if( 'image' in el && 'url' in el.image ) {

        getImage( k, el.image.url );

    }

}