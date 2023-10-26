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
 * format text
 * @param {String} str text
 * @returns formatted text
 */
const text = ( str ) => {

    return ( str || '' ).toString()
        .replaceAll( /'''(.+?)'''/g, '<b>$1</b>' )
        .replaceAll( /''(.+?)''/g, '<i>$1</i>' )
        .replaceAll( /\[(.+?)\]/g, '<sup>$1</sup>' )
        .replaceAll( /\{(.+?)\}/g, '<sub>$1</sub>' );

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
                ? ( new Intl.NumberFormat( _locale, {
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
                ? text( n.unit )
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

        }

    } catch ( err ) {

        return 'ERR (' + err + ')';

    }

};

/**
 * export public methods
 */
module.exports = {
    setLocale,
    text, number
};