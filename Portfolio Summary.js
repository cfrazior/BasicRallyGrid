Ext.define('CustomApp',
    {
        extend: 'Rally.app.App',
        componentCls: 'app',
        launch: function () {
            Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
                models: ['portfolioitem/feature'],
                autoLoad: true,
                enableHierarchy: true
            }).then({
                success: this._onStoreBuilt,
                scope: this
            });
        },

        _onStoreBuilt: function (store) {
            console.log('store: ', store);
            this.add({
                xtype: 'rallytreegrid',
                store: store,
                context: this.getContext(),
                enableEditing: true,
                shouldShowRowActionsColumn: true,
                enableBulkEdit: true,
                enableRanking: false,
                columnCfgs: [
                    'Name',
                    'Owner',
                    'PreliminaryEstimate',
                    'State',
                    {
                        text: 'SDR', dataIndex: 'SDR', renderer: function (value, m, r) {
                            var id = Ext.id();
                            Ext.defer(function () {
                                Ext.create('Ext.Container', {
                                    items: [{ xtype: 'rallypercentdone', percentDone: value }],
                                    renderTo: id
                                });
                            }, 50);
                            return Ext.String.format('<div id="{0}"></div>', id);
                        }
                    }
                ]
            });
        }
        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    });

