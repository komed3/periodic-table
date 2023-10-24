/**
 * periodic table
 * interactive periodic table with nuclides,
 * tools, lists and more
 * 
 * @author komed3 (Paul Köhler)
 * @version 2.0.0
 * @license MIT
 */

'use strict'

/**
 * load config file
 */

process.env.ALLOW_CONFIG_MUTATIONS = true;

const yaml = require( 'js-yaml' );
const config = require( 'config' );

/**
 * load required modules
 */

const core = require( './src/core' );
const formatter = require( './src/formatter' );

/**
 * express framework
 */

const express = require( 'express' );

const app = express();

/**
 * robots.txt
 */

app.get( '/robots.txt', ( req, res ) => {

    res.type( 'text/plain' );
    res.send( 'User-agent: *\nAllow: /' );

} );

/**
 * static resources
 */

app.use( '/css', express.static( __dirname + '/public/styles' ) );
app.use( '/js', express.static( __dirname + '/public/scripts' ) );
app.use( '/res', express.static( __dirname + '/public/resources' ) );
app.use( '/img', express.static( __dirname + '/public/images' ) );

/**
 * cookie parser
 */

const cookieParser = require( 'cookie-parser' );

app.use( cookieParser() );

/**
 * localization (i18n)
 */

const { I18n } = require( 'i18n' );

const i18n = new I18n( {
    locales: config.get( 'i18n.list' ),
    defaultLocale: config.get( 'i18n.default' ),
    cookie: 'locale',
    directory: __dirname + '/i18n'
} );

app.use( ( req, res, next ) => {

    let url = core.parseURL( req.originalUrl ),
        locale = url.normalized[0] || '';

    if( config.get( 'i18n.list' ).includes( locale ) ) {

        /**
         * localizazion
         */

        res.locals.canonical = req.protocol + '://' + req.hostname +
            core.getCanonical( url.string );

        res.locals.locale = locale;
        req.cookies.locale = locale;

        core.setLocale( locale );

        res.cookie( 'locale', locale, {
            maxAge: config.get( 'server.cookieAge' ),
            httpOnly: true
        } );

        next();

    } else {

        /**
         * i18n redirect
         */

        res.redirect( core.getCanonical( '/' + (
            req.cookies.locale || config.get( 'i18n.default' )
        ) + url.string ) );

    }

} );

app.use( i18n.init );

/**
 * use modules + basic locals
 */

app.use( ( req, res, next ) => {

    res.locals.core = core;
    res.locals.f = formatter;

    res.locals.theme = req.cookies.theme || config.get( 'themes.default' );

    next();

} );

/**
 * pug template engine
 */

const pug = require( 'pug' );

/**
 * routing
 */

const routes = require( './config/routes' );

routes.forEach( ( route ) => {

    app.get( route[0], ( req, res ) => {

        try {

            /**
             * locals
             */

            res.locals.site = route[1];

            /**
             * send rendered output
             */

            res.status( 200 ).send(
                pug.renderFile(
                    __dirname + '/app/' + route[1] + '.pug',
                    res.locals
                )
            );

        } catch ( err ) {

            /**
             * catch server error
             */

            res.status( 500 ).send(
                'ERROR: ' + err
            );

        };

    } );

} );

/**
 * 404 redirect
 */

app.all( '*', ( req, res ) => {

    res.redirect( core.url( '/404' ) );

} );

/**
 * start web server
 */

const server = app.listen(
    config.get( 'server.port' )
);