/**
 * periodic table
 * lib/core functions
 */

/**
 * load required modules/files
 */
const fs = require( 'fs' );

/**
 * load (json) database file
 * @param {String} name database
 */
module.exports.DB = ( name ) => {

    let path = './_db/' + name + '.json';

    if( fs.existsSync( path ) ) {

        return JSON.parse(
            fs.readFileSync( path, 'utf8' )
        );

    } else {

        return {};

    }

}

/**
 * parse URL parts into array
 * @param {String} url request url
 * @returns {Array} url parts
 */
module.exports.parseURL = ( url ) => {

    return url.split( '/' ).filter( p => p.length );

};

/**
 * parse text
 * @param {String} text text
 * @returns {String} parsed output
 */
module.exports.parseText = ( text ) => {

    return text
        .replaceAll( /\[(.+)\]/g, '<sup>$1</sup>' )
        .replaceAll( /\{(.+)\}/g, '<sub>$1</sub>' );

};

/**
 * get classification url
 * @param {String} classif classification type
 * @param {String} value code / number
 * @returns {String} url
 */
module.exports.classifLink = ( classif, value ) => {

    return {
        cas: 'https://commonchemistry.cas.org/detail?ref=$1',
        echa: 'https://echa.europa.eu/de/substance-information/-/substanceinfo/$1',
        atc: 'https://www.whocc.no/atc_ddd_index/?code=$1'
    }[ classif ]
        .replaceAll( '$1', value );

};