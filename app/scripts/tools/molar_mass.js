import ChemParse from 'https://cdn.jsdelivr.net/npm/chemparse@1.0.1/+esm';

window.addEventListener( 'load', function () {

    const formula = document.getElementById( 'formula' );
    const volume = document.getElementById( 'volume' );
    const volumeUnit = document.getElementById( 'volume-unit' );
    const results = document.getElementById( 'results' );

    if ( ! (
        ChemParse && data && locale &&
        formula && volume && volumeUnit &&
        results
    ) ) return;

    const unitFactors = {
        mol: 1, mg: 0.001, g: 1, kg: 1000
    };

    function formatNum ( val, digits = 4 ) {

        return Number( val ).toLocaleString( locale, {
            maximumFractionDigits: digits
        } );

    }

    function showError ( msg ) {

        results.classList.add( 'hidden' );

    }

    function calculate () {}

    function clearResults () {

        formula.value = '';
        volume.value = 1;
        volumeUnit.value = 'mol';

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
