export function node_label() {
    let _selection, _attributes = new Map(), _styles = new Map();
    _attributes
        .set('dx', _dx)
        .set('dy', _dy)
        .set('text-anchor', _anchor)
        .set('text-rendering', 'geometricPrecision')
        .set('x', _x)
        .set('y', _y);
    _styles
        .set('fill', 'black')
        .set('font-size', '12px')
        .set('font-weight', 'regular')
        .set('stroke', 'none');
    let _placement = 'c';
    function _function(selection) {
        _selection = selection
            .selectAll('text')
            .data(d => [d])
            .join('text')
            .text(d => d.data);
        _attributes
            .forEach((value, attr) => _selection.attr(attr, value));
        _styles
            .forEach((value, style) => _selection.style(style, value));
        return _selection;
    }
    const _label = Object.assign(_function, {
        attr,
        style,
        placement
    });
    return _label;
    function attr(a, v) {
        if (arguments.length === 1)
            return _attributes.get(a);
        _attributes.set(a, v);
        return _label;
    }
    function style(s, v) {
        if (arguments.length === 1)
            return _styles.get(s);
        _styles.set(s, v);
        return _label;
    }
    function placement(placement) {
        if (!arguments.length)
            return _placement;
        _placement = placement;
        return _label;
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
}
