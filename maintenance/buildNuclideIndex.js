/**
 * periodic table
 * maintenance script: buildNuclideIndex
 * 
 * build nuclide index from database
 */

'use strict';

/**
 * load basics
 */

const fs = require( 'fs' );
const path = require( 'path' );

require( 'log-timestamp' );

const NUCLIDES_DB = path.join( __dirname, '../_db/nuclides.json' );
const OUT_DB = path.join( __dirname, '../_db/nuclides_index.json' );

/**
 * extract main decay type from decay array
 */
function getMainDecay ( decayArr ) {

    if ( ! Array.isArray( decayArr ) || decayArr.length === 0 ) return null;

    let main = decayArr[0];

    for ( const d of decayArr ) if ( d.percent && d.percent > main.percent ) main = d;

    return main.mode || null;

}

function getHalfLife ( hl ) {

    if ( ! hl || !( 'value' in hl ) || isNaN( hl.value ) ) return null;

    for ( const [ k, v ] of Object.entries( {
        '10e-10': 'less10ps', '60': 'less1min', '3600': '1minTo1h',
        '86400': '1hTo1d', '5184000': '1dTo60d', '315576000': '60dTo10y',
        '31557600000': '10yTo1ky', '3155760000000': '1kyTo100ky',
        '315576000000000': '100kyTo10My', '1577880000000000': '10MyTo50My'
    } ) ) {

        if ( hl.value < parseFloat( k ) ) return v;

    }

    return 'more50My';

}

/**
 * extract nuclide info from entry
 */
function extractNuclideInfo ( nuclide, symbol ) {

    const stable = !! nuclide.stable;

    return {
        z: nuclide.z,
        n: nuclide.n,
        m: nuclide.z + nuclide.n,
        symbol: symbol === '*' ? 'n' : symbol[0].toUpperCase() + symbol.slice( 1 ),
        layer: {
            decay: stable ? 'stable' : getMainDecay( nuclide.decay ) ?? 'unknown',
            half_life: stable ? 'stable' : getHalfLife( nuclide.half_life_sec ) ?? 'unknown'
        }
    };

}

/**
 * main function
 */
function buildNuclideIndex () {

    const data = JSON.parse( fs.readFileSync( NUCLIDES_DB, 'utf8' ) );
    const nuclides = {};

    for ( const [ symbol, entry ] of Object.entries( data ) ) {

        if ( ! Array.isArray( entry.nuclides ) ) continue;

        for ( const nucl of entry.nuclides ) {

            if ( typeof nucl.z !== 'number' || typeof nucl.n !== 'number' ) continue;

            const key = `${nucl.z},${nucl.n}`;
            nuclides[ key ] = extractNuclideInfo( nucl, symbol );

        }

    }

    fs.writeFileSync( OUT_DB, JSON.stringify( nuclides, null, 2 ) );
    console.log( `Nuclide index written to ${OUT_DB} (${ Object.keys( nuclides ).length } entries)` );

}

buildNuclideIndex();
