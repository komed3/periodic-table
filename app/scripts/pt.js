jQuery( document ).ready( function ( $ ) {

    if( $( '.tp-legend' ).length ) {

        $( document ).on( 'click', '.tp-legend input', function () {

            let prop = $( this ).attr( 'prop' );

            if( this.checked ) {

                $( '[toggle] .pt-el[layer="' + prop + '"]' ).removeClass( 'hidden' );

            } else {

                $( '[toggle] .pt-el[layer="' + prop + '"]' ).addClass( 'hidden' );

            }

        } );

    }

} );