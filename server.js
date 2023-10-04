/**
 * periodic table
 * Node.js app entry point
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
 * load required modules/files
 */
const core = require( './lib/core' );
const elements = core.DB( 'elements' );
const element_list = Object.keys( elements );

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
app.use( '/_db', express.static( __dirname + '/_db' ) );
app.use( '/css', express.static( __dirname + '/public/styles' ) );
app.use( '/js', express.static( __dirname + '/public/scripts' ) );
app.use( '/img', express.static( __dirname + '/public/images' ) );

/**
* parse/use cookies
*/
app.use( cookieParser() );

/**
 * passing settings and save them as cookie
 * e.g. theme, locale ...
 */
app.use( '/set', ( req, res, next ) => {

    for( const [ key, val ] of Object.entries( req.query ) ) {

        res.cookie( key, val, { maxAge: 10e9, httpOnly: true } );

    }

    if( req.get( 'referrer' ).includes( req.get( 'host' ) ) ) {

        res.redirect( req.get( 'referrer' ) );

    } else {

        next();

    }

} );

/**
 * load template engine
 */
const pug = require( 'pug' );

/**
 * i18n (multiple language support)
 */
const { I18n } = require( 'i18n' );

const i18n = new I18n( {
    locales: config.get( 'i18n.languages' ),
    defaultLocale: config.get( 'i18n.default' ),
    cookie: 'locale',
    directory: __dirname + '/i18n'
} );

app.use( i18n.init );

app.use( ( req, res, next ) => {

    res.locals.__ = res.__ = function () {

        return i18n.__.apply( req, arguments );

    }

    next();

} );

/**
 * server routing
 */
const routes = require( './config/routes' );

routes.routes.forEach( ( route ) => {

    app.get( route[0], ( req, res ) => {

        try {

            /* parse URL */

            let url = core.parseURL( req.originalUrl );

            /* canonical URL */

            res.locals.canonical = req.protocol + '://' + req.hostname + ( route[2] || url[0] ) + '/' +
                url.slice( 1 ).filter( p => !p.includes( '?' ) ).join( '/' ) + '/';

            /* set locals */

            res.locals.core = core;
            res.locals.site = route[1];
            res.locals.availableLanguages = config.get( 'i18n.languages' );
            res.locals.elements = elements;
            res.locals.locale = req.getLocale();
            res.locals.theme = req.cookies.theme || 'light';
            res.locals.search = {
                query: req.query.q || req.query.query || ''
            };

            /* templates */

            switch( route[1] ) {

                case 'element':

                    /* check if given element exists in DB */

                    let element = ( url[1] || '' ).toString().toLowerCase();

                    if( element in elements ) {

                        let k = element_list.indexOf( element );

                        res.locals.element = elements[ element ];
                        res.locals.text = core.DB( 'text/' + req.getLocale() + '/' + element );
                        res.locals.nav = {
                            prev: element_list[ k - 1 ] || null,
                            next: element_list[ k + 1 ] || null
                        };

                    } else {

                        res.redirect( '/' );

                    }

                    break;

            }

            res.status( route[3] || 200 ).send(
                pug.renderFile(
                    __dirname + '/app/' + route[1] + '.pug',
                    res.locals
                )
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
const server = app.listen( config.get( 'server.port' ) );