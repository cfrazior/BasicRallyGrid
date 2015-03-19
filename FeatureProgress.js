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
        _loadData: function() {

            var selectedRelease = this.iterationCombo.getRecord().get('Name');
            var myFilters = [{ property: 'Release', operation: '=', value: selectedRelease }];

            console.log('selectedRelease: ', selectedRelease);

            //if store exists, just load new data
            if (this.userStoryStore) {
                this.userStoryStore.setFilter(myFilters);
                this.userStoryStore.load();
            } else {
                this.userStoryStore = Ext.create('Rally.data.wsapi.Store',
                    {
                        model: 'PortfolioItem/Feature',
                        autoLoad: true,
                        //filters: myFilters,
                        listeners:
                        {
                            load: function(userStoryStore, myData, success) {
                                console.log('Got Data', userStoryStore, myData, success);
                                if (!this.myGrid) {
                                    this._loadGrid(userStoryStore);
                                }
                            },
                            scope: this
                        },
                        fetch: ['Release', 'Project', 'Owner', 'Name', 'PercentDoneByStoryPlanEstimate', 'Iteration']
                    });
            }
        },
    
        // Create and Show a Grid of given stories
        _loadGrid: function(store) {
            this.myGrid = Ext.create('Rally.ui.grid.Grid',
                {
                    store: store,
                    columnCfgs: ['Release', 'Project', 'Owner', 'Name', 'PercentDoneByStoryPlanEstimate', 'Iteration']
                });

            this.add(this.myGrid);
        }            
        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    });

