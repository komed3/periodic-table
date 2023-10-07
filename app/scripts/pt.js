jQuery( document ).ready( function ( $ ) {

    if( $( '.tp-legend' ).length ) {

        $( document ).on( 'click', '.tp-legend input', function () {

            let prop = $( this ).attr( 'prop' );

            if( this.checked ) {

                $( '[toggle] .pt-el[prop="' + prop + '"]' ).removeClass( 'hidden' );

            } else {

                $( '[toggle] .pt-el[prop="' + prop + '"]' ).addClass( 'hidden' );

            }

        } );

        $( '.tp-legend input' ).each( function () {

            if( this.checked ) {

                $( '[toggle] .pt-el[prop="' + prop + '"]' ).removeClass( 'hidden' );

            } else {

                $( '[toggle] .pt-el[prop="' + prop + '"]' ).addClass( 'hidden' );

            }

        } );

    }

} );