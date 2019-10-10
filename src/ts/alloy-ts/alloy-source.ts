export class AlloySource {

    _filename: string;
    _source: string;

    /**
     * Create a new source by extracting the Alloy source code from an XML
     * element.
     *
     * @param element The "source" element from an Alloy XML file
     */
    constructor (element: Element) {

        this._filename = element.getAttribute('filename');
        this._source = element.getAttribute('content');

    }

    /**
     * Return the full file path this source comes from.
     */
    filename (): string {

        return this._filename;

    }

    /**
     * Return the Alloy source code.
     */
    source (): string {

        return this._source;

    }

}
