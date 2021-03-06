Ext.define('CustomApp',
    {
        extend: 'Rally.app.App',
        componentCls: 'app',
        launch: function () {

            this.filterContainer = Ext.create('Ext.container.Container',
                {
                    title: 'Equator Scrum of Scrums',
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
                    Group: this._getProjectGroupToFilterBy(project.Name),
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
                    filters: [{ property: 'Group', operator: '=', value: '1' }],
                    sorters: [{ property: 'Rank', direction: 'ASC' }],
                    listeners: {
                        load: function (iterationStore, myData, success) {
                            this._loadDataGrid();
                        },
                        scope: this
                    }
                });
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
            if (projectName === 'Intently Remote (CPM 1)') {
                return 1;
            } else if (projectName === 'Phoenix (CPM2)') {
                return 2;
            } else if (projectName === 'Acorns') {
                return 3;
            } else if (projectName === 'Gaudi') {
                return 4;
            } else if (projectName === 'Big Al\'s') {
                return 5;
            } else if (projectName === 'Mr Sips (Imaging 1- ATL)') {
                return 6;
            } else if (projectName === 'No Land+In Sight') {
                return 7;
            } else if (projectName === '2D Frutti (Imaging 3)') {
                return 8;
            } else if (projectName === 'Dragons Layers (IFW 1)') {
                return 10;
            } else if (projectName === 'Grafica') {
                return 11;
            } else if (projectName === 'Naboo (TDC 1)') {
                return 12;
            } else if (projectName === 'Skynet') {
                return 13;
            } else {
                return 99;
            }
        },

        // Assign a "Group" value that we can use to filter by
        _getProjectGroupToFilterBy: function (projectName) {
            if (projectName === 'Intently Remote (CPM 1)') {
                return 1;
            } else if (projectName === 'Phoenix (CPM2)') {
                return 1;
            } else if (projectName === 'Acorns') {
                return 1;
            } else if (projectName === 'Gaudi') {
                return 1;
            } else if (projectName === 'Big Al\'s') {
                return 1;
            } else if (projectName === 'Mr Sips (Imaging 1- ATL)') {
                return 1;
            } else if (projectName === 'No Land+In Sight') {
                return 1;
            } else if (projectName === '2D Frutti (Imaging 3)') {
                return 1;
            } else if (projectName === 'Dragons Layers (IFW 1)') {
                return 1;
            } else if (projectName === 'Grafica') {
                return 1;
            } else if (projectName === 'Naboo (TDC 1)') {
                return 1;
            } else if (projectName === 'Skynet') {
                return 1;
            } else {
                return 2;
            }
        },

        // Filter noise out of list. That is, any "Projects" not included in the SoS.
        _createFilters: function () {

            var filter = Ext.create('Rally.data.QueryFilter',
            {
                property: 'Rank',
                operator: '==',
                value: '1'
            });

            return filter;
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

