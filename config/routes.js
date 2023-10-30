module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/404/?', '404' ],
    [ '/:locale/abundances/?', 'abundances' ],
    [ '/:locale/data/?', 'data' ],
    [ '/:locale/element/:element/?', 'element' ],
    [ '/:locale/glossary/?', 'glossary' ],
    [ '/:locale/ionization/?', 'ionization' ],
    [ '/:locale/list/:list/?', 'list' ],
    [ '/:locale/list/:list/:prop/?', 'list' ],
    [ '/:locale/lists/?', 'lists' ],
    [ '/:locale/privacy/?', 'privacy' ],
    [ '/:locale/prop/:property/?', 'prop' ],
    [ '/:locale/props/?', 'props' ],
    [ '/:locale/search/?', 'search' ],
    [ '/:locale/scales/?', 'scales' ],
    [ '/:locale/sitemap/?', 'sitemap' ],
    [ '/:locale/spectrum/?', 'spectrum' ]
];