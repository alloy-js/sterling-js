import { View } from './view';
import { Instance } from '../..';
import { TableLayout } from '../../layouts/table-layout';

export class TableView extends View {

    _layout: TableLayout;

    _compact_button;
    _builtin_button;
    _empty_button;

    _is_compact: boolean;
    _show_builtins: boolean;
    _show_emptys: boolean;

    constructor (selection) {

        super(selection);

        this._layout = new TableLayout(selection.select('#tables'));
        this._compact_button = selection.select('#table-compact-view');
        this._builtin_button = selection.select('#table-built-ins');
        this._empty_button = selection.select('#table-emptys');

        this._compact_button.on('click', this._on_toggle_compact.bind(this));
        this._builtin_button.on('click', this._on_toggle_builtin.bind(this));
        this._empty_button.on('click', this._on_toggle_empty.bind(this));

        this._is_compact = false;
        this._show_builtins = false;
        this._show_emptys = false;

    }

    set_instance (instance: Instance) {

        this._layout.set_signatures(instance.signatures());
        this._layout.set_fields(instance.fields());

    }

    _on_show (): void {

    }

    _on_hide (): void {

    }

    _on_toggle_compact () {

        // Toggle state
        this._is_compact = !this._is_compact;

        // Update the icon
        this._compact_button
            .select('i')
            .classed('fa-compress-arrows-alt', !this._is_compact)
            .classed('fa-expand-arrows-alt', this._is_compact);

        // Update the text
        this._compact_button
            .select('.text')
            .text(() => this._is_compact ? 'Expanded View' : 'Compact View');

    }

    _on_toggle_builtin () {

        // Toggle state
        this._show_builtins = !this._show_builtins;

        // Update the icon
        this._builtin_button
            .select('i')
            .classed('fa-eye-slash', !this._show_builtins)
            .classed('fa-eye', this._show_builtins);

        // Update text
        this._builtin_button
            .select('.text')
            .text(() => this._show_builtins ? 'Show Built-in Signatures' : 'Hide Built-in Signatures');

    }

    _on_toggle_empty () {

        // Toggle state
        this._show_emptys = !this._show_emptys;

        // Update the icon
        this._empty_button
            .select('i')
            .classed('fa-eye-slash', !this._show_emptys)
            .classed('fa-eye', this._show_emptys);

        // Update text
        this._empty_button
            .select('.text')
            .text(() => this._show_emptys ? 'Show Empty Tables' : 'Hide Empty Tables');

    }

}

