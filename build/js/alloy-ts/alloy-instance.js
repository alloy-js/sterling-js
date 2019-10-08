import { AlloySignature } from './alloy-signature';
export class AlloyInstance {
    /**
     * Assemble an Alloy instance from an XML document.
     *
     * @remarks
     * Extracts and parses all info from an instance that has been exported
     * from Alloy in XML format. Typically, XML files are read in Javascript
     * and the resulting document passed to this constructor as follows:
     *
     * ```javascript
     * let text = '...'; // The text read from the XML file
     * let parser = new DOMParser();
     * let doc = parser.parseFromString(text, 'application/xml');
     * let instance = new AlloyInstance(doc);
     * ```
     *
     * @param document The XML document
     */
    constructor(document) {
        this._parseAlloyAttributes(document.querySelector('alloy'));
        this._parseInstanceAttributes(document.querySelector('instance'));
        let sigElements = Array.from(document.querySelectorAll('sig'));
        AlloySignature.buildSigs(this._bitwidth, this._maxseq, sigElements);
    }
    /**
     * Parse the attributes of the "alloy" XML element
     *
     * @remarks
     * This method sets the [[_builddate]] property.
     *
     * @param element The "alloy" XML element
     * @throws Error if element is null or does not have a builddate attribute.
     * @private
     */
    _parseAlloyAttributes(element) {
        if (!element)
            throw Error('Instance does not contain Alloy info');
        let builddate = element.getAttribute('builddate');
        if (!builddate)
            throw Error('Instance does not contain an Alloy build date');
        this._builddate = new Date(Date.parse(builddate));
    }
    /**
     * Parse the attributes of the "instance" XML element
     *
     * @remarks
     * This method sets the [[_bitwidth]], [[_maxseq]], [[_command]], and
     * [[_filename]] properties.
     *
     * @param element The "instance" XML element
     * @throws Error if element is null or any of bitwidth, maxseq, command, or
     * filename attributes are not present.
     * @private
     */
    _parseInstanceAttributes(element) {
        if (!element)
            throw Error('Instance does not contain attribute info');
        let bitwidth = element.getAttribute('bitwidth');
        if (!bitwidth)
            throw Error('Instance does not contain a bit width');
        this._setBitWidth(parseInt(bitwidth));
        let maxseq = element.getAttribute('maxseq');
        if (!maxseq)
            throw Error('Instance does not contain a max seq');
        this._setMaxSeq(parseInt(maxseq));
        let command = element.getAttribute('command');
        if (!command)
            throw Error('Instance does not contain a command');
        this._setCommand(command);
        let filename = element.getAttribute('filename');
        if (!filename)
            throw Error('Instance does not contain a filename');
        this._setFilename(filename);
    }
    /**
     * Set the [[_bitwidth]] attribute
     * @param bitwidth The bitwidth
     * @private
     */
    _setBitWidth(bitwidth) {
        this._bitwidth = bitwidth;
    }
    /**
     * Set the [[_command]] attribute
     * @param command The command
     * @private
     */
    _setCommand(command) {
        this._command = command;
    }
    /**
     * Set the [[_filename]] attribute
     * @param filename The filename
     * @private
     */
    _setFilename(filename) {
        this._filename = filename;
    }
    /**
     * Set the [[_maxseq]] attribute
     * @param maxseq The max seq length
     * @private
     */
    _setMaxSeq(maxseq) {
        this._maxseq = maxseq;
    }
}
