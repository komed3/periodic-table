jQuery( document ).ready( function ( $ ) {

    $( 'a[target="_blank"]' ).each( function() {

        $( this ).attr( 'rel', 'noopener noreferrer' );

    } );

    $( document ).on( 'click', '.pt-header-menu', function ( e ) {

        e.preventDefault();

        $( this ).toggleClass( 'active' );
        $( '.pt-header-nav' ).toggleClass( 'active' );

    } );

} );