/**
 * periodic table
 * routing
 */

module.exports.routes = [
    [ '/', 'start' ],
    [ '/sitemap/?', 'sitemap' ],
    [ '/nuclides/?', 'nuclides' ],
    [ '/spectrum/?', 'spectrum' ],
    [ '/ionization/?', 'ionization' ],
    [ '/glossary/?', 'glossary' ],
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