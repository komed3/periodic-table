'use strict';

var i18n, locale, catalog;

/**
 * set locale
 * @param {Module} m i18n module
 * @param {String} l language code
 */
const setLocale = ( m, l ) => {

    locale = l;
    i18n = m;

    i18n.setLocale( locale );

    catalog = Object.keys( i18n.getCatalog() );

};

/**
 * format value to human readable units
 * @param {Object} units units and its SI unit factors
 * @param {Float|Int} value value in SI unit
 * @param {Boolean} float use floating
 * @returns formatted unit parts
 */
const unitParts = ( units, value, float = true ) => {

   let parts = [];

   for( const [ unit, factor ] of Object.entries( units ) ) {

       if( value >= factor || unit == Object.keys( units ).reverse()[0] ) {

           parts.push( number( {
               value: float ? ( value / factor ) : Math.floor( value / factor ),
               unit: unit
           }, float ? 3 : 0 ) );

           value %= factor;

       }

   }

   return parts;

};

/**
 * format text
 * @param {String} str text
 * @returns formatted text
 */
const text = ( str ) => {

    return ( str || '' ).toString()
        .replace( /'''(.+?)'''/g, '<b>$1</b>' )
        .replace( /''(.+?)''/g, '<i>$1</i>' )
        .replace( /\[(.+?)\]/g, '<sup>$1</sup>' )
        .replace( /\{(.+?)\}/g, '<sub>$1</sub>' );

};

/**
 * get ordinal number
 * @param {Int} n number
 * @returns ordinal
 */
const ordinal = ( n ) => {

    n = parseInt( n );

    switch( locale ) {

        default:
        case 'de':
            return n + '.';

        case 'en':
            return n + '<sup>' + (
                n % 100 >= 11 && n % 100 <= 13 ? 'th' : [
                    'th', 'st', 'nd', 'rd', 'th',
                    'th', 'th', 'th', 'th', 'th'
                ][ n % 10 ]
            ) + '</sup>';

        case 'fr':
            return n + '<sup>' + (
                n == 1 ? 'er' : 'ème'
            ) + '</sup>';

    }

};

/**
 * format unit (+ explanation)
 * @param {String} u unit
 * @returns formatted unit (+ explanation)
 */
const unit = ( u ) => {

    let key = 'unit-' + u.replace( /[^a-zA-Z0-9]/g, '_' );

    if( catalog.includes( key ) ) {

        return '<abbr title="' + i18n.__( key ) + '">' + text( u ) + '</abbr>';

    }

    return text( u );

};

/**
 * format number object
 * @param {Mixed} n number object or value
 * @param {Int} digits maximum significant digits
 * @param {Boolean} numOnly return only number and unit
 * @returns formatted number
 */
const number = ( n, digits = 4, numOnly = false ) => {

    try {

        if( !isNaN( n ) ) {

            /**
             * plain number
             */

            return number( { value: n }, digits );

        } else if( Array.isArray( n ) ) {

            /**
             * return multiple formatted values
             */

            return n.map( ( p ) => {
                return number( p, digits );
            } ).join( '<br />' );

        } else if( 'value' in n ) {

            /**
             * scientific notation
             */

            let exp = Math.floor( Math.log10( Math.abs( n.value || 1 ) ) );

            if( exp > -4 && exp < 6 ) {

                exp = 0;

            }

            /**
             * format single value
             */

            let parts = [

                // label
                ( n.label
                    ? n.label.substring( 0, 1 ) == '_'
                        ? n.label.substring( 1 )
                        : i18n.__( n.label ) + ': '
                    : '' ),

                // formatted number
                ( !isNaN( n.value ) && n.value != null
                    ? ( new Intl.NumberFormat( locale, {
                        maximumSignificantDigits: digits,
                        roundingMode: 'floor'
                    } ) ).format(
                        n.value / Math.pow( 10, exp )
                    ) + ( exp
                        ? text( '·10[' + exp + ']' )
                        : '' )
                    : '' ),

                // deviation
                ( n.deviation
                    ? '±' + number( { value: n.deviation }, digits )
                    : '' ),

                // range
                ( n.range
                    ? '[' + n.range.map( rn => {
                        return number( { value: rn }, digits );
                    } ).join( ' … ' ) + ']'
                    : '' ),

                // unit
                ( n.unit
                    ? unit( n.unit )
                    : '' ),

                // @ (second value)
                ( '@' in n
                    ? '@ ' + number( n['@'], digits )
                    : '' ),

                // condition(s)
                ( n.condition
                    ? '(' + n.condition.map( c => {
                        return number( c, digits )
                    } ).join( ', ' ) + ')'
                    : '' )

            ];

            let res = numOnly
                ? parts[1] + ' ' + parts[4]
                : parts.filter( Boolean ).join( ' ' );

            /**
             * theoretical value (predicted, estimated etc.)
             */

            if( '*' in n && n['*'] ) {

                res = '(' + res + ')';

            }

            /**
             * additional information
             */

            if( 'info' in n ) {

                res += ' (' + text( n.info ) + ')';

            }

            /**
             * return formatted number
             */

            return res;

        } else if( 'values' in n ) {

            /**
             * format multiple values
             */

            return n.values.map( ( v, i ) => {

                return '(' + ordinal( i + 1 ) + ')&nbsp;' +
                    number( {
                        ...n,
                        value: v
                    }, digits );

            } ).filter( p => p ).join( '<br />' );

        }

        return i18n.__( 'undefined' );

    } catch ( err ) {

        return i18n.__( 'error', err );

    }

};

/**
 * format weight to human readable
 * @param {Float|Int} weight weight in kg
 * @param {Boolean} float use floating
 * @returns formatted weight in [t, kg, ...]
 */
const weight = ( weight, float = true ) => {

    return unitParts( {
        'M☉': 1.989e30,
        Mt: 1e12, Gt: 1e9, kt: 1e6,
        t: 1e3, kg: 1, g: 1e-3, mg: 1e-6,
        μg: 1e-9
    }, weight, float );

};

/**
 * format file size to human readable
 * @param {Int} size file size in bytes
 * @param {Boolean} float use floating
 * @returns formatted file size in [MB, kB, ...]
 */
const fileSize = ( size, float = true ) => {

    return unitParts( {
        MB: 1048576, kB: 1024
    }, size, float );

};

/**
 * format time to human readable
 * @param {Int} time time in seconds
 * @param {Boolean} float use floating
 * @returns formatted time in [years, days, ...]
 */
const time = ( time, float = true ) => {

    return unitParts( {
        a: 31557600, d: 86400, h: 3600, m: 60, s: 1,
        ms: 1e-3, μs: 1e-6, ns: 1e-9, ps: 1e-12,
        fs: 1e-15, as: 1e-18, zs: 1e-21, ys: 1e-24,
        rs: 1e-27, qs: 1e-30
    }, time, float );

};

/**
 * format datetime to human readable date string
 * @param {String} datetime datetime string
 * @param {String} format date style
 * @returns formatted date string
 */
const date = ( datetime, format = 'full' ) => {

    return (
        new Date( datetime )
    ).toLocaleDateString( locale, {
        dateStyle: format
    } );

};

/**
 * format datetime to human readable time string
 * @param {String} datetime datetime string
 * @param {String} format time style
 * @returns formatted time string
 */
const dateTime = ( datetime, format = 'short' ) => {

    return (
        new Date( datetime )
    ).toLocaleTimeString( locale, {
        timeStyle: format
    } );

};

/**
 * export public methods
 */
module.exports = {
    setLocale,
    text, ordinal,
    unit, number, weight,
    fileSize,
    time, date, dateTime
};