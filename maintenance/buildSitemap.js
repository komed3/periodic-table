/**
 * periodic table
 * maintenance script: buildSitemap
 * 
 * build sitemap
 * 
 * @author      komed3 (Paul Köhler)
 * @version     2.0.0
 */

/**
 * load config
 */
const yaml = require( 'js-yaml' );
const config = require( 'config' );

/**
 * load required modules
 */
require( 'log-timestamp' );

/**
 * proceed maintenance script
 */
console.log( 'start rebuild sitemap' );

//