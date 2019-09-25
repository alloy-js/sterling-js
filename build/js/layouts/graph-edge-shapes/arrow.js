export function arrow() {
    let _selection, _attributes = new Map(), _styles = new Map();
    let _w = 3, _h = 10, _o = 2;
    _styles
        .set('stroke', 'black')
        .set('fill', 'black');
    function _function(selection) {
        _selection = selection
            .selectAll('path.arrow')
            .data(d => [d])
            .join('path')
            .attr('class', 'arrow')
            .attr('d', `M -${_h - _o} -${_w} L ${_o} 0 L -${_h - _o} ${_w} z`)
            .attr('transform', _transform);
        _attributes
            .forEach((value, attr) => _selection.attr(attr, value));
        _styles
            .forEach((value, style) => _selection.style(style, value));
    }
    const _arrow = Object.assign(_function, {
        attr,
        height,
        style,
        width
    });
    return _arrow;
    function _transform(d) {
        let points = d.points;
        if (points.length > 1) {
            let prev = points[points.length - 2];
            let edge = points[points.length - 1];
            let angle = find_angle(edge, prev);
            return `translate(${edge.x},${edge.y}) rotate(${angle})`;
        }
        return null;
    }
    function attr(a, v) {
        if (arguments.length === 1)
            return _attributes.get(a);
        _attributes.set(a, v);
        return _arrow;
    }
    function height(height) {
        if (!arguments.length)
            return _h;
        _h = +height;
        return _arrow;
    }
    function style(s, v) {
        if (arguments.length === 1)
            return _styles.get(s);
        _styles.set(s, v);
        return _arrow;
    }
    function width(width) {
        if (!arguments.length)
            return _w;
        _w = +width;
        return _arrow;
    }
}
function find_angle(p1, p2) {
    return Math.atan2(p1.y - p2.y, p1.x - p2.x) * (180 / Math.PI);
}
