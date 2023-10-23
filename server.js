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

/**
 * express framework
 */

const express = require( 'express' );

const app = express();

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

app.use( ( req, res, next ) => {

    let url = core.parseURL( req.originalUrl ),
        locale = url.normalized[0] || '';

    if( config.get( 'i18n.list' ).includes( locale ) ) {

        /**
         * save localizazion
         */

        res.locals.locale = locale;

        res.cookie( 'locale', locale, {
            maxAge: config.get( 'server.cookieAge' ),
            httpOnly: true
        } );

        next();

    } else {

        /**
         * i18n redirect
         */

        res.redirect( '/' + (
            req.cookies.locale || config.get( 'i18n.default' )
        ) + url.string );

    }

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
 * start web server
 */

const server = app.listen(
    config.get( 'server.port' )
);