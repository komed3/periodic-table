module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/element/:element/?', 'element' ],
    [ '/:locale/ionization/?', 'ionization' ],
    [ '/:locale/spectrum/?', 'spectrum' ],
    [ '/:locale/404/?', '404' ]
];