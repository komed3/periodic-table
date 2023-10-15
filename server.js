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

process.env.ALLOW_CONFIG_MUTATIONS = true;

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

            let url = core.parseURL( req.originalUrl );
            let _url = url.map( p => {
                return p.toString().toLocaleLowerCase( req.getLocale() );
            } );

            /* canonical URL */

            let canonical = ( '/' + ( route[2] || _url[0] || '' ) + '/' +
                url.slice( 1 ).filter( p => !p.includes( '?' ) ).join( '/' ) + '/'
            ).replaceAll( '//', '/' ).slice( 0, -1 );

            res.locals.canonical = req.protocol + '://' + req.hostname + canonical;

            /* globally locals */

            res.locals.config = config.get( 'site' );
            res.locals.core = core;
            res.locals.site = route[1];
            res.locals.availableLanguages = config.get( 'i18n.languages' );
            res.locals.locale = req.getLocale();
            res.locals.theme = req.cookies.theme || config.get( 'site.theme' );
            res.locals.elements = elements;
            res.locals.search = { query: '' };
            res.locals.navURL = canonical;
            res.locals.table = { layer: 'set' };
            res.locals.list = { layer: 'set' };

            /* breadcrumbs */

            res.locals.breadcrumbs = [ [
                '/', req.__( 'start-title' )
            ] ];

            /* templates */

            switch( route[1] ) {

                case 'tools':

                    /* breadcrumbs */

                    res.locals.breadcrumbs.push( [
                        '/sitemap',
                        req.__( 'sitemap' )
                    ] );

                    res.locals.breadcrumbs.push( [
                        '/tools',
                        req.__( 'tools-title' )
                    ] );

                    break;

                case 'spectrum':

                    res.locals.spectrum = core.DB( 'spectrum' );

                    break;

                case 'element':

                    /* check if given element exists in DB */

                    let element = _url[1] || '';

                    if( element in elements ) {

                        res.locals.element = elements[ element ];
                        res.locals.text = core.DB( 'text/' + req.getLocale() + '/' + element );
                        res.locals.isotopes = isotopes[ element ] || [];

                        /* fetch image */

                        if( fs.existsSync( './public/images/' + element + '.jpg' ) ) {

                            res.locals.image = {
                                url: req.protocol + '://' + req.hostname + '/img/' + element + '.jpg',
                                fullres: '/img/' + element + '.jpg',
                                thumb: '/img/' + element + '-thumb.jpg'
                            };

                        }

                        /* spectral lines */

                        if( element in ( spectrum = core.DB( 'spectrum' ) ) ) {

                            res.locals.spectrum = spectrum[ element ];

                        }

                        /* element navigation */

                        let k = element_list.indexOf( element );

                        res.locals.nav = {
                            prev: element_list[ k - 1 ] || null,
                            next: element_list[ k + 1 ] || null
                        };

                        /* periodic table */

                        res.locals.table.current = element;

                    } else {

                        res.redirect( '/' );
                        return ;

                    }

                    break;

                case 'lists':

                    /* check if given list exists */

                    if( _url.length == 2 && config.get( 'site.lists' ).includes( _url[1] ) ) {

                        /* fetch list items */

                        let lists = [];

                        Object.values( elements ).forEach( ( el ) => {

                            if(
                                _url[1] in el &&
                                el[ _url[1] ] != null &&
                                !lists.includes( el[ _url[1] ] )
                            ) {

                                lists.push( el[ _url[1] ] );

                            }

                        } );

                        res.locals.lists = {
                            prop: _url[1],
                            items: lists
                        };

                        /* periodic table */

                        res.locals.table = {
                            layer: _url[1]
                        };

                        /* breadcrumbs */

                        res.locals.breadcrumbs.push( [
                            '/sitemap',
                            req.__( 'sitemap' )
                        ] );

                        res.locals.breadcrumbs.push( [
                            '/lists/' + _url[1],
                            req.__( _url[1] + '-label' )
                        ] );

                    } else {

                        res.redirect( '/' );
                        return ;

                    }

                    break;

                case 'list':

                    /* check if given list exists */

                    if( _url.length == 3 && config.get( 'site.lists' ).includes( _url[1] ) ) {

                        /* fetch list items */

                        let results = Object.fromEntries(
                            Object.entries( elements ).filter(
                                ( [ _k, el ] ) => _url[1] in el && el[ _url[1] ] == _url[2]
                            )
                        );

                        /* if list has items */

                        if( Object.keys( results ).length ) {

                            res.locals.list = {
                                layer: _url[1],
                                value: _url[2],
                                items: results
                            };

                            /* periodic table */

                            res.locals.table = {
                                layer: _url[1],
                                value: _url[2],
                                hl: _url[2]
                            };

                            /* nav URL */

                            res.locals.navURL = '/lists/' + _url[1];

                            /* breadcrumbs */

                            res.locals.breadcrumbs.push( [
                                '/sitemap',
                                req.__( 'sitemap' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/lists/' + _url[1],
                                req.__( _url[1] + '-label' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/lists/' + _url[1] + '/' + _url[2],
                                req.__( _url[1] + '-' + _url[2] )
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

                case 'scale':

                    /* check if given scale exsits */

                    if( _url.length == 2 && _url[1] in config.get( 'site.scales' ) ) {

                        let scale = config.get( 'site.scales' )[ _url[1] ];
                            scale.layer = _url[1];

                        /* fetch scale items */

                        scale.results = {};

                        for( const [ _k, el ] of Object.entries( elements ) ) {

                            if( ( value = core.fromPath( el, scale.key ) ) ) {

                                scale.results[ _k ] = {
                                    ...el,
                                    scale: {
                                        value: value,
                                        x: isNaN( value )
                                            ? value.value || 0
                                            : value
                                    }
                                };

                            }

                        }

                        /* if scale has items */

                        if( Object.keys( scale.results ).length ) {

                            /* calculate min, max, step if undefined */

                            let values = Object.values( scale.results );

                            if( scale.min == undefined || scale.max == undefined ) {

                                scale.min = values.reduce( ( a, b ) => {
                                    return a.scale.x < b.scale.x ? a : b;
                                } ).scale.x;

                                scale.max = values.reduce( ( a, b ) => {
                                    return a.scale.x > b.scale.x ? a : b;
                                } ).scale.x;

                            }

                            if( scale.step == undefined ) {

                                scale.step = Math.abs( ( scale.max - scale.min ) / 10 );

                            }

                            /* calculate scale steps */

                            for( const [ _k, res ] of Object.entries( scale.results ) ) {

                                let val = ( res.scale.x - scale.min ) / scale.step;

                                switch( scale.round ) {

                                    case 'floor':
                                        scale.results[ _k ].scale.y = Math.max( 0, Math.floor( val ) );
                                        break;

                                    case 'ceil':
                                        scale.results[ _k ].scale.y = Math.min( 10, Math.ceil( val ) );
                                        break;

                                    default:
                                        scale.results[ _k ].scale.y = Math.max( 0, Math.min( 10, Math.round( val ) ) );
                                        break;

                                }

                            }

                            res.locals.scale = scale;

                            /* periodic table */

                            res.locals.table = {
                                type: 'scale',
                                value: scale.results,
                                layer: scale.scheme
                            };

                            /* breadcrumbs */

                            res.locals.breadcrumbs.push( [
                                '/sitemap',
                                req.__( 'sitemap' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/scale/' + _url[1],
                                req.__( scale.label )
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

                    /* breadcrumbs */

                    res.locals.breadcrumbs.push( [
                        '/sitemap',
                        req.__( 'sitemap' )
                    ] );

                    res.locals.breadcrumbs.push( [
                        '/props',
                        req.__( 'props-title' )
                    ] );

                    break;

                case 'prop':

                    /* check if given property exists */

                    if( _url.length == 2 && config.get( 'site.props' ).includes( _url[1] ) ) {

                        /* fetch list items */

                        let results = Object.fromEntries(
                            Object.entries( elements ).filter(
                                ( [ _k, el ] ) => ( el.properties || [] ).includes( _url[1] )
                            )
                        );

                        /* if list has items */

                        if( Object.keys( results ).length ) {

                            res.locals.list = {
                                type: 'prop',
                                layer: 'prop',
                                value: _url[1],
                                items: results
                            };

                            /* periodic table */

                            res.locals.table = {
                                type: 'prop',
                                layer: 'prop',
                                value: _url[1]
                            };

                            /* breadcrumbs */

                            res.locals.breadcrumbs.push( [
                                '/sitemap',
                                req.__( 'sitemap' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/props',
                                req.__( 'props-title' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/prop/' + _url[1],
                                req.__( 'prop-' + _url[1] )
                            ] );

                        }

                    } else {

                        res.redirect( '/' );
                        return ;

                    }

                    break;

                case 'abundances':

                    /* breadcrumbs */

                    res.locals.breadcrumbs.push( [
                        '/sitemap',
                        req.__( 'sitemap' )
                    ] );

                    res.locals.breadcrumbs.push( [
                        '/abundances',
                        req.__( 'abundances-title' )
                    ] );

                    break;

                case 'abundance':

                    /* check if given abundance exists */

                    if( _url.length == 2 && config.get( 'site.abundances' ).includes( _url[1] ) ) {

                        /* fetch abundance results */

                        let results = {};

                        for( const [ _k, el ] of Object.entries( elements ) ) {

                            if( 'abundance' in el && _url[1] in el.abundance ) {

                                results[ _k ] = el.abundance[ _url[1] ].value;

                            }

                        }

                        /* if abundance has items */

                        if( Object.keys( results ).length ) {

                            res.locals.abundance = {
                                type: _url[1],
                                results: Object.entries( results )
                                    .sort( ( [ ,a ], [ ,b ] ) => b - a )
                                    .reduce( ( r, [ k, v ] ) => ( { ...r, [k]: v } ), {} )
                            };

                            /* nav URL */

                            res.locals.navURL = '/abundances';

                            /* breadcrumbs */

                            res.locals.breadcrumbs.push( [
                                '/sitemap',
                                req.__( 'sitemap' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/abundances',
                                req.__( 'abundances-title' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/abundance/' + _url[1],
                                req.__( _url[1] + '-abundance' )
                            ] );

                        }

                        //

                    } else {

                        res.redirect( '/abundances' );
                        return ;

                    }

                    break;

                case 'search':

                    /* get search query */

                    let query = req.query.q || req.query.query || '',
                        _query = query.toLocaleLowerCase( req.getLocale() );

                    if( _query.length ) {

                        /* fetch search results */

                        let results = [];

                        for( const [ el, index ] of Object.entries( core.DB( 'search_' + req.getLocale() ) ) ) {

                            if( index.includes( _query ) ) {

                                results.push( elements[ el ] );

                            }

                        }

                        res.locals.list.items = results;

                        res.locals.search = {
                            query: query,
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