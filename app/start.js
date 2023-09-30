/**
 * periodic table
 * start page
 */

module.exports.out = ( html, req, res, route ) => {

    let content = '';

    content += html.getHeader(
        res.__( 'Periodic Table' ),
        res.getLocale()
    );

    content += html.getFooter();

    return content;

};