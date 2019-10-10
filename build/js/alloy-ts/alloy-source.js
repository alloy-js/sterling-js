export class AlloySource {
    /**
     * Create a new source by extracting the Alloy source code from an XML
     * element.
     *
     * @param element The "source" element from an Alloy XML file
     */
    constructor(element) {
        this._filename = element.getAttribute('filename');
        this._source = element.getAttribute('content');
    }
    /**
     * Return the full file path this source comes from.
     */
    filename() {
        return this._filename;
    }
    /**
     * Return the Alloy source code.
     */
    source() {
        return this._source;
    }
}
