'use strict';

const DB = require( './database' );

const nuclides = ( new DB( 'nuclides' ) ).database;
const index = ( new DB( 'nuclides_index' ) ).database;

const extractGrid = ( z, n, range = 7 ) => {

    z = parseInt( z ) || 0, n = parseInt( n ) || 1;
    range = Math.max( 1, Math.min( 10, parseInt( range ) || 7 ) );

    const minZ = Math.max( 0, z - range );
    const maxZ = z + range;
    const minN = Math.max( 0, n - range );
    const maxN = n + range;

    const items = [];

    for ( let zi = minZ; zi <= maxZ; zi++ ) {

        const row = [];

        for ( let ni = minN; ni <= maxN; ni++ ) {

            const key = `${zi},${ni}`;

            row.push( index[ key ] || null );

        }

        items.push( row );

    }

    return { z, n, range, minZ, maxZ, minN, maxN, items };

}

module.exports = { extractGrid };