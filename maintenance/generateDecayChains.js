/**
 * periodic table
 * maintenance script: generateDecayChains
 * 
 * generate decay chains for all isotopes from nuclic database
 */

'use strict';

/**
 * load basics
 */

const fs = require( 'fs' );
const path = require( 'path' );
const DB = require( './../src/database' );

require( 'log-timestamp' );

/**
 * nuclide processor to build decay chains
 */

class NuclideProcessor {

    nuclideMap = new Map();
    decayChains = new Map();

    MAX_DEPTH = 99;

    constructor ( nuclides ) { this.nuclides = nuclides }

    initialize () {

        console.log( 'Initializing nuclide processor ...' );

        for ( const [ key, entry ] of Object.entries( this.nuclides ) ) {

            if ( entry.nuclides ) {

                for ( const nuclide of entry.nuclides ) {

                    const nuclideId = `${entry.symbol}_${nuclide.m}`;

                    this.nuclideMap.set( nuclideId, {
                        ...nuclide, key,
                        symbol: entry.symbol,
                        id: nuclideId
                    } );

                }

            }

        }

        console.log( `Loaded ${ this.nuclideMap.size } nuclides` );

    }

    calculateDecayProducts ( z, n, decayMode ) {

        switch ( decayMode ) {

            case '2B+':
                // double β⁺ decay: 2 protons → 2 neutrons + 2 positrons
                z -= 2; n += 2;
                break;

            case '2B-':
                // double β⁻ decay: 2 neutrons → 2 protons + 2 electrons
                z += 2; n -= 2;
                break;

            case '2EC':
                // double electron capture: 2 protons + 2 electrons → 2 neutrons
                z -= 2; n += 2;
                break;

            case '2N':
                // two-neutron emission
                n -= 2;
                break;

            case '2P':
                // two-proton emission
                z -= 2;
                break;

            case 'A':
                // α decay: lose 2 protons and 2 neutrons
                z -= 2; n -= 2;
                break;

            case 'B+':
                // β⁺ decay: proton → neutron + positron
                z -= 1; n += 1;
                break;

            case 'B+2P':
                // β⁺ decay + two-proton emission
                z -= 3; // -1 from β⁺, -2 from 2P
                n += 1; // +1 from β⁺
                break;

            case 'B+A':
                // β⁺ decay + α decay
                z -= 3; // -1 from β⁺, -2 from α
                n -= 1; // +1 from β⁺, -2 from α
                break;

            case 'B+P':
                // β⁺ decay + proton emission
                z -= 2; // -1 from β⁺, -1 from P
                n += 1; // +1 from β⁺
                break;

            case 'B-':
                // β⁻ decay: neutron → proton + electron
                z += 1; n -= 1;
                break;

            case 'B-2N':
                // β⁻ decay + two-neutron emission
                z += 1; // +1 from β⁻
                n -= 3; // -1 from β⁻, -2 from 2N
                break;

            case 'B-3N':
                // β⁻ decay + three-neutron emission
                z += 1; // +1 from β⁻
                n -= 4; // -1 from β⁻, -3 from 3N
                break;

            case 'B-4N':
                // β⁻ decay + four-neutron emission
                z += 1; // +1 from β⁻
                n -= 5; // -1 from β⁻, -4 from 4N
                break;

            case 'B-5N':
                // β⁻ decay + five-neutron emission
                z += 1; // +1 from β⁻
                n -= 6; // -1 from β⁻, -5 from 5N
                break;

            case 'B-6N':
                // β⁻ decay + six-neutron emission
                z += 1; // +1 from β⁻
                n -= 7; // -1 from β⁻, -6 from 6N
                break;

            case 'B-7N':
                // β⁻ decay + seven-neutron emission
                z += 1; // +1 from β⁻
                n -= 8; // -1 from β⁻, -7 from 7N
                break;

            case 'B-A':
                // β⁻ decay + α decay
                z -= 1; // +1 from β⁻, -2 from α
                n -= 3; // -1 from β⁻, -2 from α
                break;

            case 'B-N':
                // β⁻ decay + neutron emission
                z += 1; // +1 from β⁻
                n -= 2; // -1 from β⁻, -1 from N
                break;

            case 'B-P':
                // β⁻ decay + proton emission
                z += 0; // +1 from β⁻, -1 from P
                n -= 1; // -1 from β⁻
                break;

            case 'B-SF':
                // β⁻ decay + spontaneous fission (results unpredictable)
                return null;

            case 'EC':
                // electron capture: proton + electron → neutron
                z -= 1;
                n += 1;
                break;

            case 'EC+B+':
                // electron capture + β⁺ decay
                z -= 2; // -1 from EC, -1 from β⁺
                n += 2; // +1 from EC, +1 from β⁺
                break;

            case 'EC2P':
                // electron capture + two-proton emission
                z -= 3; // -1 from EC, -2 from 2P
                n += 1; // +1 from EC
                break;

            case 'ECA':
                // electron capture + α decay
                z -= 3; // -1 from EC, -2 from α
                n -= 1; // +1 from EC, -2 from α
                break;

            case 'ECP':
                // electron capture + proton emission
                z -= 2; // -1 from EC, -1 from P
                n += 1; // +1 from EC
                break;

            case 'ECSF':
                // electron capture + spontaneous fission (results unpredictable)
                return null;

            case 'IT':
                // isomeric transition (γ emission) - no change in Z or N
                break;

            case 'N':
                // neutron emission
                n -= 1;
                break;

            case 'P':
                // proton emission
                z -= 1;
                break;

            case 'SF':
                // spontaneous fission (results unpredictable)
                return null;

            case 'SF+EC+B+':
                // spontaneous fission + electron capture + β⁺ decay (results unpredictable)
                return null;

            default:
                return null;

        }

        return ( z < 0 || n < 0 ) ? null : { z, n };

    }

    findNuclideByZN ( z, n ) {

        for ( const [ id, nuclide ] of this.nuclideMap ) {

            if ( nuclide.z === z && nuclide.n === n ) return id;

        }

        return null;

    }

    buildDecayChain ( nuclideId ) {

        const nuclide = this.nuclideMap.get( nuclideId );

        if ( ! nuclide ) return null;

        const { z, n, m, symbol } = nuclide;
        const halfLifeSec = nuclide.half_life_sec?.value || null;
        const isStable = !! nuclide.stable;

        const chainEntry = {
            nuclide: nuclideId,
            z, n, m, symbol,
            hl: halfLifeSec,
            stable: isStable,
            decay_mode: null,
            decay_probability: null,
            daughter_chains: [],
            parent_chains: [],
            chain_depth: 0,
            is_terminal: isStable
        };

        if ( nuclide.decay ) {

            for ( const decay of nuclide.decay ) {

                const products = this.calculateDecayProducts( z, n, decay.mode );

                if ( products ) {

                    const daughterId = this.findNuclideByZN( products.z, products.n );

                    if ( daughterId ) {

                        chainEntry.daughter_chains.push( {
                            nuclide: daughterId,
                            mode: decay.mode,
                            probability: decay.percent || 100
                        } );

                    }

                }

            }

        }

        return chainEntry;

    }

    buildParentRelationships () {

        console.log( 'Building parent relationships ...' );

        for ( const [ nuclideId, chain ] of this.decayChains ) {

            for ( const daughter of chain.daughter_chains ) {

                const daughterChain = this.decayChains.get( daughter.nuclide );

                if ( daughterChain ) {

                    daughterChain.parent_chains.push( {
                        nuclide: nuclideId,
                        mode: daughter.mode,
                        probability: daughter.probability
                    } );

                }

            }

        }

    }

    calculateChainDepths () {

        console.log( 'Calculating chain depths ...' );

        const terminalNodes = [];

        for ( const [ nuclideId, chain ] of this.decayChains ) {

            if ( chain.is_terminal ) {

                terminalNodes.push( nuclideId );
                chain.chain_depth = 0;

            }

        }

        let currentDepth = 0;
        let currentNodes = [ ...terminalNodes ];
        const visited = new Set( currentNodes );

        while ( currentNodes.length > 0 && currentDepth < this.MAX_DEPTH ) {

            currentDepth++;
            const nextNodes = [];

            for ( const nodeId of currentNodes ) {

                for ( const parent of this.decayChains.get( nodeId ).parent_chains ) {

                    if ( ! visited.has( parent.nuclide ) ) {

                        const parentChain = this.decayChains.get( parent.nuclide );
                        parentChain.chain_depth = currentDepth;

                        visited.add( parent.nuclide );
                        nextNodes.push( parent.nuclide );

                    }

                }

            }

            currentNodes = nextNodes;

        }

    }

    generate () {}

}

/**
 * main function
 */
function generateDecayChains () {

    try {

        console.log( 'Reading nuclide database...' );
        const nuclides = ( new DB( 'nuclides' ) ).database;

        const processor = new NuclideProcessor( nuclides );
        processor.initialize();
        processor.generate();

        console.log( 'Decay chain generation completed successfully!' );

    } catch ( e ) {

        console.error( 'Error generating decay chains:', e );
        process.exit( 1 );

    }

}

generateDecayChains();
