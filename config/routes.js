module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/spectrum/?', 'spectrum' ],
    [ '/:locale/element/:element/?', 'element' ],
    [ '/:locale/404/?', '404' ]
];