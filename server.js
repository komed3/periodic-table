/**
 * periodic table
 * interactive periodic table with nuclides,
 * tools, lists and more
 * 
 * @author komed3 (Paul Köhler)
 * @version 2.0.1
 * @license MIT
 */

'use strict';

/**
 * load config file
 */

process.env.ALLOW_CONFIG_MUTATIONS = true;

const config = require( 'config' );

/**
 * load required modules
 */

const fs = require( 'fs' );
const core = require( './src/core' );
const formatter = require( './src/formatter' );
const DB = require( './src/database' );

/**
 * load globally used databases
 */

const elements = new DB( 'elements' );

/**
 * express framework
 */

const express = require( 'express' );

const app = express();

/**
 * request limiting
 */

const rateLimit = require( 'express-rate-limit' );

app.use( rateLimit( {
    windowMs: config.get( 'server.rateLimit.waiting' ),
    limit: config.get( 'server.rateLimit.requests' )
} ) );

/**
 * cookie parser
 */

const cookieParser = require( 'cookie-parser' );

app.use( cookieParser() );

/**
 * robots.txt and sitemap.xml
 */

app.get( '/robots.txt', ( req, res ) => {

    res.type( 'text/plain' );
    res.send( 'User-agent: *\nAllow: /' );

} );

app.get( '/sitemap.xml', ( req, res ) => {

    res.sendFile( __dirname + '/sitemap.xml' );

} );

/**
 * static resources
 */

app.use( '/css', express.static( __dirname + '/public/styles' ) );
app.use( '/js', express.static( __dirname + '/public/scripts' ) );
app.use( '/res', express.static( __dirname + '/public/resources' ) );
app.use( '/img', express.static( __dirname + '/public/images' ) );

/**
 * passing settings and save them as cookie
 * e.g. theme, locale ...
 */

app.use( '/set', ( req, res, next ) => {

    for( const [ key, val ] of Object.entries( req.query ) ) {

        res.cookie( key, val, {
            maxAge: config.get( 'server.cookieAge' ),
            httpOnly: true
        } );

    }

    if( ( req.get( 'referrer' ) || '' ).includes( req.get( 'host' ) ) ) {

        res.redirect( req.get( 'referrer' ) );

    } else {

        next();

    }

} );

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

        res.locals.navURL = '/' + url.normalized.slice( 1 ).join( '/' );
        res.locals.canonical = config.get( 'server.baseURL' ) + core.getCanonical( url.string );

        res.locals.locale = locale;
        req.cookies.locale = locale;

        res.locals.availableLanguages = config.get( 'i18n.list' );

        core.setLocale( i18n, locale );
        formatter.setLocale( i18n, locale );

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

    res.locals.config = config;
    res.locals.core = core;
    res.locals.f = formatter;

    res.locals.theme = (
        req.cookies.theme || config.get( 'themes.default' )
    );

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

    let key, list, path, prop, results, value;

    app.get( route[0], ( req, res ) => {

        let file = route[1];

        try {

            /**
             * locals
             */

            res.locals.site = route[1];
            res.locals.elements = elements;
            res.locals.breadcrumbs = [];

            res.locals.search = {
                query: req.query.q || req.query.query || ''
            };

            res.locals.table = {
                layer: 'set'
            };

            res.locals.list = {
                layer: 'set',
                items: {}
            };

            res.locals.breadcrumbs.push( [
                '/',
                res.__( 'home' )
            ] );

            /**
             * page locals
             */

            res.locals.page = {};

            switch( route[1] ) {

                /**
                 * default page
                 */
                default:

                    res.locals.breadcrumbs.push( [
                        '/' + route[1],
                        res.__( route[1] + '-title' )
                    ] );

                    break;

                /**
                 * abundance page
                 */
                case 'abundance':

                    let abundances = config.get( 'abundances' );

                    key = ( req.params.abundance || '' ).toLowerCase();

                    if( key in abundances ) {

                        let abundance = abundances[ key ];

                        /**
                         * fetch results and sort by abundance
                         */

                        results = Object.fromEntries(
                            Object.entries( elements.database ).filter(
                                ( [ _k, el ] ) => {
                                    return 'abundance' in el && key in el.abundance;
                                }
                            ).sort(
                                ( [ ,a ], [ ,b ] ) => {
                                    return b.abundance[ key ].value - a.abundance[ key ].value;
                                }
                            )
                        );

                        res.locals.page.abundance = {
                            ...abundance,
                            type: key,
                            items: results
                        };

                        /**
                         * generate map
                         */

                        let tiles = 500;

                        res.locals.map = [];

                        for( const [ k, el ] of Object.entries( results ) ) {

                            let val = Math.floor( el.abundance[ key ].value / 2e6 );

                            if( val > 2 && ( tiles - val ) > 0 && res.locals.map.length < 9 ) {

                                res.locals.map.push( {
                                    x: el.names[ res.getLocale() ],
                                    y: val
                                } );

                                tiles -= val;

                            } else {

                                break;

                            }

                        }

                        if( tiles > 0 ) {

                            res.locals.map.push( {
                                x: res.__( 'others' ),
                                y: tiles
                            } );

                        }

                        /**
                         * breadcrumbs
                         */

                        res.locals.breadcrumbs.push( [
                            '/abundances',
                            res.__( 'abundances-title' )
                        ] );

                        res.locals.breadcrumbs.push( [
                            '/abundance/' + key,
                            res.__( key + '-abundance' )
                        ] );

                    } else {

                        /**
                         * wrong abundance key given
                         * redirect to abundances page
                         */

                        res.redirect( core.url( '/abundances' ) );
                        return ;

                    }

                    break;

                /**
                 * data (database) page
                 */
                case 'data':

                    /**
                     * fetch downloadable databases
                     */

                    results = [];

                    config.get( 'maintenance.databases' ).forEach( ( database ) => {

                        path = __dirname + '/_db/' + database + '.json';

                        results.push( {
                            name: database,
                            path: path,
                            info: fs.statSync( path )
                        } );

                    } );

                    res.locals.page.databases = results;

                    break;

                /**
                 * elements page
                 */
                case 'element':

                    key = ( req.params.element || '' ).toLowerCase();

                    if( elements.has( key ) ) {

                        let element = elements.get( key );

                        /**
                         * element data
                         */

                        res.locals.page.element = {
                            name: element.names[ res.getLocale() ] || element.names[ config.get( 'i18n.default' ) ],
                            data: element,
                            text: ( new DB( 'text/' + res.getLocale() + '/' + key ) ).database,
                            spectrum: ( new DB( 'spectrum' ) ).get( key )
                        };

                        /**
                         * element image
                         */

                        if( fs.existsSync( __dirname + '/public/images/' + key + '.jpg' ) ) {

                            res.locals.page.image = {
                                url: './img/' + key + '.jpg',
                                fullres: '/img/' + key + '.jpg',
                                thumb: '/img/' + key + '-thumb.jpg'
                            }

                        }

                        /**
                         * element navigation
                         */

                        res.locals.page.nav = {
                            prev: elements.prev( key ),
                            next: elements.next( key )
                        };

                        /**
                         * periodic table
                         */

                        res.locals.table.current = key;

                    } else {

                        /**
                         * element not given or found
                         * redirect to home
                         */

                        res.redirect( core.url( '/' ) );
                        return ;

                    }

                    break;

                /**
                 * list page (single and overview)
                 */
                case 'list':

                    list = ( req.params.list || '' ).toLowerCase();
                    prop = ( req.params.prop || '' ).toLowerCase();

                    if( config.get( 'lists' ).includes( list ) ) {

                        res.locals.page.list = {
                            name: list,
                            prop: prop
                        };

                        /**
                         * periodic table
                         */

                        res.locals.table.layer = list;

                        /**
                         * breadcrumbs
                         */

                        res.locals.breadcrumbs.push( [
                            '/lists',
                            res.__( 'lists-title' )
                        ] );

                        res.locals.breadcrumbs.push( [
                            '/list/' + list,
                            res.__( list + '-label' )
                        ] );

                        if( prop.length ) {

                            /**
                             * single list prop page
                             */

                            file = 'list_prop';

                            /**
                             * fetch list items
                             */

                            results = Object.fromEntries(
                                Object.entries( elements.database ).filter(
                                    ( [ _k, el ] ) => list in el && el[ list ] == prop
                                )
                            );

                            if( Object.keys( results ).length ) {

                                res.locals.list = {
                                    layer: list,
                                    value: prop,
                                    items: results
                                };

                                /**
                                 * periodic table
                                 */

                                res.locals.table.value = prop;
                                res.locals.table.hl = prop;

                                /**
                                 * breadcrumbs
                                 */

                                res.locals.breadcrumbs.push( [
                                    '/list/' + list + '/' + prop,
                                    res.__( list + '-' + prop )
                                ] );

                            } else {

                                /**
                                 * list property not valid or empty
                                 * redirect to list page
                                 */

                                res.redirect( core.url( '/list/' + list ) );
                                return ;

                            }

                        } else {

                            /**
                             * list overview page
                             */

                            res.locals.page.list.items = [];

                            Object.values( elements.database ).forEach( ( el ) => {

                                if(
                                    list in el && el[ list ] != null &&
                                    !res.locals.page.list.items.includes( el[ list ] )
                                ) {

                                    res.locals.page.list.items.push( el[ list ] );

                                }

                            } );

                        }

                    } else {

                        /**
                         * list not exists
                         * redirect to lists page
                         */

                        res.redirect( core.url( '/lists' ) );
                        return ;

                    }

                    break;

                /**
                 * property page
                 */
                case 'prop':

                    prop = ( req.params.property || '' ).toLowerCase();

                    if( config.get( 'properties' ).includes( prop ) ) {

                        /**
                         * fetch elements with property set
                         */

                        results = Object.fromEntries(
                            Object.entries( elements.database ).filter(
                                ( [ _k, el ] ) => ( el.properties || [] ).includes( prop )
                            )
                        );

                        if( Object.keys( results ).length ) {

                            res.locals.list = {
                                type: 'prop',
                                layer: 'prop',
                                value: prop,
                                items: results
                            };

                            /**
                             * periodic table
                             */

                            res.locals.table = {
                                type: 'prop',
                                layer: 'prop',
                                value: prop
                            };

                            /**
                             * breadcrumbs
                             */

                            res.locals.breadcrumbs.push( [
                                '/props',
                                res.__( 'props-title' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/prop/' + prop,
                                res.__( 'prop-' + prop )
                            ] );

                        } else {

                            /**
                             * no results found
                             * redirect to properties page
                             */

                            res.redirect( core.url( '/props' ) );
                            return ;

                        }

                    } else {

                        /**
                         * wrong property name
                         * redirect to properties page
                         */

                        res.redirect( core.url( '/props' ) );
                        return ;

                    }

                    break;

                /**
                 * quiz page
                 */
                case 'quiz':

                    let quiz = [];

                    for( const [ _k, el ] of Object.entries( elements.database ) ) {

                        quiz.push( {
                            number: el.number,
                            symbol: el.symbol,
                            names: el.names,
                            score: el.number + ( el.period * 2 ) + (
                                el.group > 18
                                    ? 200
                                    : el.group > 2 && el.group < 13
                                        ? 100
                                        : 50
                            )
                        } );

                    }

                    res.locals.page.quiz = JSON.stringify( quiz );

                    break;

                /**
                 * scale page
                 */
                case 'scale':

                    let scales = config.get( 'scales' );

                    key = ( req.params.scale || '' ).toLowerCase();

                    if( key in scales ) {

                        let scale = scales[ key ];

                        /**
                         * fetch scale items
                         */

                        scale.results = {};

                        for( const [ k, el ] of Object.entries( elements.database ) ) {

                            if( ( value = elements.get( k + '.' + scale.key ) ) ) {

                                if( Array.isArray( value ) ) {

                                    value = value[0];

                                }

                                scale.results[ k ] = {
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

                        if( Object.keys( scale.results ).length ) {

                            /**
                             * calculate min and max if undefined
                             */

                            if( scale.min == undefined || scale.max == undefined ) {

                                let values = Object.values( scale.results );

                                scale.min = values.reduce( ( a, b ) => {
                                    return a.scale.x < b.scale.x ? a : b;
                                } ).scale.x;

                                scale.max = values.reduce( ( a, b ) => {
                                    return a.scale.x > b.scale.x ? a : b;
                                } ).scale.x;

                                if( scale.log ) {

                                    scale.min = Math.log( scale.min );
                                    scale.max = Math.log( scale.max );

                                }

                            }

                            /**
                             * calculate step if undefined
                             */

                            if( scale.step == undefined ) {

                                scale.step = Math.abs( ( scale.max - scale.min ) / 10 );

                            }

                            /**
                             * calculate scale values
                             */

                            for( const [ k, res ] of Object.entries( scale.results ) ) {

                                let val = ( ( scale.log
                                    ? Math.log( res.scale.x )
                                    : res.scale.x
                                ) - scale.min ) / scale.step;

                                switch( scale.round ) {

                                    case 'floor':
                                        scale.results[ k ].scale.y = Math.max( 0, Math.floor( val ) );
                                        break;

                                    case 'ceil':
                                        scale.results[ k ].scale.y = Math.min( 9, Math.ceil( val ) );
                                        break;

                                    default:
                                        scale.results[ k ].scale.y = Math.max( 0, Math.min( 9, Math.round( val ) ) );
                                        break;

                                }

                            }

                            /**
                             * proceed scale to output
                             */

                            res.locals.page.scale = scale;

                            /**
                             * periodic table
                             */

                            res.locals.table = {
                                type: 'scale',
                                value: scale.results,
                                layer: scale.scheme,
                                scale: +( scale.scaling || 0 )
                            };

                            /**
                             * breadcrumbs
                             */

                            res.locals.breadcrumbs.push( [
                                '/scales',
                                res.__( 'scales-title' )
                            ] );

                            res.locals.breadcrumbs.push( [
                                '/scale/' + key,
                                res.__( scale.label )
                            ] );

                        } else {

                            /**
                             * scale has no items
                             * redirect to scales page
                             */

                            res.redirect( core.url( '/scales' ) );
                            return ;

                        }

                    } else {

                        /**
                         * wrong scale name
                         * redirect to scales page
                         */

                        res.redirect( core.url( '/scales' ) );
                        return ;

                    }

                    break;

                /**
                 * search results page
                 */
                case 'search':

                    if( res.locals.search.query.length ) {

                        /**
                         * fetch search results
                         */

                        results = {};

                        ( new DB( 'search_' + res.getLocale() ) ).search(
                            res.locals.search.query.toLocaleLowerCase( res.getLocale() )
                        ).forEach( ( key ) => {

                            results[ key ] = elements.get( key );

                        } );

                        res.locals.search.found = Object.keys( results ).length;

                        res.locals.list.items = results;

                    } else {

                        /**
                         * empty search query
                         * redirect to home
                         */

                        res.redirect( core.url( '/' ) );
                        return ;

                    }

                    break;

                /**
                 * element spectrums
                 */
                case 'spectrum':

                    res.locals.page.spectrum = ( new DB( 'spectrum' ) ).database;

                    /**
                     * breadcrumbs
                     */

                    res.locals.breadcrumbs.push( [
                        '/spectrum',
                        res.__( 'spectrum-title' )
                    ] );

                    break;

                /**
                 * start page
                 */
                case 'start':
                    break;

            }

            /**
             * render output + send to client
             */

            res.status( 200 ).send(
                pug.renderFile(
                    __dirname + '/app/' + file + '.pug',
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

app.all( '/{*splat}', ( _, res ) => {

    res.redirect( core.url( '/404' ) );

} );

/**
 * start web server
 */

const server = app.listen(
    config.get( 'server.port' )
);