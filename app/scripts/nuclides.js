window.addEventListener( 'load', function () {

    const ptNuclidesSelector = document.querySelector( '.pt-nuclides-selector-select' );

    ptNuclidesSelector.addEventListener( 'change', ( e ) => {

        const url = new URL( window.location.href );
        const params = new URLSearchParams( url.search );

        const z = params.get( 'z' ) ?? 0;
        const n = params.get( 'n' ) ?? 0;

        params.set( 'z', z );
        params.set( 'n', n );
        params.set( 'schema', e.target.value );
        url.search = params.toString();
        window.location.href = url.toString();

    } );

} );