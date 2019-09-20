export class DagreLayout {
    constructor() {
        this._include_private_nodes = false;
        this._to_node = to_node();
        this._to_link = to_link();
        this._rank_sep = 150;
    }
    height() {
        return this._props ? this._props.height : 0;
    }
    layout(atoms, tuples) {
        // TODO: A little refactoring needs to happen to make compound graphs work.
        // TODO: Let's try having a to_graph(...projections) method on an instance
        // TODO: that returns a list of nodes and links.  That way we can do all of
        // TODO: the projecting and building of hierarchical structures in the same
        // TODO: place.
        let graph = new dagre.graphlib.Graph({ multigraph: true, compound: true });
        let props = this._graph_properties();
        let nodes = atoms.map(atom => this._to_node(atom));
        let links = tuples.map(tuple => this._to_link(tuple));
        graph.setGraph(props);
        graph.setDefaultEdgeLabel(function () { return {}; });
        nodes.forEach(node => graph.setNode(node.label(), node));
        links.forEach(link => graph.setEdge(link.source.label(), link.target.label(), link.tuple));
        let signatures = new Set();
        atoms.forEach(atom => signatures.add(atom.signature()));
        signatures.forEach(sig => graph.setNode(sig.label(), sig));
        atoms.forEach(atom => graph.setParent(atom.label(), atom.signature().label()));
        dagre.layout(graph);
        this._props = props;
        this._nodes = nodes;
        this._links = graph.edges().map(e => graph.edge(e));
        console.log(links.map(link => link.tuple));
        console.log(graph.edges());
    }
    nodes() {
        return this._nodes;
    }
    links() {
        return this._links;
    }
    width() {
        return this._props ? this._props.width : 0;
    }
    _graph_properties() {
        return {
            ranksep: this._rank_sep
        };
    }
}
function to_node() {
    let _width = 150, _height = 50;
    function _to_node(atom) {
        return Object.assign(atom, {
            width: _width,
            height: _height
        });
    }
    _to_node.width = function (width) {
        if (!arguments.length)
            return _width;
        _width = +width;
        return _to_node;
    };
    _to_node.height = function (height) {
        if (!arguments.length)
            return _height;
        _height = +height;
        return _to_node;
    };
    return _to_node;
}
function to_link() {
    // No configuration needed yet, but probably will be once things
    // like projections start happening
    return function (tuple) {
        let atoms = tuple.atoms();
        return {
            source: atoms[0],
            target: atoms[atoms.length - 1],
            tuple: tuple
        };
    };
}
