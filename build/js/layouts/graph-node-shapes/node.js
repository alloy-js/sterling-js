export class Node {
    constructor() {
        this._datum = null;
        this._label = '';
        this._parent = null;
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
    parent(parent) {
        if (!arguments.length)
            return this._parent;
        this._parent = parent;
        return this;
    }
}
