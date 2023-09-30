/**
 * periodic table
 * Node.js app entry point
 * 
 * @author      komed3 (Paul Köhler)
 * @version     1.0.0
 */

/**
 * load "express" web framework
 */
const express = require( 'express' );
const cookieParser = require( 'cookie-parser' );

/**
 * start express
 */
const app = express();

/**
 * define static folders/files
 */
app.use( '/css', express.static( 'public/styles' ) );
app.use( '/js', express.static( 'public/scripts' ) );
app.use( '/img', express.static( 'public/images' ) );

/**
 * enable cookies
 */
app.use( cookieParser() );

/**
 * i18n (multiple language support)
 */
const { I18n } = require( 'i18n' );

const i18n = new I18n( {
    locales: [ 'en', 'de' ],
    cookie: 'locale',
    directory: './i18n',
    extension: '.min.json'
} );

app.use( i18n.init );

/**
 * load required modules
 */
const html = require( './lib/html.min' );
const routes = require( './config/routes.min' );

/**
 * server routing
 */
routes.routes.forEach( ( route ) => {

    app.get( route[0], ( req, res ) => {

        try {

            var page = require( './app/' + route[1] + '.min' );

            res.status( route[2] || 200 ).send(
                page.out( html, req, res, route )
            );

        } catch( err ) {

            res.status( 500 ).send(
                'ERROR: ' + err
            );

        }

    } );

} );

/**
 * start web server
 */
const server = app.listen( 3000 );