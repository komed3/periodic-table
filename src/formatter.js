'use strict'

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

        case 'en':
            return n + '<sup>' + (
                n % 100 >= 11 &&
                n % 100 <= 13
                    ? 'th' : [
                        'th', 'st', 'nd', 'rd', 'th',
                        'th', 'th', 'th', 'th', 'th'
                    ][ n % 10 ]
            ) + '</sup>';

        case 'de':
            return n + '.';

    }

};

/**
 * format unit (+ explanation)
 * @param {String} u unit
 * @returns formatted unit (+ explanation)
 */
const unit = ( u ) => {

    let key = 'unit-' + u.replace( /[^a-zA-Z0-9]/g, '' );

    if( catalog.includes( key ) ) {

        return '<abbr title="' + i18n.__( key ) + '">' + text( u ) + '</abbr>';

    }

    return text( u );

};

/**
 * format number object
 * @param {Mixed} n number object or value
 * @param {Int} digits maximum significant digits
 * @returns formatted number
 */
const number = ( n, digits = 12 ) => {

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

            let res = [

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

            ].filter( r => r ).join( ' ' );

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
 * export public methods
 */
module.exports = {
    setLocale,
    text, ordinal,
    unit, number
};