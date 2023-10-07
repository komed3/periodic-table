/**
 * periodic table
 * maintenance script: getImages
 * 
 * get images from wikimedia
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

const im = require( 'imagemagick' );
const fs = require( 'fs' );
const core = require( './../lib/core' );

/**
 * proceed maintenance script
 */

//