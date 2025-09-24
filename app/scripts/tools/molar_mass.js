import ChemParse from 'https://cdn.jsdelivr.net/npm/chemparse@1.0.1/+esm';

window.addEventListener( 'load', function () {

    const formula = document.getElementById( 'formula' );
    const volume = document.getElementById( 'volume' );
    const volumeUnit = document.getElementById( 'volume-unit' );
    const error = document.getElementById( 'error' );
    const results = document.getElementById( 'results' );
    const resTable = document.getElementById( 'results-table' );
    const resTotal = document.getElementById( 'result-total' );

    if ( ! (
        ChemParse && data && locale &&
        formula && volume && volumeUnit &&
        results && resTable
    ) ) return;

    function formatNum ( val, digits = 4 ) {

        return Number( val ).toLocaleString( locale, {
            maximumFractionDigits: digits
        } );

    }

    function convertVolume ( molarMass ) {

        let mol, g;

        switch ( volumeUnit.value ) {

            case 'mol':
                mol = volume.value;
                g = mol * molarMass;
                break;

            case 'g':
                g = volume.value;
                mol = g / molarMass;
                break;

            case 'mg':
                g = volume.value / 1000;
                mol = g / molarMass;
                break;

            case 'kg':
                g = volume.value * 1000;
                mol = g / molarMass;
                break;

        }

        return { mol, g };

    }

    function showError ( msg ) {

        error.innerHTML = msg;

        error.classList.remove( 'hidden' );
        results.classList.add( 'hidden' );

    }

    function calculate () {

        error.classList.add( 'hidden' );

        let parsed;

        try {

            parsed = ChemParse.parse( formula.value );

        } catch ( err ) {

            showError( err.message );
            return;

        }

        let molarMass = 0, atomCount = 0;
        const res = [];

        for ( const [ symbol, count ] of Object.entries( parsed ) ) {

            const m = parseFloat( data[ symbol ].atomic_mass * count );
            molarMass += m;
            atomCount += count;

            res.push( { symbol, count, m, data: data[ symbol ] } );

        }

        let resRows = '';

        for ( const { symbol, count, m, data } of res ) {

            resRows += `<tr>
                <td class="pt-prop-table-value">
                    <a href="${ window.location.origin }/${ locale }/element/${ symbol }">
                        ${ data.names[ locale ] }
                    </a>
                </td>
                <td class="pt-prop-table-value">${ count }</td>
                <td class="pt-prop-table-value">${ formatNum( count / atomCount * 100, 2 ) } %</td>
                <td class="pt-prop-table-value">${ formatNum( m ) } u</td>
                <td class="pt-prop-table-value">${ formatNum( m / molarMass * 100, 2 ) } %</td>
            </tr>`;

        }

        const { mol, g } = convertVolume( molarMass );

        resTotal.querySelector( '[data-res="mol"]' ).innerHTML = formatNum( mol ) + ' mol';
        resTotal.querySelector( '[data-res="formula"]' ).innerHTML = formula.value;
        resTotal.querySelector( '[data-res="mass"]' ).innerHTML = formatNum( g ) + ' g';

        resTable.querySelector( 'tbody' ).innerHTML = resRows;
        results.classList.remove( 'hidden' );

    }

    function clearResults () {

        formula.value = '';
        volume.value = 1;
        volumeUnit.value = 'mol';

        error.classList.add( 'hidden' );
        results.classList.add( 'hidden' );

    }

    function loadExample ( e ) {

        formula.value = e.target.getAttribute( 'data-formula' );
        volume.value = e.target.getAttribute( 'data-volume' ) || 1;
        volumeUnit.value = e.target.getAttribute( 'data-volume-unit' ) || 'mol';

        calculate();

    }

    document.querySelector( '[data-action="calculate"]' ).addEventListener( 'click', calculate );
    document.querySelector( '[data-action="clear"]' ).addEventListener( 'click', clearResults );

    document.querySelectorAll( '[data-action="example"]' ).forEach(
        btn => btn.addEventListener( 'click', loadExample )
    );

} );
