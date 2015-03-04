Ext.define('CustomApp',
    {
        extend: 'Rally.app.App',
        componentCls: 'app',
        launch: function() {
            this._loadData();
        },
    
        // Get Data From Rally
        _loadData: function() {
            var myStore = Ext.create('Rally.data.wsapi.Store',
                {
                    model: 'User Story',
                    autoLoad: true,
                    listeners:
                    {
                        load: function(myStore, data, success) {
                            console.log('Got Data', myStore, data, success);
                            this._loadGrid(myStore);
                        },
                        scope: this
                    },
                    fetch: ['FormattedID', 'Owner', 'Name', 'ScheduleState']
                });
        },
    
        // Create and Show a Grid of given stories
        _loadGrid: function(store) {
            var myGrid = Ext.create('Rally.ui.grid.Grid',
                {
                    store: store,
                    columnCfgs: ['FormattedID', 'Name', 'Owner']
                });

            console.log('my grid', myGrid);
            this.add(myGrid);
        }            
        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    });

