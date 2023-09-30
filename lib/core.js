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

    let path = './_db/' + name + '.min.json';

    if( fs.existsSync( path ) ) {

        return JSON.parse(
            fs.readFileSync( path, 'utf8' )
        );

    } else {

        return {};

    }

}