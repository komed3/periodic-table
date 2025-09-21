/**
 * DOM content loaded
 */

window.addEventListener( 'load', function () {

    const locale = document.querySelector( 'html' ).getAttribute( 'lang' ) || 'en';

    /**
     * external links "_blank" + "noopener, noreferrer"
     */

    const ptExternalLinks = document.querySelectorAll( 'a[target="_blank"], .external, .weblink' );

    [].forEach.call( ptExternalLinks, ( el ) => {

        el.setAttribute( 'target', '_blank' );
        el.setAttribute( 'rel', 'noopener noreferrer' );

    } );

    /**
     * header menu toggle (open / close )
     */

    const ptNavOpener = document.querySelector( '.pt-header-menu' ),
          ptNav = document.querySelector( '.pt-nav' );

    ptNavOpener.addEventListener( 'click', ( e ) => {

        e.preventDefault();

        ptNavOpener.classList.toggle( 'active' );
        ptNav.classList.toggle( 'active' );

    } );

    /**
     * language selector
     */

    const ptLanguageSelector = document.querySelector( '.pt-language-selector-select' );

    ptLanguageSelector.addEventListener( 'change', ( e ) => {

        location.href = location.href.replace( '/' + locale, '/' + e.target.value );

    } );

} );