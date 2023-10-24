'use strict'

var _locale;

/**
 * set locale
 * @param {String} locale language code
 */
const setLocale = ( locale ) => {

    _locale = locale;

};

/**
 * parse url
 * @param {String} url url to parse
 * @returns parsed url
 */
const parseURL = ( url ) => {

    let parts = url.split( '/' ).filter( p => p );

    return {
        parts: parts,
        normalized: parts.map( p => p.toLowerCase() ),
        string: '/' + parts.join( '/' )
    };

};

/**
 * gets the canonical url
 * @param {String} url target url
 * @param {Boolean} split remove query args
 * @returns canonical url
 */
const getCanonical = ( url, split = true ) => {

    return ( '/' + (
        split ? url.split( '?' )[0] : url
    ) + '/' ).replace( /\/+/g, '/' );

};

/**
 * get canonical url with locale
 * @param {String} url path to page
 * @returns localized url
 */
const url = ( url ) => {

    return getCanonical( _locale + '/' + url, false );

};

/**
 * export public methods
 */
module.exports = {
    setLocale, parseURL,
    getCanonical, url
};