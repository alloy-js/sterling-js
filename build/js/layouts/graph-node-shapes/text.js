export function text() {
    let _texts, _font_size = 16, _text_rendering = 'geometricPrecision';
    function _text(selection) {
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
            .text(d => d.label())
            .attr('text-rendering', _text_rendering)
            .attr('text-anchor', anchor)
            .attr('x', x)
            .attr('y', y)
            .attr('dx', dx)
            .attr('dy', dy);
        _texts
            .style('font-size', _font_size + 'px');
        return _texts;
    }
    return _text;
}
function anchor(d) {
    let placement = d.label_placement;
    if (placement) {
        switch (placement) {
            case 'tl':
            case 'bl':
                return 'start';
            case 'c':
                return 'middle';
            case 'tr':
            case 'br':
                return 'end';
            default:
                return 'middle';
        }
    }
    return 'middle';
}
function x(d) {
    let placement = d.label_placement;
    let width = d.width ? d.width : 0;
    if (placement) {
        switch (placement) {
            case 'tl':
                return -width / 2;
            case 'c':
                return 0;
            default:
                return 0;
        }
    }
    return 0;
}
function y(d) {
    let placement = d.label_placement;
    let height = d.height ? d.height : 0;
    if (placement) {
        switch (placement) {
            case 'tl':
                return -height / 2;
            case 'c':
                return 0;
            default:
                return 0;
        }
    }
    return 0;
}
function dx(d) {
    let placement = d.label_placement;
    if (placement) {
        switch (placement) {
            case 'tl':
                return '1em';
            case 'c':
                return 0;
            default:
                return 0;
        }
    }
    return 0;
}
function dy(d) {
    let placement = d.label_placement;
    if (placement) {
        switch (placement) {
            case 'tl':
                return '1.62em';
            case 'c':
                return '0.31em';
            default:
                return '0.31em';
        }
    }
    return '0.31em';
}
