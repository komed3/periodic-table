/**
 * periodic table
 * 404 page
 */

module.exports.out = ( html, req, res, route ) => {

    return html.getHeader(
        res.__( '404: Periodic Table' ),
        res.getLocale()
    ) + html.getFooter();

};