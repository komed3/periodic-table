/**
 * periodic table
 * maintenance script: buildSitemap
 * 
 * build sitemap
 * 
 * @author      komed3 (Paul Köhler)
 * @version     2.0.0
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

var sitemap = [];

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
 * add lists to sitemap
 */

console.log( 'add lists to sitemap' );

add2Sitemap( 'lists' );

config.get( 'lists' ).forEach( ( list ) => {

    add2Sitemap( 'list/' + list );

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
 * add element pages to sitemap
 */

console.log( 'add element pages to sitemap' );

Object.values( ( new DB( 'elements' ) ).database ).forEach( ( el ) => {

    add2Sitemap( 'element/' + el.symbol );

} );

/**
 * create sitemap
 */

console.log( sitemap.length + ' entries were added to the sitemap' );
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