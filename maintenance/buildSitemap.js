/**
 * periodic table
 * maintenance script: buildSitemap
 * 
 * build sitemap
 */

'use script';

/**
 * load config
 */

const yaml = require( 'js-yaml' );
const config = require( 'config' );

require( 'log-timestamp' );

/**
 * load required modules
 */

const fs = require( 'fs' );
const DB = require( './../src/database' );

/**
 * proceed maintenance script
 */

console.log( 'build sitemap' );

const baseURL = config.get( 'server.baseURL' );
const languages = config.get( 'i18n.list' );

/**
 * add link to sitemap (in each language)
 * @param {String} link page link
 */
const add2Sitemap = ( link ) => {

    languages.forEach( ( lang ) => {

        sitemap.push( baseURL + '/' + lang + '/' + link );

    } );

};

/**
 * add essential pages to sitemap
 */

var sitemap = [];

add2Sitemap( '' );
add2Sitemap( 'nuclides' );
add2Sitemap( 'ionization' );
add2Sitemap( 'spectrum' );
add2Sitemap( 'quiz' );
add2Sitemap( 'sitemap' );
add2Sitemap( 'glossary' );
add2Sitemap( 'data' );
add2Sitemap( 'privacy' );

/**
 * add tools to sitemap
 */

console.log( 'add tools to sitemap' );

add2Sitemap( 'tools' );

config.get( 'tools' ).forEach( ( tool ) => {

    add2Sitemap( 'tool/' + tool );

} );

/**
 * add lists to sitemap
 */

console.log( 'add lists to sitemap' );

add2Sitemap( 'lists' );

config.get( 'lists' ).forEach( ( list ) => {

    add2Sitemap( 'list/' + list );

} );

/**
 * add scales to sitemap
 */

console.log( 'add scales to sitemap' );

add2Sitemap( 'scales' );

Object.keys( config.get( 'scales' ) ).forEach( ( list ) => {

    add2Sitemap( 'scale/' + list );

} );

/**
 * add properties to sitemap
 */

console.log( 'add properties to sitemap' );

add2Sitemap( 'props' );

config.get( 'properties' ).forEach( ( prop ) => {

    add2Sitemap( 'prop/' + prop );

} );

/**
 * add abundances to sitemap
 */

console.log( 'add abundances to sitemap' );

add2Sitemap( 'abundances' );

Object.keys( config.get( 'abundances' ) ).forEach( ( list ) => {

    add2Sitemap( 'abundance/' + list );

} );

/**
 * add element pages to sitemap
 */

console.log( 'add element pages to sitemap' );

Object.values( ( new DB( 'elements' ) ).database ).forEach( ( el ) => {

    add2Sitemap( 'element/' + el.symbol );

} );

/**
 * add isotope pages to sitemap
 */

console.log( 'add isotope pages to sitemap' );

Object.values( ( new DB( 'nuclides' ) ).database ).forEach( ( entry ) => {

    add2Sitemap( 'isotope/' + entry.symbol );

} );

/**
 * create sitemap
 */

console.log( sitemap.length + ' entries were added to sitemap' );
console.log( 'create sitemap ...' );

fs.writeFile(
    __dirname + '/../sitemap.xml',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        sitemap.map( ( link ) => {
            return '<url><loc>' + link + '</loc></url>\n';
        } ).join( '' ) +
    '</urlset>',
    { flag: 'w' }, ( error ) => {

        if( error ) {

            /**
             * fetch error while creating sitemap
             */

            return console.error( error );

        } else {

            console.log( '... done' );

        }

    }
);