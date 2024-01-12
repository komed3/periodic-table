'use strict';

import cmpstr from 'https://cdn.jsdelivr.net/npm/cmpstr@1.0.3/+esm';

window.addEventListener( 'load', function () {

    const elements = JSON.parse( window.atob( data ) );

    const ptQuizSuccess = new Audio( '/res/success.wav' );
    const ptQuizMaxTime = 900;
    const ptQuizMax = elements.length;

    var ptQuizRevealed = new Set();

    var ptQuizTime, ptQuizTimer,
        ptQuizScore, ptQuizHS;

    /**
     * reset quiz + init
     */
    var ptQuizReset = () => {

        /* reset quiz form */

        ptQuizResetInput( true );

        /* reset actions */

        document.querySelector( '[quiz="start"]' ).classList.remove( 'hidden' );
        document.querySelector( '[quiz="abort"]' ).classList.add( 'hidden' );

        /* reset table items */

        document.querySelectorAll( '.pt-table-item' ).forEach( ( el ) => {

            el.classList.remove( 'revealed' );
            el.querySelector( '.element--symbol' ).innerHTML = '';

        } );

        /* reset list items */

        document.querySelectorAll( '.pt-quiz-list-item' ).forEach( ( el ) => {

            el.classList.remove( 'revealed' );
            el.querySelector( '.element--name' ).innerHTML = '';

        } );

        /* reset timer */

        clearInterval( ptQuizTimer );

        document.querySelector( '.pt-quiz-timer' ).innerHTML = ptQuizTimeFormat( ptQuizMaxTime );

        /* reset progress */

        document.querySelector( '.pt-quiz-progress-all' ).innerHTML = ptQuizMax;

        ptQuizRevealed.clear();
        ptQuizProgress();

        /* reset score */

        ptQuizHS = parseInt( localStorage.getItem( 'pt_quiz_hs' ) || 0 );
        ptQuizScore = 0;

        document.querySelector( '.pt-quiz-score-hs b' ).innerHTML = ptQuizHS;
        document.querySelector( '.pt-quiz-score-now b' ).innerHTML = ptQuizScore;

    };

    /**
     * count from one to another number
     * @param {Node} el counter html element
     * @param {Int} from initial value
     * @param {Int} to final value
     * @param {Int} speed counter speed
     */
    var ptQuizCounter = ( el, from, to, speed = 200 ) => {

        let step = Math.abs( to - from ) / speed;

        let interval = setInterval( () => {

            if( from != to ) {

                from = Math.ceil(
                    from > to
                        ? from - step
                        : from + step
                );

                el.innerHTML = from;

            } else {

                el.innerHTML = to;

                clearInterval( interval );
                return false;

            }

        }, 1 );

    };

    /**
     * format seconds to MM:SS
     * @param {Int} time time in seconds
     * @returns {String} formatted time
     */
    var ptQuizTimeFormat = ( time ) => {

        return Math.floor( time / 60 ).toString().padStart( 2, '0' ) + ':' +
            ( time % 60 ).toString().padStart( 2, '0' );

    };

    /**
     * start quiz
     */
    var ptQuizStart = () => {

        /* reset quiz */

        ptQuizReset();

        /* undisable input field */

        ptQuizResetInput();

        /* update actions */

        document.querySelector( '[quiz="start"]' ).classList.add( 'hidden' );
        document.querySelector( '[quiz="abort"]' ).classList.remove( 'hidden' );

        /* start quiz timer */

        ptQuizTime = ptQuizMaxTime;

        ptQuizTimer = setInterval( () => {

            if( --ptQuizTime <= 0 ) {

                /* time is out */

                ptQuizFinish();

            }

            document.querySelector( '.pt-quiz-timer' ).innerHTML = ptQuizTimeFormat( ptQuizTime );

        }, 1000 );

    };

    /**
     * abort quiz
     */
    var ptQuizAbort = () => {

        ptQuizFinish();

    };

    /**
     * reset quiz input field
     * @param {Boolean} hidden disable input field
     */
    var ptQuizResetInput = ( hidden = false ) => {

        let container = document.querySelector( '.pt-quiz-input' ),
            input = container.querySelector( 'input' );

        input.value = '';

        if( hidden ) {

            container.classList.add( 'hidden' );

            input.disabled = true;
            input.blur();

        } else {

            container.classList.remove( 'hidden' );

            input.disabled = false;
            input.focus();

        }

    };

    /**
     * set quiz progress
     */
    var ptQuizProgress = () => {

        let progress = ptQuizRevealed.size;

        document.querySelector( '.pt-quiz-progress-cur' ).innerHTML = progress;

        if( progress == ptQuizMax ) {

            /* add time bonus + finish */

            ptQuizAddScore( ptQuizTime * 15 );

            ptQuizFinish();

        }

    };

    /**
     * add score to value
     * @param {Int} score score value to add
     */
    var ptQuizAddScore = ( score ) => {

        ptQuizScore += score;

        let now = document.querySelector( '.pt-quiz-score-now b' );

        ptQuizCounter( now, parseInt( now.innerHTML || 0 ), ptQuizScore );

        if( ptQuizScore > ptQuizHS ) {

            ptQuizHS = ptQuizScore;

            let hs = document.querySelector( '.pt-quiz-score-hs b' );

            ptQuizCounter( hs, parseInt( hs.innerHTML || 0 ), ptQuizHS );

        }

    };

    /**
     * search elements by name
     * @param {String} search search query
     */
    var ptQuizSearch = ( search ) => {

        search = ( search || '' ).toString().trim().toLocaleLowerCase( locale );

        elements.forEach( ( el ) => {

            if( !ptQuizRevealed.has( el.number ) ) {

                if( cmpstr.diceMatch( search, Object.values( el.names ), 'si' )[0].match > 0.9 ) {

                    ptQuizReveal( el );

                    return ;

                }

            }

        } );

    };

    /**
     * reveal element
     * @param {String} el element
     */
    var ptQuizReveal = ( el ) => {

        ptQuizRevealed.add( el.number );

        /* reveal table item */

        let tableItem = document.querySelector( '.pt-table-item[number="' + el.number + '"]' );

        tableItem.classList.add( 'revealed' );
        tableItem.querySelector( '.element--symbol' ).innerHTML = el.symbol;

        /* reveal list item */

        let listItem = document.querySelector( '.pt-quiz-list-item[number="' + el.number + '"]' );

        listItem.classList.add( 'revealed' );
        listItem.querySelector( '.element--name' ).innerHTML = el.names[ locale ];

        /* add score */

        ptQuizAddScore( el.score );

        /* play "success" sound */

        ptQuizSuccess.play();

        /* update progress */

        ptQuizProgress();

        /* reset input field */

        ptQuizResetInput();

    };

    /**
     * finish game + dialog
     */
    var ptQuizFinish = () => {

        /* disable input field */

        ptQuizResetInput( true );

        /* update actions */

        document.querySelector( '[quiz="start"]' ).classList.remove( 'hidden' );
        document.querySelector( '[quiz="abort"]' ).classList.add( 'hidden' );

        /* stopp quiz timer */

        clearInterval( ptQuizTimer );

        /* save highscore */

        localStorage.setItem( 'pt_quiz_hs', ptQuizHS );

        /* show finish dialog */

        if( ptQuizRevealed.size > 0 ) {

            document.querySelector( '.pt-quiz-overlay' ).classList.add( 'active' );

            let dialog = document.querySelector( '.pt-quiz-dialog' ),
                result = [
                    ptQuizRevealed.size,
                    ptQuizMax,
                    ptQuizTimeFormat( ptQuizMaxTime - ptQuizTime ),
                    ptQuizScore
                ];

            dialog.querySelectorAll( 'p b' ).forEach( ( el, k ) => {

                el.innerHTML = result[ k ];

            } );

        }

    };

    /**
     * event handlers
     */

    document.querySelector( '[quiz="start"]' ).addEventListener( 'click', ( e ) => {

        e.preventDefault();

        ptQuizStart();

    } );

    document.querySelector( '[quiz="abort"]' ).addEventListener( 'click', ( e ) => {

        e.preventDefault();

        ptQuizAbort();

    } );

    document.querySelector( '[quiz="input"]' ).addEventListener( 'input', ( e ) => {

        e.preventDefault();

        ptQuizSearch( e.target.value );

    } );

    document.querySelector( '[quiz="dialog"]' ).addEventListener( 'click', ( e ) => {

        e.preventDefault();

        document.querySelector( '.pt-quiz-overlay' ).classList.toggle( 'active' );

    } );

    /**
     * reset quiz by loading page
     */

    ptQuizReset();

} );