/**
 * periodic table
 * 404 page
 */

/**
 * load required modules/files
 */
const html = require( './../lib/html.min' );

/**
 * output page
 * @param {Object} req http request
 * @param {Object} route route
 * @returns {String} page
 */
module.exports.out = ( req, route ) => {

    return html.getHeader( '404: Periodic Table' );

};