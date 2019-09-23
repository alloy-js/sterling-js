import { Node } from '../graph-node-shapes/node';
import { Edge } from '../graph-edge-shapes/edge';
import { TreeLayoutPreferences } from '../tree-layout-preferences';
import * as d3 from 'd3';
export class DagreLayout {
    constructor() {
        this._include_private_nodes = false;
        this._rank_sep = 150;
    }
    height() {
        return this._props ? this._props.height : 0;
    }
    layout(instance, preferences) {
        console.log(to_hierarchy(instance, new TreeLayoutPreferences()));
        let graph = new dagre.graphlib.Graph({ multigraph: true, compound: true });
        let props = this._graph_properties();
        let { nodes, edges } = build_dagre_data(instance, preferences);
        graph.setGraph(props);
        graph.setDefaultEdgeLabel(function () { return {}; });
        nodes.forEach(node => graph.setNode(node.label(), node));
        edges.forEach(edge => graph.setEdge(edge.source(), edge.target(), edge, edge.label()));
        nodes.forEach(node => {
            if (node.parent())
                graph.setParent(node.label(), node.parent());
        });
        dagre.layout(graph);
        this._props = props;
        this._nodes = nodes;
        this._edges = edges;
    }
    edges() {
        return this._edges;
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
function to_node(item, prefs) {
    if (item.expressionType() === 'signature') {
        let node = new Node()
            .datum(item)
            .label(item.label())
            .parent(item.parent()
            ? item.parent().label()
            : null);
        node.width = prefs.node_width;
        node.height = prefs.node_height;
        node.label_placement = prefs.sig_label_placement;
        return node;
    }
    else {
        let node = new Node()
            .datum(item)
            .label(item.label())
            .parent(item.signature());
        node.width = prefs.node_width;
        node.height = prefs.node_height;
        node.label_placement = prefs.atom_label_placement;
        return node;
    }
}
function build_dagre_data(instance, prefs) {
    let sigs = instance.signatures();
    let fields = instance.fields();
    let nodes = new Map();
    let edges = new Map();
    // Convert all signatures to nodes
    sigs
        .filter(sig => prefs.show_builtin ? true : !sig.builtin())
        .filter(sig => prefs.show_meta ? true : !sig.meta())
        .filter(sig => prefs.show_private ? true : !sig.private())
        .map(sig => to_node(sig, prefs))
        .forEach(node => nodes.set(node.label(), node));
    // Convert all atoms to nodes
    sigs
        .filter(sig => prefs.show_builtin ? true : !sig.builtin())
        .filter(sig => prefs.show_meta ? true : !sig.meta())
        .filter(sig => prefs.show_private ? true : !sig.private())
        .map(sig => sig.atoms())
        .reduce((acc, cur) => acc.concat(cur), [])
        .map(atom => to_node(atom, prefs))
        .forEach(node => nodes.set(node.label(), node));
    // Add nodes that have been filtered out but still appear in tuples
    fields.forEach(field => {
        field.tuples()
            .forEach(tuple => {
            let atoms = tuple.atoms();
            let frst = atoms[0];
            let last = atoms[atoms.length - 1];
            if (!nodes.has(frst.label())) {
                let node = to_node(frst, prefs);
                nodes.set(node.label(), node);
            }
            if (!nodes.has(last.label())) {
                let node = to_node(last, prefs);
                nodes.set(node.label(), node);
            }
        });
    });
    // Convert all tuples to edges
    fields.forEach(field => {
        field.tuples()
            .map(tuple => {
            let atoms = tuple.atoms();
            return new Edge()
                .datum(tuple)
                .label(field.toString() + ':' + atoms.join('->'))
                .source(atoms[0].label())
                .target(atoms[atoms.length - 1].label());
        })
            .forEach(edge => edges.set(edge.label(), edge));
    });
    nodes.forEach(node => node.width = prefs.node_width);
    nodes.forEach(node => node.height = prefs.node_height);
    return {
        nodes: Array.from(nodes.values()),
        edges: Array.from(edges.values())
    };
}
function to_hierarchy(instance, p) {
    return d3.hierarchy(instance, function (d) {
        let type = d.expressionType();
        if (type === 'instance')
            return [d.univ()].concat(d.skolems());
        if (type !== 'tuple' && d.label() === 'univ')
            return d.signatures()
                .filter(s => p.show_builtins ? true : !s.builtin());
        if (type === 'signature')
            return d.atoms();
        if (type === 'atom') {
            let fields = d.signature().fields();
            fields.forEach(field => field.atom = d);
            return fields;
        }
        if (type === 'field')
            return d.atom.join(d);
        if (type === 'skolem')
            return d.tuples();
    });
}
