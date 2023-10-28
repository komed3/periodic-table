module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/404/?', '404' ],
    [ '/:locale/element/:element/?', 'element' ],
    [ '/:locale/ionization/?', 'ionization' ],
    [ '/:locale/lists/?', 'lists' ],
    [ '/:locale/prop/:property/?', 'prop' ],
    [ '/:locale/props/?', 'props' ],
    [ '/:locale/spectrum/?', 'spectrum' ]
];