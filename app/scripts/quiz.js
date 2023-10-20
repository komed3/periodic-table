window.addEventListener( 'load', function () {

    const elements = ptLoadDB( 'elements' );

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

        /* reset element items */

        document.querySelectorAll( '.pt-quiz-table-item' ).forEach( ( el ) => {

            el.classList.remove( 'revealed' );
            el.querySelector( '.element--symbol' ).innerHTML = '';

        } );

        /* reset timer */

        clearInterval( ptQuizTimer );

        document.querySelector( '.pt-quiz-timer' ).innerHTML = '15:00';

        /* reset progress */

        document.querySelector( '.pt-quiz-progress-all' ).innerHTML = Object.keys( elements ).length;

        ptQuizRevealed.clear();
        ptQuizProgress();

        /* reset score */

        ptQuizHS = parseInt( localStorage.getItem( 'pt_quiz_hs' ) || 0 );
        ptQuizScore = 0;

        ptQuizSetScore( ptQuizScore, 'now' );
        ptQuizSetScore( ptQuizHS, 'hs' );

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

        /* quiz timer */

        ptQuizTime = 900;

        ptQuizTimer = setInterval( () => {

            ptQuizTime--;

            document.querySelector( '.pt-quiz-timer' ).innerHTML =
                Math.floor( ptQuizTime / 60 ).toString().padStart( 2, '0' ) + ':' +
                ( ptQuizTime % 60 ).toString().padStart( 2, '0' );

        }, 1000 );

    };

    /**
     * abort quiz
     */
    var ptQuizAbort = () => {

        /* disable input field */

        document.querySelector( '.pt-quiz-input' ).classList.add( 'hidden' );

        /* update actions */

        document.querySelector( '[quiz="start"]' ).classList.remove( 'hidden' );
        document.querySelector( '[quiz="abort"]' ).classList.add( 'hidden' );

        /* stopp quiz timer */

        clearInterval( ptQuizTimer );

    };

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

        if( progress == Object.keys( elements ).length ) {

            //

        }

    };

    /**
     * set new score value
     * @param {Int} score score value
     * @param {String} type score type to set
     */
    var ptQuizSetScore = ( score, type = 'now' ) => {

        let el = document.querySelector( '.pt-quiz-score-' + type + ' b' );

        ptQuizCounter( el, parseInt( el.innerHTML || 0 ), score );

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

                        ptQuizRevealed.add( el );

                        ptQuizReveal( k );

                        ptQuizProgress();

                        ptQuizResetInput();

                        return ;

                    }

                } );

            }

        }

    };

    /**
     * reveal element
     * @param {String} el element key
     */
    var ptQuizReveal = ( el ) => {

        let number = elements[ el ].number;

        let tableItem = document.querySelector( '.pt-quiz-table-item[number="' + number + '"]' );

        tableItem.classList.add( 'revealed' );
        tableItem.querySelector( '.element--symbol' ).innerHTML = elements[ el ].symbol;

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