window.addEventListener( 'load', function () {

    /**
     * table sorter
     * @param {Node} table table to sort
     * @param {Node} handler sort handler
     */
    var ptTableSort = ( table, handler ) => {

        let sortKey = handler.getAttribute( 'sort-key' ),
            sortDesc = !( ( handler.getAttribute( 'sort-dir' ) || 'desc' ) == 'desc' ),
            content = table.querySelector( 'tbody' ),
            items = Array.from( content.querySelectorAll( 'tr' ) );

        /**
         * sort table items
         */

        items.sort( ( a, b ) => {

            let valA = parseFloat( a.getAttribute( 'sort-value--' + sortKey ) ),
                valB = parseFloat( b.getAttribute( 'sort-value--' + sortKey ) );

            return sortDesc
                ? valB > valA ? 1 : -1
                : valA > valB ? 1 : -1;

        } );

        /**
         * rearrange table items 
         */

        items.forEach( el => {

            content.appendChild( el );

        } );

        /**
         * update sort handler
         */

        let header = table.querySelectorAll( 'thead th[sort-key]' );

        [].forEach.call( header, ( th ) => {

            th.classList.remove( 'sort' );
            th.removeAttribute( 'sort-dir' );

        } );

        handler.classList.add( 'sort' );
        handler.setAttribute( 'sort-dir', sortDesc ? 'desc' : 'asc' );

    };

    /**
     * prepare sortable tables
     */

    var ptSortableTables = document.querySelectorAll( 'table.sortable' );

    [].forEach.call( ptSortableTables, ( table ) => {

        let header = table.querySelectorAll( 'thead th[sort-key]' );

        [].forEach.call( header, ( th ) => {

            /**
             * create sort handler
             */

            let handler = document.createElement( 'a' );

            handler.href = '#';
            handler.innerHTML = '<span>' +
                th.innerHTML +
            '</span>' +
            '<div>' +
                '<i class="asc"></i>' +
                '<i class="desc"></i>' +
            '</div>';

            /**
             * sort handler event listener
             */

            handler.addEventListener( 'click', ( e ) => {

                e.preventDefault();

                ptTableSort( table, th );

            }, false );

            th.innerHTML = '';
            th.appendChild( handler );

            /**
             * if default sort >> sorting table
             */

            if( th.classList.contains( 'sort' ) ) {

                ptTableSort( table, th );

            }

        } );

    } );

} );