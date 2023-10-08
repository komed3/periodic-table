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

const fs = require( 'fs' );
const core = require( './lib/core' );
const elements = core.DB( 'elements' );
const element_list = Object.keys( elements );
const isotopes = core.DB( 'isotopes' );

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
app.use( '/res', express.static( __dirname + '/public/resources' ) );
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

            let url = core.parseURL( req.originalUrl ),
                _url = url.map( p => {
                    return p.toString().toLocaleLowerCase( req.getLocale() );
                } );

            /* canonical URL */

            let canonical = ( '/' + ( route[2] || url[0] || '' ) + '/' +
                url.slice( 1 ).filter( p => !p.includes( '?' ) ).join( '/' ) + '/'
            ).replaceAll( '//', '/' ).slice( 0, -1 );

            res.locals.url = canonical;
            res.locals.canonical = req.protocol + '://' + req.hostname + canonical;

            /* breadcrumbs */

            res.locals.breadcrumbs = [ [
                '/', req.__( 'start-title' )
            ] ];

            /* set locals */

            res.locals.config = config.get( 'site' );
            res.locals.core = core;
            res.locals.site = route[1];
            res.locals.availableLanguages = config.get( 'i18n.languages' );
            res.locals.elements = elements;
            res.locals.locale = req.getLocale();
            res.locals.theme = req.cookies.theme || config.get( 'site.theme' );
            res.locals.search = { query: '' };

            /* templates */

            switch( route[1] ) {

                case 'element':

                    /* check if given element exists in DB */

                    let element = _url[1] || '';

                    if( element in elements ) {

                        let k = element_list.indexOf( element );

                        res.locals.element = elements[ element ];
                        res.locals.text = core.DB( 'text/' + req.getLocale() + '/' + element );
                        res.locals.isotopes = isotopes[ element ] || [];

                        if( fs.existsSync( './public/images/' + element + '.jpg' ) ) {

                            res.locals.image = {
                                url: req.protocol + '://' + req.hostname + '/img/' + element + '.jpg',
                                fullres: '/img/' + element + '.jpg',
                                thumb: '/img/' + element + '-thumb.jpg'
                            };

                        }

                        res.locals.nav = {
                            prev: element_list[ k - 1 ] || null,
                            next: element_list[ k + 1 ] || null
                        };

                    } else {

                        res.redirect( '/' );
                        return ;

                    }

                    break;

                case 'lists':

                    if( _url.length == 2 && config.get( 'site.lists' ).includes( _url[1] ) ) {

                        let list_prop = _url[1],
                            lists = [];

                        Object.values( elements ).forEach( ( el ) => {

                            if(
                                list_prop in el &&
                                el[ list_prop ] != null &&
                                !lists.includes( el[ list_prop ] )
                            ) {

                                lists.push( el[ list_prop ] );

                            }

                        } );

                        res.locals.prop = list_prop;
                        res.locals.layer = list_prop;
                        res.locals.lists = lists;

                        res.locals.breadcrumbs.push( [
                            '/lists/' + list_prop,
                            req.__( list_prop + '-label' )
                        ] );

                    } else {

                        res.redirect( '/' );
                        return ;

                    }

                    break;

                case 'list':

                    if( _url.length == 3 && config.get( 'site.lists' ).includes( _url[1] ) ) {

                        let list_prop = _url[1],
                            list_value = _url[2];

                        let list_res = Object.fromEntries(
                            Object.entries( elements ).filter(
                                ( [ _k, el ] ) => list_prop in el && el[ list_prop ] == list_value
                            )
                        );

                        let list_found = Object.keys( list_res ).length;

                        if( list_found ) {

                            res.locals.prop = list_prop;
                            res.locals.layer = list_prop;
                            res.locals.value = list_value;
                            res.locals.list = list_res;
                            res.locals.found = list_found;

                            res.locals.breadcrumbs.push( [
                                '/lists/' + list_prop,
                                req.__( list_prop + '-label' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/lists/' + list_prop + '/' + list_value,
                                req.__( list_prop + '-' + list_value )
                            ] );

                        } else {

                            res.redirect( '/' );
                            return ;

                        }

                    } else {

                        res.redirect( '/' );
                        return ;

                    }

                    break;

                case 'props':

                    res.locals.breadcrumbs.push( [
                        '/props',
                        req.__( 'props-title' )
                    ] );

                    break;

                case 'prop':

                    if( _url.length == 2 && config.get( 'site.props' ).includes( _url[1] ) ) {

                        res.locals.prop = _url[1];

                        res.locals.breadcrumbs.push( [
                            '/props',
                            req.__( 'props-title' )
                        ] );

                        res.locals.breadcrumbs.push( [
                            '/prop/' + _url[1],
                            req.__( 'prop-' + _url[1] )
                        ] );

                    } else {

                        res.redirect( '/' );
                        return ;

                    }

                    break;

                case 'search':

                    let query = req.query.q || req.query.query || '',
                        _query = query.toLocaleLowerCase( req.getLocale() );

                    if( query.length ) {

                        let results = [];

                        for( const [ el, index ] of Object.entries( core.DB( 'search_' + req.getLocale() ) ) ) {

                            if( index.includes( _query ) ) {

                                results.push( elements[ el ] );

                            }

                        }

                        res.locals.search = {
                            query: query,
                            results: results,
                            found: results.length
                        };

                    } else {

                        res.redirect( '/' );
                        return ;

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