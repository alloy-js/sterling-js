import * as d3 from 'd3';
export function line() {
    let _selection, _attributes = new Map(), _styles = new Map();
    let _l = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasis);
    _attributes.set('d', _l);
    _styles
        .set('fill', 'none')
        .set('stroke', '#000')
        .set('stroke-width', 1);
    function _function(selection) {
        _selection = selection
            .selectAll('path')
            .data(d => [d.points])
            .join('path');
        _attributes
            .forEach((value, attr) => _selection.attr(attr, value));
        _styles
            .forEach((value, style) => _selection.style(style, value));
    }
    const _line = Object.assign(_function, {
        attr,
        style
    });
    return _line;
    function attr(a, v) {
        if (arguments.length === 1)
            return _attributes.get(a);
        _attributes.set(a, v);
        return _line;
    }
    function style(s, v) {
        if (arguments.length === 1)
            return _styles.get(s);
        _styles.set(s, v);
        return _line;
    }
}
export function line_() {
    let _l = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBasis);
    let _transition;
    let _lines, _stroke = '#000', _stroke_width = 1;
    function _line(selection) {
        _lines = selection
            .selectAll('path')
            .data(d => [d.points])
            .join('path')
            .attr('d', _l);
        _lines
            .style('fill', 'none')
            .style('stroke', _stroke)
            .style('stroke-width', _stroke_width);
        return _lines;
    }
    _line.stroke = function (stroke) {
        if (!arguments.length)
            return _stroke;
        _stroke = stroke;
        return _line;
    };
    _line.stroke_width = function (stroke_width) {
        if (!arguments.length)
            return _stroke_width;
        _stroke_width = stroke_width;
        return _line;
    };
    _line.transition = function (transition) {
        if (!arguments.length)
            return _transition;
        _transition = transition;
        return _line;
    };
    return _line;
}
