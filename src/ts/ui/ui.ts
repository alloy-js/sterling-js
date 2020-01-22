import * as d3 from 'd3';
import { AlloyConnection } from './server/alloy-connection';
import { NavBar } from './bars/nav-bar';
import { StatusBar } from './bars/status-bar';
import { EvaluatorView } from './views/evaluator-view';
import { GraphView } from './views/graph-view';
import { TableView } from './views/table-view';
import { TreeView } from './views/tree-view';
import { SourceView } from './views/source-view';
import { Instance } from '..';

export class UI {

    _alloy: AlloyConnection;

    _nav_bar: NavBar;
    _status_bar: StatusBar;

    _eval_view: EvaluatorView;
    _graph_view: GraphView;
    _table_view: TableView;
    _tree_view: TreeView;
    _source_view: SourceView;

    constructor () {

        this._initialize_alloy_connection();

        this._nav_bar = null;
        this._status_bar = null;

        this._eval_view = null;
        this._graph_view = null;
        this._table_view = null;
        this._tree_view = null;
        this._source_view = null;

    }


    // Initializers

    connect (): UI {

        this._alloy.connect();
        return this;

    }

    eval_view (selector): UI {

        this._eval_view = new EvaluatorView(d3.select(selector));
        this._eval_view.set_alloy(this._alloy);
        return this;

    }

    graph_view (selector): UI {

        this._graph_view = new GraphView(d3.select(selector));
        return this;

    }

    nav_bar (selector): UI {

        // Initialize navbar
        this._nav_bar = new NavBar(d3.select(selector));

        // Register events
        this._nav_bar.on_eval(this.show_eval.bind(this));
        this._nav_bar.on_graph(this.show_graph.bind(this));
        this._nav_bar.on_next(this._alloy.request_next.bind(this._alloy));
        this._nav_bar.on_source(this.show_source.bind(this));
        this._nav_bar.on_table(this.show_table.bind(this));
        this._nav_bar.on_tree(this.show_tree.bind(this));

        return this;
    }

    source_view (selector): UI {

        this._source_view = new SourceView(d3.select(selector));
        return this;

    }

    status_bar (selector): UI {

        this._status_bar = new StatusBar(d3.select(selector));
        return this;
    }

    table_view (selector): UI {

        this._table_view = new TableView(d3.select(selector));
        return this;

    }

    tree_view (selector): UI {

        this._tree_view = new TreeView(d3.select(selector));
        return this;

    }


    // Public API

    set_instance (instance: Instance) {

        let sources = [];

        instance.sources().forEach((source, path) => {
            sources.push({
                path: path,
                filename: path.split('/').pop(),
                text: source
            });
        });

        if (this._status_bar) this._status_bar.set_command(instance.command());
        if (this._eval_view) this._eval_view.set_instance(instance);
        if (this._graph_view) this._graph_view.set_instance(instance);
        if (this._table_view) this._table_view.set_instance(instance);
        if (this._tree_view) this._tree_view.set_instance(instance);
        if (this._source_view) this._source_view.set_files(sources);

    }

    show_eval () {

        this._nav_bar.set_eval_active();
        if (this._eval_view) this._eval_view.show();
        if (this._graph_view) this._graph_view.hide();
        if (this._source_view) this._source_view.hide();
        if (this._table_view) this._table_view.hide();
        if (this._tree_view) this._tree_view.hide();

    }

    show_graph () {

        this._nav_bar.set_graph_active();
        if (this._eval_view) this._eval_view.hide();
        if (this._graph_view) this._graph_view.show();
        if (this._source_view) this._source_view.hide();
        if (this._table_view) this._table_view.hide();
        if (this._tree_view) this._tree_view.hide();

    }

    show_source () {

        this._nav_bar.set_source_active();
        if (this._eval_view) this._eval_view.hide();
        if (this._graph_view) this._graph_view.hide();
        if (this._source_view) this._source_view.show();
        if (this._table_view) this._table_view.hide();
        if (this._tree_view) this._tree_view.hide();

    }

    show_table () {

        this._nav_bar.set_table_active();
        if (this._eval_view) this._eval_view.hide();
        if (this._graph_view) this._graph_view.hide();
        if (this._source_view) this._source_view.hide();
        if (this._table_view) this._table_view.show();
        if (this._tree_view) this._tree_view.hide();

    }

    show_tree () {

        this._nav_bar.set_tree_active();
        if (this._eval_view) this._eval_view.hide();
        if (this._graph_view) this._graph_view.hide();
        if (this._source_view) this._source_view.hide();
        if (this._table_view) this._table_view.hide();
        if (this._tree_view) this._tree_view.show();

    }

    _initialize_alloy_connection () {

        this._alloy = new AlloyConnection();

        this._alloy.on_connected(() => {
            if (this._status_bar)
                this._status_bar.set_connection_status('Connected');
            this._alloy.request_current();
        });

        this._alloy.on_disconnected(() => {
            if (this._status_bar)
                this._status_bar.set_connection_status('Disconnected');
        });

        this._alloy.on_instance(this.set_instance.bind(this));

    }

}
