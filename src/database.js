'use strict'

/**
 * load required modules
 */

const fs = require( 'fs' );

/**
 * class DB
 * basic functionality for databases
 */
module.exports = class DB {

    static database;

    /**
     * constructor: load database
     * @param {String} name path to database file
     */
    constructor( name ) {

        let path = __dirname + '/../_db/' + name + '.json';

        if( fs.existsSync( path ) ) {

            this.database = JSON.parse(
                fs.readFileSync( path, 'utf8' )
            );

        }

    };

    /**
     * get data from database
     * @param {String} key searchable key
     * @returns mixed data from database or undefined
     */
    #fromPath = ( path ) => {

        return path.toString().split( '.' ).reduce(
            ( p, c ) => p && p[ c ] || undefined,
            this.database
        );

    };

    /**
     * check if database contains path
     * @param {String} path searchable path
     * @returns boolean if path is in database
     */
    has = ( path ) => {

        return typeof this.#fromPath( path ) != 'undefined';

    };

    /**
     * get data from database
     * @param {String} path searchable path
     * @returns mixed data from database or undefined
     */
    get = ( path ) => {

        return this.#fromPath( path );

    };

};