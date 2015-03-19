Ext.define('CustomApp',
    {
        extend: 'Rally.app.App',
        componentCls: 'app',
        autoscroll: false,
        resizable: false,
        shrinkWrap: 3,
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

        // Get Data From Rally
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
                        load: function (userStoryStore, myData, success)
                        {
                            this._loadCustomIterationData(userStoryStore, myData);
                        },
                        scope: this
                    },
                    fetch: ['Name', 'Notes', 'Project', 'Theme']
                });
        },

        _loadCustomIterationData: function (store, data) {
            var iterations = [];
            Ext.Array.each(data, function (iteration)
            {
                var project = iteration.get('Project');
                var s = {
                    Name: iteration.get('Name'),
                    Notes: iteration.get('Notes'),
                    Project: project.Name,
                    Theme: iteration.get('Theme'),
                    Link: Rally.nav.Manager.getDetailUrl(iteration, this)
                };
                iterations.push(s);
            },this);
            this._createCustomIterationStore(iterations);
        },

        _createCustomIterationStore: function (iterations) {
            this.iterationStore = Ext.create('Rally.data.custom.Store',
                {
                    data: iterations,
                    pageSize: 100,
                    listeners: {
                        load: function (iterationStore, myData, success)
                        {
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
                    width: 1275,
                    store: this.iterationStore,
                    columnCfgs: [
                                { text: 'Sprint Goals', dataIndex: 'Theme', width: 575, editor: 'rallytextfield' },
                                { text: 'Risks/Issues', dataIndex: 'Notes', width: 575, editor: 'rallytextfield' },
                                {
                                    text: 'Edit',
                                    dataIndex: 'Link',
                                    renderer: function (value, m, r) {
                                        var id = Ext.id();
                                        Ext.defer(function () {
                                            Ext.widget('button',
                                            {
                                                renderTo: id,
                                                text: 'Edit',
                                                width: 50,
                                                handler: function ()
                                                {
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
        }
        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    });

