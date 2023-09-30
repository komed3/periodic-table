/**
 * periodic table
 * html functions + content
 */

/**
 * load stylesheets
 * @returns stylesheets
 */
var getStyles = () => {

    let styles = module.exports.styles;

    module.exports.styles = [];

    return styles.map( ( style ) => {
        return '<link rel="stylesheet" href="css/' + style + '.css" />'
    } ).join( '' );

}

/**
 * load scripts
 * @returns scripts
 */
var getScripts = () => {

    let scripts = module.exports.scripts;

    module.exports.scripts = [];

    return scripts.map( ( script ) => {
        return '<script src="js/' + script + '.js"></script>'
    } ).join( '' );

}

/**
 * stylesheets + scripts
 */
module.exports.styles = [ 'style' ];
module.exports.scripts = [];

/**
 * get global html page header
 * @param {String} title page title
 * @returns {String} html header
 */
module.exports.getHeader = ( title ) => {

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>` + title + `</title>
            ` + getStyles() + `
            ` + getScripts() + `
        </head>
        <body>`;

};