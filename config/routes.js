/**
 * periodic table
 * routing
 */

module.exports.routes = [
    [ '/', 'start' ],
    [ '/glossary', 'glossary' ],
    [ '/element/*', 'element', 'e' ],
    [ '/e/*', 'element' ],
    [ '/list/*', 'list' ],
    [ '/search/?*', 'search' ],
    [ '*', '404', '404', 404 ]
];