/**
 * periodic-table
 * Node.js app entry point
 * 
 * @author      komed3 (Paul Köhler)
 * @version     1.0.0
 */

/**
 * load "dotenv" module
 */
const dotenv = require( 'dotenv' ).config();

/**
 * load "express" web framework
 */
const express = require( 'express' );
const app = express();

/**
 * start web server
 */
const server = app.listen( process.env.SERVER_PORT, () => {} );