module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/404/?', '404' ],
    [ '/:locale/element/:element/?', 'element' ],
    [ '/:locale/ionization/?', 'ionization' ],
    [ '/:locale/prop/:property/?', 'prop' ],
    [ '/:locale/spectrum/?', 'spectrum' ]
];