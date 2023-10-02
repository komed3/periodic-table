/**
 * periodic table
 * routing
 */

module.exports.routes = [
    [ '/', 'start' ],
    [ '/glossary', 'glossary' ],
    [ '/element/*', 'element' ],
    [ '/e/*', 'element' ],
    [ '*', '404', 404 ]
];