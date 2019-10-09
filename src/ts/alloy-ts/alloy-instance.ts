import { AlloySignature } from './alloy-signature';
import { AlloyField } from './alloy-field';

export class AlloyInstance {

    _bitwidth: number;
    _builddate: Date;
    _command: string;
    _filename: string;
    _maxseq: number;

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
    constructor (document: Document) {

        this._parseAlloyAttributes(document.querySelector('alloy'));
        this._parseInstanceAttributes(document.querySelector('instance'));

        let sigElements = Array.from(document.querySelectorAll('sig'));
        let fldElements = Array.from(document.querySelectorAll('field'));

        let sigs: Map<number, AlloySignature> = AlloySignature
            .buildSigs(this._bitwidth, this._maxseq, sigElements);

        let fields: Map<number, AlloyField> = AlloyField
            .buildFields(fldElements, sigs);

        console.log(Array.from(fields.values()).map(f => f.id()));

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
    private _parseAlloyAttributes (element: HTMLElement) {

        if (!element) throw Error('Instance does not contain Alloy info');

        let builddate = element.getAttribute('builddate');
        if (!builddate) throw Error('Instance does not contain an Alloy build date');
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
    private _parseInstanceAttributes (element: HTMLElement) {

        if (!element) throw Error('Instance does not contain attribute info');

        let bitwidth = element.getAttribute('bitwidth');
        if (!bitwidth) throw Error('Instance does not contain a bit width');
        this._setBitWidth(parseInt(bitwidth));

        let maxseq = element.getAttribute('maxseq');
        if (!maxseq) throw Error('Instance does not contain a max seq');
        this._setMaxSeq(parseInt(maxseq));

        let command = element.getAttribute('command');
        if (!command) throw Error('Instance does not contain a command');
        this._setCommand(command);

        let filename = element.getAttribute('filename');
        if (!filename) throw Error('Instance does not contain a filename');
        this._setFilename(filename);

    }

    /**
     * Set the [[_bitwidth]] attribute
     * @param bitwidth The bitwidth
     * @private
     */
    private _setBitWidth (bitwidth: number) {

        this._bitwidth = bitwidth;

    }

    /**
     * Set the [[_command]] attribute
     * @param command The command
     * @private
     */
    private _setCommand (command: string) {

        this._command = command;

    }

    /**
     * Set the [[_filename]] attribute
     * @param filename The filename
     * @private
     */
    private _setFilename (filename: string) {

        this._filename = filename;

    }

    /**
     * Set the [[_maxseq]] attribute
     * @param maxseq The max seq length
     * @private
     */
    private _setMaxSeq (maxseq: number) {

        this._maxseq = maxseq;

    }

}
