export function text() {
    let _texts, _font_size = 16, _text_rendering = 'geometricPrecision';
    let _placement = 'c'; // Placement of the text with respect to the datum width and height
    let _fill = '#000';
    let _text = Object.assign(function (selection) {
        _texts = selection
            .selectAll('text')
            .data(d => [d]);
        _texts
            .exit()
            .remove();
        _texts = _texts
            .enter()
            .append('text')
            .merge(_texts)
            .text(d => d.data)
            .attr('text-rendering', _text_rendering)
            .attr('fill', _fill)
            .attr('x', _x)
            .attr('y', _y)
            .attr('dx', _dx)
            .attr('dy', _dy)
            .attr('text-anchor', _anchor);
        _texts
            .style('font-size', _font_size + 'px');
        return _texts;
    }, {
        fill,
        placement
    });
    function fill(fill) {
        if (!arguments.length)
            return _fill;
        _fill = fill;
        return _text;
    }
    function placement(placement) {
        if (!arguments.length)
            return _placement;
        _placement = placement;
        return _text;
    }
    function _x(d) {
        let width = d.width ? d.width : 0;
        switch (_placement) {
            case 'c':
                return 0;
            case 'bl':
            case 'tl':
                return -width / 2;
            case 'br':
            case 'tr':
                return width / 2;
            default:
                return 0;
        }
    }
    function _y(d) {
        let height = d.height ? d.height : 0;
        switch (_placement) {
            case 'c':
                return 0;
            case 'bl':
            case 'br':
                return height / 2;
            case 'tl':
            case 'tr':
                return -height / 2;
            default:
                return 0;
        }
    }
    function _dx() {
        switch (_placement) {
            case 'c':
                return 0;
            case 'bl':
            case 'tl':
                return '1em';
            case 'br':
            case 'tr':
                return '-1em';
            default:
                return 0;
        }
    }
    function _dy() {
        switch (_placement) {
            case 'c':
                return '0.31em';
            case 'bl':
            case 'br':
                return '-1em';
            case 'tl':
            case 'tr':
                return '1.62em';
            default:
                return '0.31em';
        }
    }
    function _anchor() {
        switch (_placement) {
            case 'c':
                return 'middle';
            case 'bl':
            case 'tl':
                return 'start';
            case 'br':
            case 'tr':
                return 'end';
            default:
                return 'middle';
        }
    }
    return _text;
}
