export class Node {

    _datum: any = null;
    _label: string = '';
    _parent: any = null;

    datum (datum) {
        if (!arguments.length) return this._datum;
        this._datum = datum;
        return this;
    }

    label (label) {
        if (!arguments.length) return this._label;
        this._label = label;
        return this;
    }

    parent (parent) {
        if (!arguments.length) return this._parent;
        this._parent = parent;
        return this;
    }

}