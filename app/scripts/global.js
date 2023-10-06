jQuery( document ).ready( function ( $ ) {

    $( 'a[target="_blank"], .external, .weblink' ).each( function() {

        $( this ).attr( {
            target: '_blank',
            rel: 'noopener noreferrer'
        } );

    } );

    $( document ).on( 'click', '.pt-header-menu', function ( e ) {

        e.preventDefault();

        $( this ).toggleClass( 'active' );
        $( '.pt-header-nav' ).toggleClass( 'active' );

    } );

} );