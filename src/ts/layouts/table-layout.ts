import { TableLayoutPreferences } from './table-layout-preferences';
import { Field, Signature } from '..';

export class TableLayout {

    _prefs: TableLayoutPreferences;

    _signatures;
    _fields;

    _is_compact: boolean;

    constructor (selection, preferences?: TableLayoutPreferences) {

        this._prefs = preferences ? preferences : new TableLayoutPreferences();

        this._signatures = selection
            .append('div')
            .attr('class', 'table-view');

        this._fields = selection
            .append('div')
            .attr('class', 'table-view');

        this._is_compact = true;

    }

    set_fields (fields: Array<Field>) {

        // Sort fields
        fields.sort((a, b) => {
            let c = b.tuples().length - a.tuples().length;
            if (c !== 0) return c;
            return b.label().toLowerCase() < a.label().toLowerCase() ? 1 : -1;
        });

        // Bind data
        let tables = this._fields
            .selectAll('table')
            .data(fields);

        // Remove old tables
        tables
            .exit()
            .remove();

        let enter = tables
            .enter()
            .append('table');

        let hdr = enter
            .append('thead');

        hdr
            .append('tr')
            .append('th')
            .attr('colspan', d => d.size())
            .text(d => d.label());

        hdr
            .append('tr')
            .selectAll('th')
            .data(d => d.types())
            .enter()
            .append('th')
            .text(d => d.label());

        enter
            .append('tbody')
            .selectAll('tr')
            .data(d => d.tuples())

    }

    set_signatures (signatures: Array<Signature>) {

        // Sort signatures
        signatures.sort((a, b) => {
            if (a.builtin() && !b.builtin()) return 1;
            if (b.builtin() && !a.builtin()) return -1;
            let c = b.atoms().length - a.atoms().length;
            if (c !== 0) return c;
            return b.label().toLowerCase() < a.label().toLowerCase() ? 1 : -1;
        });

        // Bind data
        let tables = this._signatures
            .selectAll('table')
            .data(signatures);

        // Remove old tables
        tables
            .exit()
            .remove();

        // Add new tables
        let enter = tables
            .enter()
            .append('table');

        enter
            .append('thead')
            .append('tr')
            .append('th')
            .text(d => d.label());

        enter
            .append('tbody')
            .selectAll('tr')
            .data(d => d.atoms())
            .enter()
            .append('tr')
            .append('td')
            .text(d => d);

        // Update all signatures
        this._update_signatures();
        return;

    }

    _update_signatures () {

        let bc = this._prefs.border_color,
            bcd = this._prefs.border_color_dim,
            bgc = this._prefs.background_color,
            bgcd = this._prefs.background_color_dim,
            p = this._prefs.padding_normal,
            pc = this._prefs.padding_compact,
            tc = this._prefs.text_color,
            tcd = this._prefs.text_color_dim;

        this._signatures
            .selectAll('table')
            .style('border', d => '1px solid ' + (d.builtin() ? bcd : bc))
            .style('color', d => d.builtin() ? tcd : tc);

        this._signatures
            .selectAll('th')
            .style('padding', this._is_compact ? pc : p);

        this._signatures
            .selectAll('table')
            .filter(d => !d.builtin())
            .selectAll('tbody')
            .selectAll('tr')
            .style('background-color', (d, i) => i%2 === 0 ? bgc : null);

        this._signatures
            .selectAll('table')
            .filter(d => d.builtin())
            .selectAll('tbody')
            .selectAll('tr')
            .style('background-color', (d, i) => i%2 === 0 ? bgcd : null);

        this._signatures
            .selectAll('td')
            .attr('align', 'center')
            .style('padding', this._is_compact ? pc : p);

    }
}
