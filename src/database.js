'use strict';

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

    /**
     * get array of database keys
     * @returns array of database keys
     */
    keys = () => {

        return Object.keys( this.database );

    };

    /**
     * get previous key from database
     * @param {String} key key
     * @param {Int} i previous i key
     * @returns previous key
     */
    prevKey = ( key, i = 1 ) => {

        return this.nextKey( key, i * (-1) );

    };

    /**
     * get previous item from database
     * @param {String} key key
     * @param {Int} i previous i key
     * @returns previous item
     */
    prev = ( key, i = 1 ) => {

        return this.next( key, i * (-1) );

    };

    /**
     * get next key from database
     * @param {String} key key
     * @param {Int} i next i key
     * @returns next key
     */
    nextKey = ( key, i = 1 ) => {

        let list = this.keys(),
            index = list.indexOf( key );

        return list[ index + i ] || null;

    };

    /**
     * get next item from database
     * @param {String} key key
     * @param {Int} i next i key
     * @returns next item
     */
    next = ( key, i = 1 ) => {

        let next = this.nextKey( key, i );

        return next != null
            ? this.get( next )
            : null;

    };

    /**
     * get property value
     * @param {String} key item key
     * @param {String} path searchable path
     * @param {String} type property type
     * @param {Mixed} value mixed test value
     * @returns return property
     */
    prop = ( key, path, type = 'value', value = null ) => {

        let p = key + '.' + path;

        switch( type ) {

            case 'prop':
                return +!!( this.get( key + '.properties' ) || [] ).includes( value || '' );

            default:
            case 'value':
                return this.get( p ) || 'undefined';

        }

    };

    /**
     * search in database and returns key list
     * @param {String} query search query
     * @param {String} path searchable path
     * @returns results
     */
    search = ( query, path = '' ) => {

        let results = [];

        for( const [ key, val ] of Object.entries( this.database ) ) {

            if( (
                path.length &&
                this.#fromPath( key + '.' + path ).toString().includes( query )
            ) || (
                val.toString().includes( query )
            ) ) {

                results.push( key );

            }

        }

        return results;

    };

};