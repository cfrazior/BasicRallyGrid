Ext.define('CustomApp',
    {
        extend: 'Rally.app.App',
        componentCls: 'app',
        launch: function () {

            this.filterContainer = Ext.create('Ext.container.Container',
                {
                    layout:
                    {
                        type: 'hbox',
                        align: 'stretch'
                    }
                });

            this.add(this.filterContainer);
            this._loadReleaseSelection();            
        },
    
        // Load iteration combobox selector
        _loadReleaseSelection: function () {
            this.iterationCombo = Ext.create('Rally.ui.combobox.ReleaseComboBox',
                {
                    width: 300,
                    fieldLabel: 'PI Filter:',
                    listeners: {
                        ready: function (combobox) {
                            console.log('comboBox', combobox);
                            console.log('comboBox selected = ', combobox.getRecord().get('_ref'));
                            this._loadData();
                        },
                        select: function (combobox, records) {
                            console.log('comboBox', combobox);
                            console.log('comboBox selected = ', combobox.getRecord().get('_ref'));
                            this._loadData();
                        },
                        scope: this
                    }
                });

            this.filterContainer.add(this.iterationCombo);
        },      

        _loadCustomIterationData: function (store, data) {
            console.log('_loadCustomIterationData');
            var iterations = [];
            Ext.Array.each(data, function(iteration) {
                console.log('ITERATION: ', iteration);
                //var iteration = iteration.get()
                var parent = iteration.get('Parent');               
                var project = iteration.get('Project');

                var s  = {
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

        _createCustomIterationStore: function (iterations) {
            console.log('_createCustomIterationStore');
            //if store exists, just load new data
            this.iterationStore = Ext.create('Rally.data.custom.Store',
                {
                    data: iterations,
                    pageSize: 100,
                    sorters: [{ property: 'Rank', direction: 'ASC' }],
                    listeners: {
                        load: function (iterationStore, myData, success) {
                                this._loadDataGrid();
                        },
                        scope: this
                    }
                })            
        },

        _loadDataGrid: function () {
            if(this.myGrid)
                this.remove(this.myGrid);
            this.myGrid = Ext.create('Rally.ui.grid.Grid',
                {
                    store: this.iterationStore,
                    columnCfgs: [
                                { text: 'Project', dataIndex: 'Project', width: 200 },
                                { text: 'Theme', dataIndex: 'Theme', width: 400, editor: 'rallytextfield' },
                                { text: 'Notes', dataIndex: 'Notes', width: 400, editor: 'rallytextfield' },
                                //{ text: 'Rank', dataIndex: 'Rank' },
                                //{ text: 'Name', dataIndex: 'Name' },
                                {   text: 'Edit',
                                    dataIndex: 'Link',
                                    renderer: function (value, m, r) {
                                        var id = Ext.id();
                                        Ext.defer(function() {
                                            Ext.widget('button', {
                                                renderTo: id,
                                                text: 'Edit',
                                                width: 50,
                                                handler: function()
                                                {
                                                    window.location.href = value
                                                }
                                            });
                                        }, 50);
                                        return Ext.String.format('<div id="{0}"></div>', id);
                                    }
                                },],
                    
                    scope: this
                });

            this.add(this.myGrid);
        },

        // Get Data From Rally
        _loadData: function () {

            console.log('_loadData');

            var selectedRelease = this.iterationCombo.getRecord().get('Name');
            var myFilters = [{ property: 'Name', operation: '=', value: selectedRelease }];
        
            console.log('myFilters: ', myFilters)

            this.releaseStore = Ext.create('Rally.data.wsapi.Store',
                {
                    model: 'Release',
                    autoLoad: true,
                    filters: myFilters,
                    listeners:
                    {
                        load: function (releaseStore, myData, success) {
                            this._loadCustomIterationData(releaseStore, myData);
                            },
                        scope: this
                    },
                    fetch: ['Name', 'Notes', 'Project', 'Theme']
                });
        },

        _getUserStoryData: function() {
            var selectedRelease = this.iterationCombo.getRecord().get('Name');
            var myFilters = [{ property: 'Name', operation: '=', value: selectedRelease }];

            this.userStoryStore = Ext.create('Rally.data.wsapi.Store',
                {
                    model: 'User Story',
                    autoLoad: true,
                    filters: myFilters,
                    //listeners:
                    fetch: ['Name']
                });

        },

        _getFeatureData: function () {
            var selectedRelease = this.iterationCombo.getRecord().get('Name');
            var myFilters = [{ property: 'Name', operation: '=', value: selectedRelease }];

            this.userStoryStore = Ext.create('Rally.data.wsapi.Store',
                {
                    model: 'Feature',
                    autoLoad: true,
                    filters: myFilters,
                    //listeners:
                    fetch: ['Name']
                });

        },

        _createCustomData: function(store, data, type)
        {
            if (!this.piSummaryData)
                this.piSummaryData = [];

            if (type = 'UserStory') {
                Ext.Array.each(data, function (piData) {
                    console.log('ITERATION: ', piSummaryData);
                    //var iteration = iteration.get()
                    var parent = piData.get('Parent');
                    var project = piData.get('Project');

                    var s = {
                        StoryName: piData.get('Name'),
                        Notes: piData.get('Notes'),
                        Project: project.Name,
                        Theme: piData.get('Theme'),
                        Rank: this._getProjectSortOrderRank(project.Name),
                        Link: Rally.nav.Manager.getDetailUrl(iteration, this)
                    };
                    iterations.push(s);
                },
                this);
            }
            else if (type = 'Feature')
            {

            }

            this._createCustomIterationStore(iterations);
        },
    
        _sorterFunction: function (o1, o2) {
            console.log('_sorterFunction');

            rank1 = this._getProjectSortOrderRank(o1),
            rank2 = this._getProjectSortOrderRank(o2);

            if (rank1 === rank2) {
                return 0;
            }

            return rank1 < rank2 ? -1 : 1;
        },

        _getProjectSortOrderRank: function(projectName)
        {
            console.log('_getProjectSortOrderRank');

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
                return 9;
            } else if (projectName === 'Grafica') {
                return 10;
            } else if (projectName === 'SkyNet') {
                return 11;
            } else {
                return 13;
            }
        },

        // Create and Show a Grid of given stories
        _loadGrid: function (store) {
            console.log('_loadGrid');
            this.myGrid = Ext.create('Rally.ui.grid.Grid',
                {
                    store: store,
                    columnCfgs: ['Project', 'Notes', 'Theme']
                });

            this.add(this.myGrid);
        }
        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    });

