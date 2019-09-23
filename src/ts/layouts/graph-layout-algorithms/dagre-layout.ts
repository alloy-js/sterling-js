import { Atom, Instance, Signature, Tuple } from '../..';
import { GraphLayoutPreferences } from '../graph-layout-preferences';
import { Node } from '../graph-node-shapes/node';
import { Edge } from '../graph-edge-shapes/edge';
declare const dagre: any;

export class DagreLayout {

    _include_private_nodes: boolean = false;

    _to_node: Function = to_node();
    _to_link: Function = to_link();

    _props;
    _nodes;
    _edges;
    _links;

    _rank_sep: number = 150;

    height () {
        return this._props ? this._props.height : 0;
    }

    layout_new (instance: Instance, preferences: GraphLayoutPreferences) {

        let graph = new dagre.graphlib.Graph({multigraph: true, compound: true});
        let props = this._graph_properties();
        let { nodes, edges } = build_dagre_data(instance, preferences);

        graph.setGraph(props);
        graph.setDefaultEdgeLabel(function () { return {}});
        nodes.forEach(node => graph.setNode(node.label(), node));
        edges.forEach(edge => graph.setEdge(edge.source(), edge.target(), edge, edge.label()));


        nodes.forEach(node => {
            if (node.parent()) graph.setParent(node.label(), node.parent());
        });

        dagre.layout(graph);

        this._props = props;
        this._nodes = nodes;
        this._edges = edges;

    }

    layout (atoms: Array<Atom>, tuples: Array<Tuple>) {

        let graph = new dagre.graphlib.Graph({multigraph: true, compound: true});
        let props = this._graph_properties();
        let nodes = atoms.map(atom => this._to_node(atom));
        let links = tuples.map(tuple => this._to_link(tuple));

        graph.setGraph(props);
        graph.setDefaultEdgeLabel(function () { return {}});
        nodes.forEach(node => graph.setNode(node.label(), node));
        links.forEach(link => graph.setEdge(link.source.label(), link.target.label(), link, link.label));

        let signatures: Set<Signature> = new Set();
        atoms.forEach(atom => signatures.add(atom.signature()));

        signatures.forEach(sig => graph.setNode(sig.label(), sig));

        atoms.forEach(atom => graph.setParent(atom.label(), atom.signature().label()));

        dagre.layout(graph);

        this._props = props;
        this._nodes = nodes;
        this._links = graph.edges().map(e => graph.edge(e));

    }

    edges () {
        return this._edges;
    }

    nodes () {
        return this._nodes;
    }

    links () {
        return this._links;
    }

    width () {
        return this._props ? this._props.width : 0;
    }

    _graph_properties () {
        return {
            ranksep: this._rank_sep
        };
    }

}

function build_dagre_data (instance: Instance, prefs: GraphLayoutPreferences) {

    let sigs = instance.signatures();
    let fields = instance.fields();

    let nodes = [];
    let edges = [];

    // Convert all signatures to nodes
    sigs
        .filter(sig => prefs.show_builtin ? true : !sig.builtin())
        .filter(sig => prefs.show_meta ? true : !sig.meta())
        .filter(sig => prefs.show_private ? true : !sig.private())
        .map(sig =>
            new Node()
                .datum(sig)
                .label(sig.label())
                .parent(sig.parent() ? sig.parent().label() : null)
        )
        .forEach(node => nodes.push(node));

    // Convert all atoms to nodes
    sigs
        .map(sig => sig.atoms())
        .reduce((acc, cur) => acc.concat(cur), [])
        .map(atom =>
            new Node()
                .datum(atom)
                .label(atom.label())
                .parent(atom.signature())
        )
        .forEach(node => nodes.push(node));

    // Convert all tuples to edges
    fields.forEach(field => {
        field.tuples()
            .map(tuple => {
                let atoms = tuple.atoms();
                return new Edge()
                    .datum(tuple)
                    .label(field.toString() + ':' + atoms.join('->'))
                    .source(atoms[0].label())
                    .target(atoms[atoms.length-1].label())
                }
            )
            .forEach(edge => edges.push(edge));
    });

    return { nodes, edges };

}

function to_node (): Function {

    let _width = 150,
        _height = 50;

    function _to_node (atom) {
        return Object.assign(atom, {
            width: _width,
            height: _height
        });
    }

    (_to_node as any).width = function (width) {
        if (!arguments.length) return _width;
        _width = +width;
        return _to_node;
    };

    (_to_node as any).height = function (height) {
        if (!arguments.length) return _height;
        _height = +height;
        return _to_node;
    };

    return _to_node;
}

function to_link (): Function {

    // No configuration needed yet, but probably will be once things
    // like projections start happening
    function _link (tuple: Tuple) {

        let atoms = tuple.atoms();
        return {
            source: atoms[0],
            target: atoms[atoms.length - 1],
            tuple: tuple,
            label: atoms.map(a => a.toString()).join('->')
        };

    }

    return _link;

}
