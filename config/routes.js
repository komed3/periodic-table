module.exports = [
    [ '/:locale/?', 'start' ],
    [ '/:locale/element/*', 'element' ],
    [ '*', '404' ]
];