window.addEventListener( 'load', function () {

    var ptQuizHS, ptQuizScore;

    /**
     * reset quiz + init
     */
    var ptQuizLoad = () => {

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
     * set new score value
     * @param {Int} score score value
     * @param {String} type score type to set
     */
    var ptQuizSetScore = ( score, type = 'now' ) => {

        let el = document.querySelector( '.pt-quiz-score-' + type + ' b' );

        ptQuizCounter( el, parseInt( el.innerHTML || 0 ), score );

    };

    ptQuizLoad();

} );