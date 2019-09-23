export class Edge {

    _datum: any = null;
    _label: string = '';
    _source: any = null;
    _target: any = null;

    datum (datum?) {
        if (!arguments.length) return this._datum;
        this._datum = datum;
        return this;
    }

    label (label?) {
        if (!arguments.length) return this._label;
        this._label = label;
        return this;
    }

    source (source?) {
        if (!arguments.length) return this._source;
        this._source = source;
        return this;
    }

    target (target?) {
        if (!arguments.length) return this._target;
        this._target = target;
        return this;
    }

}
