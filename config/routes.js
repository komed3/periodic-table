/**
 * periodic table
 * routing
 */

module.exports.routes = [
    [ '/', 'start' ],
    [ '/glossary', 'glossary' ],
    [ '/element/*', 'element', 'e' ],
    [ '/e/*', 'element' ],
    [ '/lists/*', 'lists' ],
    [ '/list/*', 'list' ],
    [ '/props/?', 'props' ],
    [ '/prop/*', 'prop' ],
    [ '/search/?*', 'search' ],
    [ '*', '404', '404', 404 ]
];