/**
 * periodic table
 * routing
 */

module.exports.routes = [
    [ '/', 'start' ],
    [ '/sitemap/?', 'sitemap' ],
    [ '/glossary/?', 'glossary' ],
    [ '/tools/?', 'tools' ],
    [ '/spectral/?', 'spectral' ],
    [ '/element/*', 'element', 'e' ],
    [ '/e/*', 'element' ],
    [ '/lists/*', 'lists' ],
    [ '/list/*', 'list' ],
    [ '/props/?', 'props' ],
    [ '/prop/*', 'prop' ],
    [ '/scale/*', 'scale' ],
    [ '/search/?*', 'search' ],
    [ '*', '404' ]
];