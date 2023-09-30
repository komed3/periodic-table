/**
 * periodic table
 * Node.js app entry point
 * 
 * @author      komed3 (Paul Köhler)
 * @version     1.0.0
 */

/**
 * load required modules
 */
const express = require( 'express' );

/**
 * load required files
 */
const core = require( './lib/core.min' );
const routes = require( './config/routes.min' );

/**
 * load "express" web framework
 */
const app = express();

/**
 * server routing
 */
routes.routes.forEach( ( route ) => {

    app.get( route[0], ( req, res ) => {

        try {

            var page = require( './app/' + route[1] + '.min' );

            res.status( route[2] || 200 ).send( page.out( req, route ) );

        } catch( err ) {

            res.status( 500 ).send( 'ERROR: ' + err );

        }

    } );

} );

/**
 * start web server
 */
const server = app.listen( 3000 );