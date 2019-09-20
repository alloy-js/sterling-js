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
            .attr('text-anchor', 'middle')
            .attr('dy', '0.31em');
        _texts
            .style('font-size', _font_size + 'px');
        return _texts;
    }
    return _text;
}
