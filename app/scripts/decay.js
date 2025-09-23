window.addEventListener( 'load', function () {

    const container = document.querySelector( '.pt-decay-chain' );

    const modes = {
        '2B+': { label: '2β⁺', title: 'Double beta plus decay' },
        '2B-': { label: '2β⁻', title: 'Double beta minus decay' },
        '2EC': { label: '2EC', title: 'Double electron capture' },
        '2N': { label: '2n', title: 'Two-neutron emission' },
        '2P': { label: '2p', title: 'Two-proton emission' },
        '3N': { label: '3n', title: 'Three-neutron emission' },
        '4N': { label: '4n', title: 'Four-neutron emission' },
        '5N': { label: '5n', title: 'Five-neutron emission' },
        '6N': { label: '6n', title: 'Six-neutron emission' },
        '7N': { label: '7n', title: 'Seven-neutron emission' },
        'A': { label: 'α', title: 'Alpha decay' },
        'B+': { label: 'β⁺', title: 'Beta plus decay' },
        'B+2P': { label: 'β⁺+2p', title: 'Beta+ + Two-proton emission' },
        'B+A': { label: 'β⁺+α', title: 'Beta+ + Alpha decay' },
        'B+P': { label: 'β⁺+p', title: 'Beta+ + Proton emission' },
        'B-': { label: 'β⁻', title: 'Beta minus decay' },
        'B-2N': { label: 'β⁻+2n', title: 'Beta- + 2 neutron emission' },
        'B-3N': { label: 'β⁻+3n', title: 'Beta- + 3 neutron emission' },
        'B-4N': { label: 'β⁻+4n', title: 'Beta- + 4 neutron emission' },
        'B-5N': { label: 'β⁻+5n', title: 'Beta- + 5 neutron emission' },
        'B-6N': { label: 'β⁻+6n', title: 'Beta- + 6 neutron emission' },
        'B-7N': { label: 'β⁻+7n', title: 'Beta- + 7 neutron emission' },
        'B-A': { label: 'β⁻+α', title: 'Beta- + Alpha decay' },
        'B-N': { label: 'β⁻+n', title: 'Beta- + Neutron emission' },
        'B-P': { label: 'β⁻+p', title: 'Beta- + Proton emission' },
        'B-SF': { label: 'β⁻+SF', title: 'Beta- + Spontaneous fission' },
        'EC': { label: 'EC', title: 'Electron capture' },
        'EC+B+': { label: 'EC+β⁺', title: 'Electron capture + Beta+' },
        'EC2P': { label: 'EC+2p', title: 'Electron capture + Two-proton emission' },
        'ECA': { label: 'EC+α', title: 'Electron capture + Alpha decay' },
        'ECP': { label: 'EC+p', title: 'Electron capture + Proton emission' },
        'ECSF': { label: 'EC+SF', title: 'Electron capture + Spontaneous fission' },
        'IT': { label: 'γ', title: 'Isomeric transition (γ)' },
        'N': { label: 'n', title: 'Neutron emission' },
        'P': { label: 'p', title: 'Proton emission' },
        'SF': { label: 'SF', title: 'Spontaneous fission' },
        'SF+EC+B+': { label: 'SF+EC+β⁺', title: 'Spontaneous fission + EC + Beta+' },
        'X': { label: '{?}', title: 'Other decay' }
    }

    const units = [
        { name: 'Py', value: 31536e18 },
        { name: 'Ty', value: 31536e15 },
        { name: 'Gy', value: 31536e12 },
        { name: 'My', value: 31536e9 },
        { name: 'ky', value: 31536e6 },
        { name: 'y', value: 31536000 },
        { name: 'd', value: 86400 },
        { name: 'h', value: 3600 },
        { name: 'min', value: 60 },
        { name: 's', value: 1 },
        { name: 'ms', value: 0.001 },
        { name: 'µs', value: 0.000001 },
        { name: 'ns', value: 0.000000001 },
        { name: 'ps', value: 0.000000000001 }
    ];

    const formatHalfLife = ( seconds ) => {

        for ( const unit of units ) { if ( seconds >= unit.value ) {

            const value = ( seconds / unit.value ).toFixed( 2 );
            return `${value} ${unit.name}`;

        } }

        return 'stable';

    }

    const getNodeColor = ( nuclide ) =>
        nuclide.stable ? '#858585'
            : nuclide.hl < 0.001 ? '#ad74c7'
            : nuclide.hl < 1 ? '#ca7fad'
            : nuclide.hl < 3600 ? '#e48d87'
            : nuclide.hl < 84600 ? '#a88a5c'
            : nuclide.hl < 31536000 ? '#699ca8'
            : nuclide.hl < 31536e6 ? '#6978a8'
            : nuclide.hl < 31536e9 ? '#9b9e75'
            : '#85bb86';

    const changeCursor = ( style ) => container.style.cursor = style;

    if ( container && data ) {

        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();

        for ( const [ id, nuclide ] of data ) {

            const label = `${nuclide.symbol} ${nuclide.m}`;

            nodes.add( {
                id, label, title: `${label} / t½ ${ formatHalfLife( nuclide.hl ) }`,
                color: getNodeColor( nuclide )
            } );

            for ( const daughter of nuclide.daughter_chains ) {

                const width = Math.max( 1, daughter.probability / 20 );

                edges.add( {
                    from: id, to: daughter.nuclide, width,
                    dashes: width < 2 ? [ 10, 10 ] : undefined,
                    ...modes[ daughter.mode ]
                } );

            }

        }

        const network = new vis.Network( container, { nodes, edges }, {
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: container.offsetWidth > 800 ? 'LR' : 'UD',
                    sortMethod: 'directed',
                    levelSeparation: 200,
                    nodeSpacing: 150,
                    treeSpacing: 200
                }
            },
            physics: {
                enabled: false
            },
            interaction: {
                hover: true,
                zoomView: true,
                dragView: true
            },
            nodes: {
                borderWidth: 2,
                font: {
                    color: 'white',
                    size: 14
                },
                shape: 'box',
                widthConstraint: { minimum: 80, maximum: 120 },
                heightConstraint: { minimum: 40 }
            },
            edges: {
                arrows: {
                    to: { enabled: true, scaleFactor: 1 }
                },
                font: {
                    size: 24
                },
                smooth: {
                    type: 'curvedCW',
                    forceDirection: 'horizontal',
                    roundness: 0.2
                }
            }
        } );

        network.on( 'doubleClick', ( { nodes } ) => {

            if ( nodes.length > 0 ) {

                const url = new URL( window.location.href );
                const key = nodes[0];

                window.location.href = (
                    url.origin + '/' +
                    url.pathname.split( '/' )[1] + '/isotopes/' +
                    key.split( '_' )[0] + '#' + key
                );

            }

        } );

        network.on( 'hoverNode', () => changeCursor( 'pointer' ) );
        network.on( 'blurNode', () => changeCursor( 'grab' ) );
        network.on( 'hoverEdge', () => changeCursor( 'help' ) );
        network.on( 'blurEdge', () => changeCursor( 'grab' ) );
        network.on( 'dragStart', () => changeCursor( 'grabbing' ) );
        network.on( 'dragging', () => changeCursor( 'grabbing' ) );
        network.on( 'dragEnd', () => changeCursor( 'grab' ) );

    }

} );