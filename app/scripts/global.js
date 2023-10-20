/**
 * load database
 * @param {String} DB database name
 * @returns database object
 */
var ptLoadDB = ( DB ) => {

    let req = new XMLHttpRequest();

    req.open( 'GET', '/db/' + DB + '.min.json', false );
    req.send( null );

    if( req.status == 200 ) {

        try {

            return JSON.parse( req.responseText );

        } catch( e ) {

            return {};

        }

    }

    return {};

};

/**
 * DOM content loaded
 */

window.addEventListener( 'load', function () {

    /**
     * external links "_blank" + "noopener, noreferrer"
     */

    var ptExternalLinks = document.querySelectorAll( 'a[target="_blank"], .external, .weblink' );

    [].forEach.call( ptExternalLinks, ( el ) => {

        el.setAttribute( 'target', '_blank' );
        el.setAttribute( 'rel', 'noopener noreferrer' );

    } );

    /**
     * header menu toggle (open / close )
     */

    var ptHeaderNavOpener = document.querySelector( '.pt-header-menu' ),
        ptHeaderNav = document.querySelector( '.pt-header-nav' );

    ptHeaderNavOpener.addEventListener( 'click', ( e ) => {

        e.preventDefault();

        ptHeaderNavOpener.classList.toggle( 'active' );
        ptHeaderNav.classList.toggle( 'active' );

    }, false );

    /**
     * language selector
     */

    var ptLanguageSelector = document.querySelector( '.pt-language-selector-select' );

    ptLanguageSelector.addEventListener( 'change', ( e ) => {

        location.href = '/set?locale=' + e.target.value;

    }, false );

}, false );