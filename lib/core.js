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
 * format text
 * @param {String} text text
 * @returns {String} formatted text
 */
module.exports.fText = ( text ) => {

    return text
        .replaceAll( /\[(.+?)\]/g, '<sup>$1</sup>' )
        .replaceAll( /\{(.+?)\}/g, '<sub>$1</sub>' );

};

module.exports.fOrdinal = ( number, locale ) => {

    switch( locale ) {

        case 'en':
            return number + '<sup>' + (
                number % 100 >= 11 &&
                number % 100 <= 13
                    ? 'th' : [
                        'th', 'st', 'nd', 'rd', 'th',
                        'th', 'th', 'th', 'th', 'th'
                    ][ number % 10 ]
            ) + '</sup>';

        case 'de':
            return number + '.';

    }

};

/**
 * format number property
 * @param {Object|Number} prop property (value, unit, ...) or plain number
 * @param {String} locale language code
 * @param {Int} digits maximum significant digits
 * @returns {String} formatted number
 */
module.exports.fNumber = ( prop, locale = 'en', digits = 20 ) => {

    if( !isNaN( prop ) ) {

        /**
         * plain number
         */

        return this.fNumber( { value: prop }, locale, digits );

    } else if( 'values' in prop ) {

        /**
         * format multiple values
         */

        return prop.values.map( ( v, i ) => {

            let _prop = prop;

            delete _prop.values;

            _prop.value = v;

            return '(' + this.fOrdinal( i + 1, locale ) + ')&nbsp;' +
                this.fNumber( _prop, locale, digits );

        } ).filter( n => n ).join( '<br />' );

    } else if( 'value' in prop ) {

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
                } ).join( ', ' ) + ']'
                : '' ),

            // unit
            this.fText( prop.unit || '' ),

            // @ (second value)
            ( prop['@']
                ? '@ ' + this.fNumber( prop['@'], locale, digits )
                : '' ),

            // condition(s)
            ( prop.condition
                ? '(' + prop.condition.map( c => {
                    return this.fNumber( c, locale, digits )
                } ).join( ', ' ) + ')'
                : '' )

        ].filter( n => n ).join( ' ' );

    } else {

        /**
         * format not supported
         */

        return 'ERR';

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