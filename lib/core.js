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

    if( fs.existsSync( path = './_db/' + name + '.min.json' ) ) {

        return JSON.parse(
            fs.readFileSync( path, 'utf8' )
        );

    } else if( fs.existsSync( path = './_db/' + name + '.json' ) ) {

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

module.exports.fromPath = ( obj, path ) => {

    return path
        .replace( /\[([^\[\]]*)\]/g, '.$1.' )
        .split( '.' )
        .filter( t => t !== '' )
        .reduce( ( prev, cur ) => prev && prev[ cur ], obj );

};

/**
 * get property value from element object
 * @param {String} key element key
 * @param {Object} el element object
 * @param {String} path property key path
 * @param {Mixed} value test value
 * @param {String} type prop/layer type
 * @returns {String|Int} property or value
 */
module.exports.getValue = ( key, el, path, value, type = 'value' ) => {

    switch( type ) {

        case 'prop':
            return +!!( el.properties || [] ).includes( value );

        case 'scale':
            return 'scale' in el
                ? el.scale.y
                : typeof value == 'object' && key in value
                  ? value[ key ].scale.y
                  : 'undefined';

        default:
            return this.fromPath( el, path ) || 'undefined';

    }

};

/**
 * format text
 * @param {String} text text
 * @returns {String} formatted text
 */
module.exports.fText = ( text ) => {

    return text
        .replaceAll( /\<(.+?):?(.+?)\>/g, '<a href="/$1/$2">$2</a>' )
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
module.exports.fNumber = ( prop, locale = 'en', digits = 12 ) => {

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

        let exp = Math.floor( Math.log10( Math.abs( prop.value || 1 ) ) );

        if( exp > -4 && exp < 6 ) {

            exp = 0;

        }

        let res = [

            // formatted number
            ( new Intl.NumberFormat( locale, {
                maximumSignificantDigits: digits,
                roundingMode: 'floor'
            } ) ).format( prop.value / Math.pow( 10, exp ) ) +
            
            // scientific notation
            ( exp ? this.fText( '·10[' + exp + ']' ) : '' ),

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

        /**
         * theoretical value (predicted, estimated etc.)
         */

        if( '*' in prop && prop['*'] ) {

            res = '(' + res + ')';

        }

        /**
         * return formatted number
         */

        return res;

    } else {

        /**
         * format not supported
         */

        return 'ERR';

    }

};

/**
 * format datetime to human readable date string
 * @param {String} datetime datetime string
 * @param {String} locale language code
 * @param {String} format date style
 * @returns {String} formatted date string
 */
module.exports.fDate = ( datetime, locale, format = 'full' ) => {

    return (
        new Date( datetime )
    ).toLocaleDateString( locale, {
        dateStyle: format
    } );

};

/**
 * format datetime to human readable time string
 * @param {String} datetime datetime string
 * @param {String} locale language code
 * @param {String} format time style
 * @returns {String} formatted time string
 */
module.exports.fDateTime = ( datetime, locale, format = 'short' ) => {

    return (
        new Date( datetime )
    ).toLocaleTimeString( locale, {
        timeStyle: format
    } );

};

/**
 * format time to human readable
 * @param {Int} time time in seconds
 * @param {String} locale language code
 * @param {Boolean} float use floating
 * @returns {Array} formatted time in [years, days, ...]
 */
module.exports.fTime = ( time, locale, float = true ) => {

    let parts = [];

    for( const [ unit, factor ] of Object.entries( {
        a: 31557600, d: 86400, h: 3600, m: 60, s: 1,
        ms: 1e-3, μs: 1e-6, ns: 1e-9, ps: 1e-12,
        fs: 1e-15, as: 1e-18, zs: 1e-21, ys: 1e-24,
        rs: 1e-27, qs: 1e-30
    } ) ) {

        if( time >= factor || unit == 'qs' ) {

            parts.push( this.fNumber( {
                value: float ? ( time / factor ) : Math.floor( time / factor ),
                unit: unit
            }, locale, float ? 3 : 0 ) );

            time %= factor;

        }

    }

    return parts;

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