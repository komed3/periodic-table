module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/element/:element', 'element' ],
    [ '/:locale/404', '404' ]
];