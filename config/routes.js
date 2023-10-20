/**
 * periodic table
 * routing
 */

module.exports.routes = [
    [ '/', 'start' ],
    [ '/sitemap/?', 'sitemap' ],
    [ '/glossary/?', 'glossary' ],
    [ '/spectrum/?', 'spectrum' ],
    [ '/ionization/?', 'ionization' ],
    [ '/quiz/?', 'quiz' ],
    [ '/tools/?', 'tools' ],
    [ '/abundances/?', 'abundances' ],
    [ '/abundance/*', 'abundance' ],
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