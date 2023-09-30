/**
 * periodic table
 * Node.js app entry point
 * 
 * @author      komed3 (Paul Köhler)
 * @version     1.0.0
 */

/**
 * load required modules/files
 */
const express = require( 'express' );
const routes = require( './config/routes.min' );

/**
 * load "express" web framework
 */
const app = express();

/**
 * define static folders/files
 */
app.use( '/css', express.static( 'public/styles' ) );
app.use( '/js', express.static( 'public/scripts' ) );
app.use( '/img', express.static( 'public/images' ) );

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