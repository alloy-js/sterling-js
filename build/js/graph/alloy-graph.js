import * as d3 from 'd3';
export class AlloyGraph {
    constructor(instance) {
        this._instance = instance;
        this._projections = [];
    }
    filter_builtins(filter) {
        if (!arguments.length)
            return this._builtin;
        this._builtin = filter;
        return this;
    }
    filter_disconnected(filter) {
        if (!arguments.length)
            return this._disconnected;
        this._disconnected = filter;
        return this;
    }
    filter_meta(filter) {
        if (!arguments.length)
            return this._meta;
        this._meta = filter;
        return this;
    }
    filter_private(filter) {
        if (!arguments.length)
            return this._private;
        this._private = filter;
        return this;
    }
    project(atom) {
    }
    unproject(atom) {
    }
    _hierarchy() {
        let bltn = this._builtin, meta = this._meta, priv = this._private;
        return d3.hierarchy(this._instance, function (d) {
            let type = d.expressionType();
            if (type !== 'tuple' && type !== 'field') {
                if (type === 'instance') {
                    return d.univ();
                }
                if (d.label() === 'univ')
                    return d.signatures()
                        .filter(s => bltn ? true : !s.builtin())
                        .filter(s => meta ? true : !s.meta())
                        .filter(s => priv ? true : !s.private());
                if (type === 'signature')
                    return d.atoms();
            }
        });
    }
}
