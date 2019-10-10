import { AlloySignature } from './alloy-signature';
import { AlloyField } from './alloy-field';
import { AlloySkolem } from './alloy-skolem';
import { AlloySource } from './alloy-source';
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
        this._parseSourceCode(Array.from(document.querySelectorAll('source')));
        let sigElements = Array.from(document.querySelectorAll('sig'));
        let fldElements = Array.from(document.querySelectorAll('field'));
        let skoElements = Array.from(document.querySelectorAll('skolem'));
        let sigs = AlloySignature
            .buildSigs(this._bitwidth, this._maxseq, sigElements);
        let fields = AlloyField
            .buildFields(fldElements, sigs);
        let skolems = AlloySkolem
            .buildSkolem(skoElements, sigs);
        AlloySignature.assignFields(Array.from(fields.values()));
        this._signatures = Array.from(sigs.values());
        this._fields = Array.from(fields.values());
        this._skolems = Array.from(skolems.values());
    }
    /**
     * Return an array of all atoms in this instance.
     */
    atoms() {
        return this.signatures()
            .filter(sig => !sig.isSubset())
            .map(sig => sig.atoms())
            .reduce((acc, cur) => acc.concat(cur), []);
    }
    /**
     * Return the bitwidth of this instance.
     */
    bidwidth() {
        return this._bitwidth;
    }
    /**
     * Return this build date of Alloy that generated this instance.
     */
    builddate() {
        return new Date(this._builddate.getTime());
    }
    /**
     * Return the command used to generate this instance.
     */
    command() {
        return this._command;
    }
    /**
     * Return an array of all fields in this instance.
     */
    fields() {
        return this._fields.slice();
    }
    /**
     * Return the full path of the file that was used to generate this instance.
     */
    filename() {
        return this._filename;
    }
    /**
     * Return the maximum sequence length.
     */
    maxseq() {
        return this._maxseq;
    }
    /**
     * Return an array of all signatures in this instance.
     */
    signatures() {
        return this._signatures.slice();
    }
    /**
     * Return an array of all skolems in this instance.
     */
    skolems() {
        return this._skolems.slice();
    }
    /**
     * Return an array of all Alloy source files that define the model from
     * which this instance was created.
     */
    sources() {
        return this._sources.slice();
    }
    /**
     * Return an array of all tuples in this instance.
     *
     * @param includeSkolem If true, skolem tuples will be included, if false,
     * they will not be included.
     */
    tuples(includeSkolem = false) {
        let skolems = includeSkolem
            ? this.skolems()
                .map(skolem => skolem.tuples())
                .reduce((acc, cur) => acc.concat(cur), [])
            : [];
        let fields = this.fields()
            .map(field => field.tuples())
            .reduce((acc, cur) => acc.concat(cur), []);
        return fields.concat(skolems);
    }
    /**
     * Returns the "univ" signature, of which all other signatures are children.
     */
    univ() {
        return this._signatures.find(s => s.name() === 'univ');
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
     * Parse the "source" XML elements, retrieving all source code used to
     * create this instance.
     *
     * @param elements The array our "source" elements
     * @private
     */
    _parseSourceCode(elements) {
        this._sources = elements.map(element => new AlloySource(element));
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
