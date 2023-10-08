window.addEventListener( 'load', function () {

    /**
     * external links "_blank" + "noopener, noreferrer"
     */

    var ptExternalLinks = document.querySelectorAll( 'a[target="_blank"], .external, .weblink' );

    [].forEach.call( ptExternalLinks, function ( el ) {

        el.setAttribute( 'target', '_blank' );
        el.setAttribute( 'rel', 'noopener noreferrer' );

    } );

    /**
     * header menu open/close
     */

    var ptHeaderNavOpener = document.querySelector( '.pt-header-menu' ),
        ptHeaderNav = document.querySelector( '.pt-header-nav' );

    ptHeaderNavOpener.addEventListener( 'click', function ( e ) {

        e.preventDefault();

        ptHeaderNavOpener.classList.toggle( 'active' );
        ptHeaderNav.classList.toggle( 'active' );

    }, false );

    /**
     * language selector
     */

    var ptLanguageSelector = document.querySelector( '.pt-language-selector-select' );

    ptLanguageSelector.addEventListener( 'change', function ( e ) {

        location.href = '/set?locale=' + e.target.value;

    }, false );

}, false );