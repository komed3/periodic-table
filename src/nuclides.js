'use strict';

const DB = require( './database' );

const nuclides = ( new DB( 'nuclides' ) ).database;
const index = ( new DB( 'nuclides_index' ) ).database;

const extractGrid = ( z, n, zEl = 10, nEl = 14 ) => {

    z = parseInt( z ) || 0, n = parseInt( n ) || 1;

    const minZ = Math.max( 0, z - ( zEl / 2 ) );
    const maxZ = z + ( zEl - ( z - minZ ) );
    const minN = Math.max( 0, n - ( nEl / 2 ) );
    const maxN = n + ( nEl - ( n - minN ) );

    const items = [];

    for ( let zi = minZ; zi <= maxZ; zi++ ) {

        const row = [];

        for ( let ni = minN; ni <= maxN; ni++ ) {

            const key = `${zi},${ni}`;

            row.push( index[ key ] || null );

        }

        items.push( row );

    }

    return {
        z, n, x: nEl + 1, y: zEl + 1,
        minZ, maxZ, minN, maxN,
        items
    };

}

module.exports = { extractGrid };