module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/404/?', '404' ],
    [ '/:locale/element/:element/?', 'element' ],
    [ '/:locale/ionization/?', 'ionization' ],
    [ '/:locale/list/:list/?', 'list' ],
    [ '/:locale/list/:list/:prop/?', 'list' ],
    [ '/:locale/lists/?', 'lists' ],
    [ '/:locale/prop/:property/?', 'prop' ],
    [ '/:locale/props/?', 'props' ],
    [ '/:locale/scales/?', 'scales' ],
    [ '/:locale/sitemap/?', 'sitemap' ],
    [ '/:locale/spectrum/?', 'spectrum' ]
];