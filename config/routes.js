/**
 * periodic table
 * routing
 */

module.exports.routes = [
    [ '/', 'start' ],
    [ '/element/*', 'element' ],
    [ '/e/*', 'element' ],
    [ '*', '404', 404 ]
];