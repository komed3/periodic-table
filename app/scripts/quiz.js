window.addEventListener( 'load', function () {

    const elements = ptLoadDB( 'elements' );

    const ptQuizLocale = document.querySelector( '.pt-quiz' ).getAttribute( 'locale' );

    const ptQuizMaxTime = 900;
    const ptQuizMax = Object.keys( elements ).length;

    var ptQuizRevealed = new Set();

    var ptQuizTime, ptQuizTimer,
        ptQuizScore, ptQuizHS;

    /**
     * reset quiz + init
     */
    var ptQuizReset = () => {

        /* reset quiz form */

        let input = document.querySelector( '.pt-quiz-input' );

        input.classList.add( 'hidden' );
        input.querySelector( 'input' ).value = '';

        /* reset actions */

        document.querySelector( '[quiz="start"]' ).classList.remove( 'hidden' );
        document.querySelector( '[quiz="abort"]' ).classList.add( 'hidden' );

        /* reset table items */

        document.querySelectorAll( '.pt-quiz-table-item' ).forEach( ( el ) => {

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

        document.querySelector( '.pt-quiz-timer' ).innerHTML = '15:00';

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

        document.querySelector( '.pt-quiz-input' ).classList.remove( 'hidden' );

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
     */
    var ptQuizResetInput = () => {

        let input = document.querySelector( '[quiz="input"]' );

        input.value = '';
        input.focus();

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

        search = ( search || '' ).toString().trim().toLowerCase();

        for( const [ k, el ] of Object.entries( elements ) ) {

            if( !ptQuizRevealed.has( k ) ) {

                Object.values( el.names ).forEach( ( n ) => {

                    if( n.toLowerCase() == search ) {

                        ptQuizReveal( k );

                        return ;

                    }

                } );

            }

        }

    };

    /**
     * reveal element
     * @param {String} k element key
     */
    var ptQuizReveal = ( k ) => {

        let el = elements[ k ];

        ptQuizRevealed.add( k );

        /* reveal table item */

        let tableItem = document.querySelector( '.pt-quiz-table-item[number="' + el.number + '"]' );

        tableItem.classList.add( 'revealed' );
        tableItem.querySelector( '.element--symbol' ).innerHTML = el.symbol;

        /* reveal list item */

        let listItem = document.querySelector( '.pt-quiz-list-item[number="' + el.number + '"]' );

        listItem.classList.add( 'revealed' );
        listItem.querySelector( '.element--name' ).innerHTML = el.names[ ptQuizLocale ];

        /* add score */

        ptQuizAddScore(
            el.number + (
            el.period * 2
        ) + (
            el.group > 18
                ? 200
                : el.group > 2 && el.group < 13
                    ? 100
                    : 50
        ) );

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

        document.querySelector( '.pt-quiz-input' ).classList.add( 'hidden' );

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

    /**
     * reset quiz by loading page
     */

    ptQuizReset();

} );