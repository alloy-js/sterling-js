interface EdgeLabelFunction {
    attr: Function,
    style: Function,
    selector: Function
}

export function edge_label (): EdgeLabelFunction {

    let _selection,
        _selector = 'text',
        _attributes = new Map(),
        _styles = new Map();

    _attributes
        .set('dy', '0.31em')
        .set('fill', 'black')
        .set('font-size', '12px')
        .set('font-weight', 'regular')
        .set('stroke', 'none')
        .set('text-anchor', 'middle')
        .set('text-rendering', 'geometricPrecision')
        .set('x', d => d.x)
        .set('y', d => d.y);

    function _function (selection) {

        _selection = selection
            .selectAll(_selector)
            .data(d => [d])
            .join('text')
            .text(d => d.label);

        _attributes
            .forEach((value, attr) => _selection.attr(attr, value));

        _styles
            .forEach((value, style) => _selection.style(style, value));

        return _selection;

    }

    const _label: EdgeLabelFunction = Object.assign(_function, {
        attr,
        style,
        selector
    });

    return _label;

    function attr (a, v?) {
        if (arguments.length === 1) return _attributes.get(a);
        _attributes.set(a, v);
        return _label;
    }

    function style (s, v?) {
        if (arguments.length === 1) return _styles.get(s);
        _styles.set(s, v);
        return _label;
    }

    function selector (s?) {
        if (!arguments.length) return _selector;
        _selector = s;
        return _label;
    }

}
