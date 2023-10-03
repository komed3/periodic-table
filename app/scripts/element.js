jQuery( document ).ready( function( $ ) {

    if( ( el = $( '.pt-element-summary' ) ).length ) {

        let locale = el.attr( 'locale' ),
            page = el.attr( 'page' );

        $.ajax( {
            type: 'get',
            url: 'https://' + locale + '.wikipedia.org/w/api.php',
            crossDomain: true,
            dataType: 'jsonp',
            data: {
                action: 'query',
                format: 'json',
                titles: page,
                redirects: 1,
                prop: 'extracts',
                exsentences: 99,
                exintro: 1,
                exsectionformat: 'plain'
            },
            success: function ( response ) {

                if( Object.keys( response.query.pages ).length ) {

                    el.html( Object.values( response.query.pages )[0].extract );

                }

            }
        } );

    }

} );