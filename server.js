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
app.use( '/css', express.static( __dirname + '/public/styles' ) );
app.use( '/js', express.static( __dirname + '/public/scripts' ) );
app.use( '/img', express.static( __dirname + '/public/images' ) );
app.use( '/font', express.static( __dirname + '/public/fonts' ) );

/**
 * enable cookies
 */
app.use( cookieParser() );

/**
 * load template engine
 */
const pug = require( 'pug' );

/**
 * i18n (multiple language support)
 */
const availableLanguages = [ 'en', 'de' ];
const { I18n } = require( 'i18n' );

const i18n = new I18n( {
    locales: availableLanguages,
    cookie: 'locale',
    directory: __dirname + '/i18n',
    extension: '.min.json'
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
const routes = require( './config/routes.min' );

routes.routes.forEach( ( route ) => {

    app.get( route[0], ( req, res ) => {

        res.locals.site = route[1];
        res.locals.availableLanguages = availableLanguages;
        res.locals.locale = i18n.getLocale();
        res.locals.theme = req.cookies.theme || 'light';
        res.locals.search = { query: '' };

        try {

            res.status( route[2] || 200 ).send(
                pug.renderFile( __dirname + '/app/' + route[1] + '.pug', res.locals )
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