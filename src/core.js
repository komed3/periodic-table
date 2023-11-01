'use strict';

var i18n, locale;

/**
 * set locale
 * @param {Module} m i18n module
 * @param {String} l language code
 */
const setLocale = ( m, l ) => {

    locale = l;
    i18n = m;

    i18n.setLocale( locale );

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
    ) + '/' )
        .replace( /\/+/g, '/' )
        .replace( /\/+$/, '' );

};

/**
 * get canonical url with locale
 * @param {String} url path to page
 * @returns localized url
 */
const url = ( url ) => {

    return getCanonical( locale + '/' + url, false );

};

/**
 * get element position in periodic table
 * @param {Object} el element
 * @param {Int} offset La, Ac offset from table
 * @returns position
 */
const getPos = ( el, offset = 3 ) => {

    let group = el.group > 18
        ? el.column + 1
        : el.group;

    let period = el.group > 18
        ? el.period + offset
        : el.period;

    return {
        position: '--g:' + group + ';--p:' + period + ';--r:' +
            el.period + ';--c:' + el.column,
        group: group,
        period: period
    };

};

/**
 * export public methods
 */
module.exports = {
    setLocale, parseURL,
    getCanonical, url,
    getPos
};