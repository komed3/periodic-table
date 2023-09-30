/**
 * periodic table
 * lib/core functions
 */

/**
 * load required modules/files
 */
const fs = require( 'fs' );

/**
 * console log msg
 * @param {String} msg message
 */
module.exports.log = ( msg ) => {

    console.log( '[' + ( new Date() ).toISOString() + '] ' + msg );

}

/**
 * load (json) database file
 * @param {String} name database
 */
module.exports.DB = ( name ) => {

    let path = './_db/' + name + '.min.json';

    if( fs.existsSync( path ) ) {

        return JSON.parse(
            fs.readFileSync( path, 'utf8' )
        );

    } else {

        return {};

    }

}