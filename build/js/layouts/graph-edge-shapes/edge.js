export class Edge {
    constructor() {
        this._datum = null;
        this._label = '';
        this._source = null;
        this._target = null;
    }
    datum(datum) {
        if (!arguments.length)
            return this._datum;
        this._datum = datum;
        return this;
    }
    label(label) {
        if (!arguments.length)
            return this._label;
        this._label = label;
        return this;
    }
    source(source) {
        if (!arguments.length)
            return this._source;
        this._source = source;
        return this;
    }
    target(target) {
        if (!arguments.length)
            return this._target;
        this._target = target;
        return this;
    }
}
