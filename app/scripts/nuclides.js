window.addEventListener( 'load', function () {

    const ptNuclidesSelector = document.querySelector( '.pt-nuclides-selector-select' );

    ptNuclidesSelector.addEventListener( 'change', ( e ) => {

        const url = new URL( window.location.href );
        const params = new URLSearchParams( url.search );

        const z = params.get( 'z' ) ?? 0;
        const n = params.get( 'n' ) ?? 0;

        window.location.href = (
            url.origin + url.pathname + '?z=' + z + '&n=' +
            n + '&schema=' + e.target.value
        );

    } );

} );