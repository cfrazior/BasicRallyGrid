Ext.define('CustomApp',
    {
        extend: 'Rally.app.App',
        componentCls: 'app',
        launch: function () {

            this.filterContainer = Ext.create('Ext.container.Container',
                {
                    title: 'OIS Scrum of Scrums',
                    layout:
                    {
                        type: 'hbox',
                        align: 'stretch'
                    }
                });

            this.add(this.filterContainer);
            this._loadIterationSelection();
        },

        // Load iteration combobox selector
        _loadIterationSelection: function () {
            this.iterationCombo = Ext.create('Rally.ui.combobox.IterationComboBox',
                {
                    width: 300,
                    fieldLabel: 'Iteration Filter:',
                    listeners: {
                        ready: function (combobox) {
                            this._loadData();
                        },
                        select: function (combobox, records) {
                            this._loadData();
                        },
                        scope: this
                    }
                });

            this.filterContainer.add(this.iterationCombo);
        },

        // Get Iteration Data From Rally
        _loadData: function () {

            var selectedIteration = this.iterationCombo.getRecord().get('Name');
            var myFilters = [{ property: 'Name', operation: '=', value: selectedIteration }];

            this.userStoryStore = Ext.create('Rally.data.wsapi.Store',
                {
                    model: 'Iteration',
                    autoLoad: true,
                    filters: myFilters,
                    listeners:
                    {
                        load: function (userStoryStore, myData, success) {
                            this._loadCustomIterationData(userStoryStore, myData);
                        },
                        scope: this
                    },
                    fetch: ['Name', 'Notes', 'Project', 'Theme']
                });
        },

        // Create array containing custom columns. This will become the data we add to our custom iteration store
        _loadCustomIterationData: function (store, data) {
            var iterations = [];
            Ext.Array.each(data, function (iteration) {

                var project = iteration.get('Project');

                var s = {
                    Name: iteration.get('Name'),
                    Notes: iteration.get('Notes'),
                    Project: project.Name,
                    Theme: iteration.get('Theme'),
                    Rank: this._getProjectSortOrderRank(project.Name),
                    Link: Rally.nav.Manager.getDetailUrl(iteration, this)
                };
                iterations.push(s);
            },
            this);
            this._createCustomIterationStore(iterations);
        },

        // Create a store that will be used to populate the Grid
        _createCustomIterationStore: function (iterations) {

            this.iterationStore = Ext.create('Rally.data.custom.Store',
                {
                    data: iterations,
                    pageSize: 100,
                    sorters: [{ property: 'Rank', direction: 'ASC' }],
                    filters: [this._createFilters()],
                    listeners: {
                        load: function (iterationStore, myData, success) {
                            this._loadDataGrid();
                        },
                        scope: this
                    }
                });
        },

        // Filter noise out of list. That is, any "Projects" not included in the SoS.
        _createFilters: function () {

            var filter = Ext.create('Rally.data.QueryFilter',
            {
                property: 'Rank',
                operator: '!=',
                value: '99'
            });

            return filter;
        },

        _loadDataGrid: function () {
            if (this.myGrid)
                this.remove(this.myGrid);

            this.myGrid = Ext.create('Rally.ui.grid.Grid',
                {
                    store: this.iterationStore,
                    columnCfgs: [
                                { text: 'Project', dataIndex: 'Project', width: 200 },
                                { text: 'Theme', dataIndex: 'Theme', width: 400, editor: 'rallytextfield' },
                                { text: 'Notes', dataIndex: 'Notes', width: 400, editor: 'rallytextfield' },
                                {
                                    text: 'Edit',
                                    dataIndex: 'Link',
                                    renderer: function (value, m, r) {
                                        var id = Ext.id();
                                        Ext.defer(function () {
                                            Ext.widget('button', {
                                                renderTo: id,
                                                text: 'Edit',
                                                width: 50,
                                                handler: function () {
                                                    window.location.href = value;
                                                }
                                            });
                                        }, 50);
                                        return Ext.String.format('<div id="{0}"></div>', id);
                                    }
                                }],
                    scope: this
                });

            this.add(this.myGrid);
        },

        // Assign a "Rank" value that we can use to sort by
        _getProjectSortOrderRank: function (projectName) {

            if (projectName === 'El Cartel Importante') {
                return 1;
            } else if (projectName === 'Medicated') {
                return 2;
            } else if (projectName === 'Deep Blue (TDC 3)') {
                return 3;
            } else if (projectName === 'D�j� vu') {
                return 4;
            } else if (projectName === 'SYSiphus') {
                return 5;
            } else {
                return 99;
            }
        },

        // Create and Show a Grid of given stories
        _loadGrid: function (store) {

            this.myGrid = Ext.create('Rally.ui.grid.Grid',
                {
                    store: store,
                    columnCfgs: ['Project', 'Notes', 'Theme']
                });

            this.add(this.myGrid);
        }
        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    });

