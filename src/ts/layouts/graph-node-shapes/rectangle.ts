export function rectangle () {

    let _rectangles,
        _width = 150,
        _height = 50,
        _stroke = '#000',
        _stroke_width = 1,
        _fill = '#fff',
        _shape_rendering = 'geometricPrecision';

    function _rectangle (selection) {

        _rectangles = selection
            .selectAll('rect')
            .data(d => [d]);

        _rectangles
            .exit()
            .remove();

        _rectangles = _rectangles
            .enter()
            .append('rect')
            .merge(_rectangles);

        _rectangles
            .attr('x', d => d.width ? -d.width/2 : -_width/2)
            .attr('y', d => d.height ? -d.height/2 : -_height/2)
            .attr('width', d => d.width ? d.width : _width)
            .attr('height', d => d.height ? d.height : _height)
            .attr('shape-rendering', _shape_rendering);

        _rectangles
            .style('stroke', _stroke)
            .style('stroke-width', _stroke_width)
            .style('fill', _fill);

        return _rectangles;

    }

    _rectangle.height = function (height) {
        if (!arguments.length) return _height;
        _height = +height;
        return _rectangle;
    };

    _rectangle.width = function (width) {
        if (!arguments.length) return _width;
        _width = +width;
        return _rectangle;
    };

    return _rectangle;

}
