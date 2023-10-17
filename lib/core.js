/**
 * periodic table
 * lib/core functions
 */

/**
 * load config
 */

const yaml = require( 'js-yaml' );
const config = require( 'config' );

/**
 * load required modules/files
 */

const fs = require( 'fs' );
const { I18n } = require( 'i18n' );
var units = {};

/**
 * init localization
 */

const i18n = new I18n( {
    locales: config.get( 'i18n.languages' ),
    defaultLocale: config.get( 'i18n.default' ),
    directory: __dirname + '/../i18n'
} );

/**
 * set i18n localization
 * @param {String} locale language code
 */
module.exports.setLocale = ( locale ) => {

    i18n.setLocale( locale );

    if( fs.existsSync( path = './i18n/' + locale + '_units.json' ) ) {

        units = JSON.parse(
            fs.readFileSync( path, 'utf8' )
        );

    }

};

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
        .replaceAll( /\<(.+):(.+)\>/g, '<a href="/$1/$2">$2</a>' )
        .replaceAll( /'''(.+?)'''/g, '<b>$1</b>' )
        .replaceAll( /''(.+?)''/g, '<i>$1</i>' )
        .replaceAll( /\[(.+?)\]/g, '<sup>$1</sup>' )
        .replaceAll( /\{(.+?)\}/g, '<sub>$1</sub>' );

};

module.exports.fUnit = ( unit ) => {

    if( ( u = unit.replace( /[^a-zA-Z]+/g, '' ) ) in units ) {

        return '<abbr title="' + units[ u ] + '">' + this.fText( unit ) + '</abbr>';

    }

    return this.fText( unit );

};

module.exports.fOrdinal = ( number ) => {

    switch( i18n.getLocale() ) {

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
 * @param {Int} digits maximum significant digits
 * @returns {String} formatted number
 */
module.exports.fNumber = ( prop, digits = 12 ) => {

    if( !isNaN( prop ) ) {

        /**
         * plain number
         */

        return this.fNumber( { value: prop }, digits );

    } else if( Array.isArray( prop ) ) {

        /**
         * return multiple formatted values
         */

        return prop.map( ( p ) => {
            return this.fNumber( p, digits );
        } ).join( '<br />' );

    } else if( 'value' in prop ) {

        /**
         * format single value
         */

        let exp = Math.floor( Math.log10( Math.abs( prop.value || 1 ) ) );

        if( exp > -4 && exp < 6 ) {

            exp = 0;

        }

        let res = [

            // label
            ( prop.label
                ? prop.label.substring( 0, 1 ) == '_'
                    ? prop.label.substring( 1 )
                    : i18n.__( prop.label ) + ': '
                : '' ),

            // formatted number
            ( new Intl.NumberFormat( i18n.getLocale(), {
                maximumSignificantDigits: digits,
                roundingMode: 'floor'
            } ) ).format( prop.value / Math.pow( 10, exp ) ) +
            
            // scientific notation
            ( exp ? this.fText( '·10[' + exp + ']' ) : '' ),

            // deviation
            ( prop.deviation
                ? '±' + this.fNumber( { value: prop.deviation }, digits )
                : '' ),

            // range
            ( prop.range
                ? '[' + prop.range.map( n => {
                    return this.fNumber( { value: n }, digits );
                } ).join( ' … ' ) + ']'
                : '' ),

            // unit
            ( prop.unit
                ? this.fUnit( prop.unit )
                : '' ),

            // @ (second value)
            ( prop['@']
                ? '@ ' + this.fNumber( prop['@'], digits )
                : '' ),

            // condition(s)
            ( prop.condition
                ? '(' + prop.condition.map( c => {
                    return this.fNumber( c, digits )
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
         * additional information
         */

        if( 'info' in prop ) {

            res += ' (' + this.fText( prop.info ) + ')';

        }

        /**
         * return formatted number
         */

        return res;

    } else if( 'values' in prop ) {

        /**
         * format multiple values
         */

        return prop.values.map( ( v, i ) => {

            return '(' + this.fOrdinal( i + 1 ) + ')&nbsp;' +
                this.fNumber( {
                    ...prop,
                    value: v
                }, digits );

        } ).filter( n => n ).join( '<br />' );

    } else {

        /**
         * format not supported
         */

        return 'ERR';

    }

};

/**
 * format value to human readable units
 * @param {Object} units units and its SI unit factors
 * @param {Float|Int} value value in SI unit
 * @param {Boolean} float use floating
 * @returns formatted unit parts
 */
module.exports.fUnitParts = ( units, value, float = true ) => {

    let parts = [];

    for( const [ unit, factor ] of Object.entries( units ) ) {

        if( value >= factor || unit == Object.keys( units ).reverse()[0] ) {

            parts.push( this.fNumber( {
                value: float ? ( value / factor ) : Math.floor( value / factor ),
                unit: unit
            }, float ? 3 : 0 ) );

            value %= factor;

        }

    }

    return parts;

};

/**
 * format weight to human readable
 * @param {Float|Int} weight weight in kg
 * @param {Boolean} float use floating
 * @returns {Array} formatted weight in [t, kg, ...]
 */
module.exports.fWeight = ( weight, float = true ) => {

    return this.fUnitParts( {
        'M☉': 1.989e30,
        Mt: 1e12, Gt: 1e9, kt: 1e6,
        t: 1e3, kg: 1, g: 1e-3, mg: 1e-6,
        μg: 1e-9
    }, weight, float );

};

/**
 * format datetime to human readable date string
 * @param {String} datetime datetime string
 * @param {String} format date style
 * @returns {String} formatted date string
 */
module.exports.fDate = ( datetime, format = 'full' ) => {

    return (
        new Date( datetime )
    ).toLocaleDateString( i18n.getLocale(), {
        dateStyle: format
    } );

};

/**
 * format datetime to human readable time string
 * @param {String} datetime datetime string
 * @param {String} format time style
 * @returns {String} formatted time string
 */
module.exports.fDateTime = ( datetime, format = 'short' ) => {

    return (
        new Date( datetime )
    ).toLocaleTimeString( i18n.getLocale(), {
        timeStyle: format
    } );

};

/**
 * format time to human readable
 * @param {Int} time time in seconds
 * @param {Boolean} float use floating
 * @returns {Array} formatted time in [years, days, ...]
 */
module.exports.fTime = ( time, float = true ) => {

    return this.fUnitParts( {
        a: 31557600, d: 86400, h: 3600, m: 60, s: 1,
        ms: 1e-3, μs: 1e-6, ns: 1e-9, ps: 1e-12,
        fs: 1e-15, as: 1e-18, zs: 1e-21, ys: 1e-24,
        rs: 1e-27, qs: 1e-30
    }, time, float );

};

/**
 * get isotope url
 * @param {String} isotope isotope name
 * @returns {String} url
 */
module.exports.isoLink = ( isotope ) => {

    return '/isotope/' + isotope.toString().replace( /^\[(.+)\](.+)$/g, '$2-$1' );

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