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
        this._on_update = () => { };
        d3.select('body')
            .on('click', this._on_click.bind(this));
    }
    on_update(callback) {
        if (!arguments.length)
            return this._on_update;
        this._on_update = callback;
        return this;
    }
    projections(projections) {
        if (!arguments.length)
            return this._projections;
        this._projections = projections;
        return this;
    }
    set_instance(instance) {
        let projections = new Map();
        let atoms = instance.atoms();
        this._projections.forEach((atom, signature) => {
            let atomnew = atoms.find(a => a.id() === atom.id());
            if (atomnew && atomnew.signature().label() === signature.label()) {
                projections.set(atomnew.signature(), atomnew);
            }
        });
        this._projections = projections;
        this._set_signatures(instance
            .univ()
            .signatures()
            .filter(sig => {
            return sig.label() !== 'univ' && sig.label() !== 'seq/Int';
        })
            .filter(sig => {
            return !this._projections.has(sig);
        })
            .sort((a, b) => {
            if (a.private() && !b.private())
                return 1;
            if (!a.private() && b.private())
                return -1;
            return sig_label(a).localeCompare(sig_label(b));
        }));
        this._update_projections();
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
    _set_projection(atom, signature) {
        if (atom === null) {
            this._projections.delete(signature);
        }
        else {
            this._projections.set(signature, atom);
        }
        this._on_update(this._projections);
    }
    _set_signatures(signatures) {
        this._signatures = signatures;
        this._update_signatures();
    }
    _update_projections() {
        let projections = this._projections;
        let sigs = Array.from(projections.keys());
        let projection_callback = this._set_projection.bind(this);
        let add_signature = (signature) => {
            this._signatures.push(signature);
            this._set_signatures(this._signatures);
        };
        this._projlist
            .selectAll('.combo-button')
            .data(sigs, d => d.id())
            .join(enter => add_combo_button(enter))
            .each(function (signature) {
            let projection = d3.select(this);
            let atoms = signature.atoms(true);
            let atom = projections.get(signature);
            let btn_prev = projection.select('#prev');
            let btn_atom = projection.select('#atom');
            let btn_next = projection.select('#next');
            let btn_exit = projection.select('#exit');
            if (!atom) {
                btn_prev.classed('inactive', true);
                btn_atom.classed('inactive', true).text(sig_label(signature));
                btn_next.classed('inactive', true);
            }
            else {
                btn_atom.text(atom.label());
                let i = atoms.indexOf(atom);
                btn_prev.classed('inactive', i === 0);
                btn_next.classed('inactive', i === atoms.length - 1);
                projection_callback(atom, signature);
            }
            if (atoms.length > 1) {
                let atomlist = projection.select('#atomlist');
                atomlist
                    .selectAll('.atom')
                    .data(atoms)
                    .join('div')
                    .attr('class', 'atom dropdown-item')
                    .attr('id', (d) => d.label())
                    .text((d) => d.label())
                    .on('click', pick_atom);
                btn_prev
                    .on('click', () => {
                    let i = atoms.indexOf(atom);
                    if (i > 0)
                        pick_atom(atoms[i - 1], i - 1);
                });
                btn_atom
                    .on('click', () => {
                    let vis = atomlist.style('display');
                    let offset = btn_prev.node().getBoundingClientRect().width;
                    let width = btn_atom.node().getBoundingClientRect().width;
                    atomlist
                        .style('display', vis === 'none' ? 'flex' : 'none')
                        .style('left', offset + 'px')
                        .style('min-width', width + 'px');
                });
                btn_next
                    .on('click', () => {
                    let i = atoms.indexOf(atom);
                    if (i < atoms.length - 1)
                        pick_atom(atoms[i + 1], i + 1);
                });
                function pick_atom(next, index) {
                    atom = next;
                    btn_atom.text(atom.label());
                    atomlist.style('display', 'none');
                    projection_callback(atom, signature);
                    btn_prev.classed('inactive', index === 0);
                    btn_next.classed('inactive', index === atoms.length - 1);
                }
            }
            else {
                btn_prev.classed('inactive', true);
                btn_next.classed('inactive', true);
            }
            btn_exit.on('click', () => {
                projection_callback(null, signature);
                projection.remove();
                add_signature(signature);
            });
        });
    }
    _update_signatures() {
        this._btn_add
            .select('.dropdown-content')
            .selectAll('.dropdown-item')
            .data(this._signatures, sig => sig.id())
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
        .attr('class', 'combo-button dropdown');
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
        .attr('id', 'exit')
        .append('i')
        .attr('class', 'fas fa-times');
    button.append('div')
        .attr('class', 'dropdown-content')
        .attr('id', 'atomlist');
    return button;
}
function sig_label(sig) {
    let label = sig.label();
    return label.substring(0, 5) === 'this/' ? label.substring(5) : label;
}
