import * as d3 from 'd3';
export class ProjectionsBar {
    constructor(selection) {
        this._projbar = selection;
        this._projlist = selection
            .select('#projections-list');
        this._btn_add = selection
            .select('#add-projection')
            .on('click', this._toggle_signatures.bind(this));
        this._btn_add_items = selection
            .selectAll('#add-projection, #add-projection *');
        this._signatures = [];
        this._projections = new Map();
        d3.select('body')
            .on('click', this._on_click.bind(this));
    }
    set_instance(instance) {
        this._set_signatures(instance
            .univ()
            .signatures()
            .filter(sig => {
            return sig.label() !== 'univ' && sig.label() !== 'seq/Int';
        })
            .sort((a, b) => {
            if (a.private() && !b.private())
                return 1;
            if (!a.private() && b.private())
                return -1;
            return sig_label(a).localeCompare(sig_label(b));
        }));
    }
    _add_projection(signature) {
        this._set_signatures(this._signatures.filter(sig => sig !== signature));
        let atoms = signature.atoms(true);
        this._projections.set(signature, atoms.length ? atoms[0] : null);
        this._update_projections();
    }
    _hide_signatures() {
        this._btn_add
            .selectAll('.dropdown-content')
            .style('display', 'none');
    }
    _on_click() {
        let outside = this._btn_add_items.filter(function () {
            return this === d3.event.target;
        }).empty();
        if (outside)
            this._hide_signatures();
    }
    _set_signatures(signatures) {
        this._signatures = signatures;
        this._update_signatures();
    }
    _update_projections() {
        let projections = this._projections;
        let sigs = Array.from(projections.keys());
        this._projlist
            .selectAll('.combo-button')
            .data(sigs, d => d.id())
            .join(enter => add_combo_button(enter))
            .each(function (signature) {
            let projection = d3.select(this);
            let atoms = signature.atoms(true);
            let atom = projections.get(signature);
            if (!atom) {
                projection.select('#prev').classed('inactive', true);
                projection.select('#atom').classed('inactive', true).text(sig_label(signature));
                projection.select('#next').classed('inactive', true);
            }
            else {
                projection.select('#atom').text(atom.label());
            }
        });
    }
    _update_signatures() {
        this._btn_add
            .select('.dropdown-content')
            .selectAll('.dropdown-item')
            .data(this._signatures)
            .join(enter => enter.append('div')
            .attr('class', 'dropdown-item')
            .text(d => sig_label(d)), update => update
            .text(d => sig_label(d)))
            .on('click', this._add_projection.bind(this));
    }
    _toggle_signatures() {
        let curr = this._btn_add
            .select('.dropdown-content')
            .style('display');
        this._btn_add
            .select('.dropdown-content')
            .style('display', curr === 'none' ? 'flex' : 'none');
    }
}
function add_combo_button(enter) {
    let button = enter
        .append('div')
        .attr('class', 'combo-button');
    button.append('div')
        .attr('class', 'icon')
        .attr('id', 'prev')
        .append('i')
        .attr('class', 'fas fa-chevron-left');
    button.append('div')
        .attr('class', 'text')
        .attr('id', 'atom');
    button.append('div')
        .attr('class', 'icon')
        .attr('id', 'next')
        .append('i')
        .attr('class', 'fas fa-chevron-right');
    button.append('div')
        .attr('class', 'icon separated')
        .append('i')
        .attr('class', 'fas fa-times');
    return button;
}
function sig_label(sig) {
    let label = sig.label();
    return label.substring(0, 5) === 'this/' ? label.substring(5) : label;
}
