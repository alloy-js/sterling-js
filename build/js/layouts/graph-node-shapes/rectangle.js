export function rectangle() {
    let _selection, _attributes = new Map(), _styles = new Map();
    _attributes
        .set('height', d => d.height ? d.height : 50)
        .set('shape-rendering', 'geometricPrecision')
        .set('width', d => d.width ? d.width : 150)
        .set('x', d => d.width ? -d.width / 2 : 75)
        .set('y', d => d.height ? -d.height / 2 : 25);
    _styles
        .set('stroke', '#000')
        .set('fill', '#fff');
    function _function(selection) {
        _selection = selection
            .selectAll('rect')
            .data(d => [d])
            .join('rect');
        _attributes
            .forEach((value, attr) => _selection.attr(attr, value));
        _styles
            .forEach((value, style) => _selection.style(style, value));
        return _selection;
    }
    const _rectangle = Object.assign(_function, {
        attr,
        style
    });
    return _rectangle;
    function attr(a, v) {
        if (arguments.length === 1)
            return _attributes.get(a);
        _attributes.set(a, v);
        return _rectangle;
    }
    function style(s, v) {
        if (arguments.length === 1)
            return _styles.get(s);
        _styles.set(s, v);
        return _rectangle;
    }
}
