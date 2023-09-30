/**
 * periodic table
 * html header
 */

/**
 * output page
 * @param {String} title html title
 * @param {String} title loaded stylesheets
 * @param {String} title loaded scripts
 * @returns {String} html header
 */
module.exports.out = ( title, styles, scripts, lang = 'en' ) => {

    return `<!DOCTYPE html>
        <html lang="` + lang + `">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>` + title + `</title>
            ` + styles + scripts + `
        </head>
        <body>`;

};