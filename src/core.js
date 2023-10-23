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
 * get canonical url with locale
 * @param {String} url path to page
 * @returns localized url
 */
const url = ( url ) => {

    return ( '/' + _locale + '/' + url )
        .replace( /\/+/g, '/' )
        .replace( /\/+$/, '' );

};

/**
 * export public methods
 */
module.exports = {
    setLocale, parseURL,
    url
};