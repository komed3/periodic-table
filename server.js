/**
 * periodic table
 * interactive periodic table with nuclides,
 * tools, lists and more
 * 
 * @author komed3 (Paul Köhler)
 * @version 2.0.0
 * @license MIT
 */

'use strict'

/**
 * load config file
 */

process.env.ALLOW_CONFIG_MUTATIONS = true;

const yaml = require( 'js-yaml' );
const config = require( 'config' );

const express = require( 'express' );

const app = express();

const server = app.listen( config.get( 'server.port' ) );