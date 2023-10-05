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
 * format/parse text
 * @param {String} text text
 * @returns {String} parsed output
 */
module.exports.parseText = ( text ) => {

    return text
        .replaceAll( /\[(.+)\]/g, '<sup>$1</sup>' )
        .replaceAll( /\{(.+)\}/g, '<sub>$1</sub>' );

};

/**
 * format number property
 * @param {Object} prop property (value, unit, ...)
 * @param {String} locale language code
 * @param {Int} digits maximum significant digits
 * @returns {String} formatted number
 */
module.exports.fNumber = ( prop, locale = 'en', digits = 20 ) => {

    if( 'values' in prop ) {

        /**
         * format multiple values
         */

        return prop.values.map( v => {
            return this.fNumber( {
                value: v,
                deviation: prop.deviation || null,
                range: prop.range || null,
                unit: prop.unit
            }, locale, digits );
        } ).filter( n => n ).join( '<br />' );

    } else {

        /**
         * format single value
         */

        return [
            // formatted number
            ( new Intl.NumberFormat( locale, {
                maximumSignificantDigits: digits
            } ) ).format( prop.value ),
            // deviation
            ( prop.deviation
                ? '±' + this.fNumber( { value: prop.deviation }, locale, digits )
                : '' ),
            // range
            ( prop.range
                ? '[' + prop.range.map( n => {
                    return this.fNumber( { value: n }, locale, digits );
                } ).join( ',&nbsp;' ) + ']'
                : '' ),
            // unit
            ( prop.unit || '' )
        ].filter( n => n ).join( '&nbsp;' );

    }

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