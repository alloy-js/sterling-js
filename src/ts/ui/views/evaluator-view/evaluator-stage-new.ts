import * as d3 from 'd3';

interface Tuple {
    source: string,
    target: string,
    relation: string
}

interface TupleSet {
    source: string,
    target: string,
    relations: string[]
}

export class EvaluatorStageNew {

    _stage = null;
    _canvas = null;
    _context = null;

    _width = 0;
    _height = 0;

    _simulation = d3.forceSimulation<any>();
    _forceLink = d3.forceLink<any, any>().id(d => d.id);
    _forceCenter = d3.forceCenter();
    _forceCharge = d3.forceManyBody();

    _radius = 30;

    _tuples: TupleSet[] = [];

    _nodes = [];            // all nodes
    _disconnected = [];     // nodes not part of simulation
    _connected = [];        // nodes part of simulation
    _fixed = [];            // nodes in simulation with a fixed position
    _free = [];             // nodes in simulation with a non-fixed position

    constructor (selection) {

        this._stage = selection;
        this._canvas = selection.append('canvas');
        this._context = this._canvas.node().getContext('2d');

        this._width = parseInt(this._canvas.style('width'));
        this._height = parseInt(this._canvas.style('height'));
        this._canvas.attr('width', this._width);
        this._canvas.attr('height', this._height);

        this._forceLink.distance(6 * this._radius);
        this._forceCenter.x(this._width / 2).y(this._height / 2);
        this._forceCharge.strength(-100);

        this._simulation
            .force('link', this._forceLink)
            .force('center', this._forceCenter)
            .force('charge', this._forceCharge)
            .on('tick', this._repaint.bind(this));

        this._canvas.call(d3.drag()
            .container(this._canvas.node())
            .subject(this._dragSubject.bind(this))
            .on('start', this._dragStarted.bind(this))
            .on('drag', this._dragged.bind(this))
            .on('end', this._dragEnded.bind(this)));

        this._canvas
            .on('click', this._onClick.bind(this))
            .on('dblclick', this._onDblClick.bind(this));

    }

    public addTuples (tuples: Tuple[]) {

        tuples.forEach(this._addTuple.bind(this));
        arrange_rows(this._disconnected, this._width, this._height, this._radius);
        this._simulation.nodes(this._connected);
        this._forceLink.links(this._tuples);
        this._repaint();

    }

    public nodes (nodes) {

        this._nodes = nodes;
        this._tuples = [];

        this._connected = [];
        this._fixed = [];
        this._free = [];
        this._disconnected = nodes.slice().sort((a, b) => a.id < b.id);
        arrange_rows(this._disconnected, this._width, this._height, this._radius);

        this._forceLink.links([]);
        this._simulation.nodes(this._connected);

    }

    private _addTuple (tuple: Tuple) {

        const source = tuple.source;
        const target = tuple.target;

        // Check that source and target are valid nodes
        if (!this._nodes.find(node => node.id === source))
            throw Error(`Tuple source node is not valid: ${source}`);
        if (!this._nodes.find(node => node.id === target))
            throw Error(`Tuple target node is not valid: ${target}`);

        // If the link for this tuple exists already, add to its relation,
        // otherwise create a new link.
        const existing = this._tuples.find(tuple =>
            tuple.source === source && tuple.target === target
        );

        if (existing) {

            if (!existing.relations.includes(tuple.relation))
                existing.relations.push(tuple.relation);

        } else {

            this._tuples.push({
                source: source,
                target: target,
                relations: [tuple.relation]
            });

        }

        // If the source or target is a disconnected node, un-disconnect it
        const srcindex = this._disconnected.findIndex(node => node.id === source);
        if (srcindex !== -1) {
            const srcnode = this._disconnected[srcindex];
            delete srcnode.fx;
            delete srcnode.fy;
            this._connected.push(srcnode);
            this._free.push(srcnode);
            this._disconnected.splice(srcindex, 1);
        }
        const trgindex = this._disconnected.findIndex(node => node.id === target);
        if (trgindex !== -1) {
            const trgnode = this._disconnected[trgindex];
            delete trgnode.fx;
            delete trgnode.fy;
            this._connected.push(trgnode);
            this._free.push(trgnode);
            this._disconnected.splice(trgindex, 1);
        }

    }

    private _dragSubject () {

        return this._simulation.find(d3.event.x, d3.event.y, this._radius);

    }

    private _dragStarted () {

        if (!d3.event.active) this._simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;

    }

    private _dragged () {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
    }

    private _dragEnded () {
        if (!d3.event.active) this._simulation.alphaTarget(0);
        if (!d3.event.subject.fixed) d3.event.subject.fx = null;
        if (!d3.event.subject.fixed) d3.event.subject.fy = null;
    }

    private _onClick () {

        if (d3.event.ctrlKey) {

            const [x, y] = d3.mouse(this._canvas.node());
            const node = this._simulation.find(x, y, this._radius);
            if (node) this._toggleFixed(node);

        }

    }

    private _onDblClick () {

        const [x, y] = d3.mouse(this._canvas.node());
        const node = this._simulation.find(x, y, this._radius);
        if (node) this._toggleFixed(node);

    }



    private _repaint () {

        const context = this._context;
        const radius = this._radius;

        // Clear the context
        context.clearRect(0, 0, this._width, this._height);

        // Draw links
        context.beginPath();
        this._tuples.forEach(tuple => drawLink(context, tuple));
        context.strokeStyle = '#111';
        context.stroke();

        // Draw arrowheads
        context.beginPath();
        this._tuples.forEach(tuple => drawArrow(context, tuple, radius));
        context.fillStyle = '#111';
        context.fill();

        // Draw fixed nodes
        context.beginPath();
        this._fixed.forEach(node => drawNode(context, node, radius));
        this._disconnected.forEach(node => drawNode(context, node, radius));
        context.fillStyle = 'white';
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = '#111';
        context.stroke();

        // Draw non-fixed nodes
        context.beginPath();
        this._free.forEach(node => drawNode(context, node, radius));
        context.fill();
        context.lineWidth = 1;
        context.stroke();

        // Draw node labels
        context.fillStyle = '#111';
        context.font = '12px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        this._nodes.forEach(node => drawLabel(context, node));

    }

    private _toggleFixed (node) {

        const freeindex = this._free.indexOf(node);
        if (freeindex !== -1) {

            const [free] = this._free.splice(freeindex, 1);
            this._fixed.push(free);
            free.fixed = true;
            free.fx = free.x;
            free.fy = free.y;

        } else {

            const fixedindex = this._fixed.indexOf(node);
            if (fixedindex !== -1) {
                const [fixed] = this._fixed.splice(fixedindex, 1);
                this._free.push(fixed);
                fixed.fixed = false;
                fixed.fx = null;
                fixed.fy = null;
            }

        }

    }

}

function arrange_rows (nodes, width, height, radius) {

    const padding = radius / 2;
    let x = radius + padding,
        y = radius + padding;

    nodes.forEach(node => {
        node.fx = node.x = x;
        node.fy = node.y = y;
        x += 2 * radius + padding;
        if (x > width - padding - radius) {
            x = radius + padding;
            y += 2 * radius + padding;
        }
    });

}

const TWOPI = 2 * Math.PI;
const PI6 = Math.PI / 6;

function drawArrow (context, link, radius) {
    const ng = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
    const x = link.target.x - radius * Math.cos(ng);
    const y = link.target.y - radius * Math.sin(ng);
    context.moveTo(x, y);
    context.lineTo(x - 10 * Math.cos(ng - PI6), y - 10 * Math.sin(ng - PI6));
    context.lineTo(x - 10 * Math.cos(ng + PI6), y - 10 * Math.sin(ng + PI6));
    context.closePath();
}

function drawLabel (context, node) {
    context.moveTo(node.x, node.y);
    context.fillText(node.id, node.x, node.y);
}

function drawLink (context, link) {
    context.moveTo(link.source.x, link.source.y);
    context.lineTo(link.target.x, link.target.y);
}

function drawNode (context, node, radius) {

    context.moveTo(node.x + radius, node.y);
    context.arc(node.x, node.y, radius, 0, TWOPI);

}
