jQuery( document ).ready( function ( $ ) {

    $( document ).on( 'click', '.pt-header-menu', function ( e ) {

        e.preventDefault();

        $( this ).toggleClass( 'active' );
        $( '.pt-header-nav' ).toggleClass( 'active' );

    } );

} );