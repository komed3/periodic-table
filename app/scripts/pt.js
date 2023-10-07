jQuery( document ).ready( function ( $ ) {

    var ptLegend = function ( el ) {

        let prop = $( el ).attr( 'prop' );

            if( el.checked ) {

                $( '[toggle] .pt-el[prop="' + prop + '"]' ).removeClass( 'hidden' );

            } else {

                $( '[toggle] .pt-el[prop="' + prop + '"]' ).addClass( 'hidden' );

            }

    };

    if( $( '.tp-legend' ).length ) {

        $( document ).on( 'click', '.tp-legend input', function () {

            ptLegend( this );

        } );

        $( '.tp-legend input' ).each( function () {

            ptLegend( this );

        } );

    }

} );