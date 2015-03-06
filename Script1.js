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
            this._loadIterationSelection();            
        },

        // Load iteration combobox selector
        _loadIterationSelection: function() {
            this.iterationCombo = Ext.create('Rally.ui.combobox.IterationComboBox',
                {
                    width: 300,
                    fieldLabel: 'Iteration Filter:',
                    listeners: {
                        ready: function (combobox) {
                            this._loadReport();
                        },
                        select: function (combobox, records) {
                            this._loadReport();
                        },
                        scope: this
                    }
                });

            this.filterContainer.add(this.iterationCombo);
        },      

        _loadReport: function()
        {
            var selectedIteration = this.iterationCombo.getRecord().get('_ref');

            // If the filter has changed, remove the current Report so we can replace it with the new filter
            if (this.burndownChart)
                this.remove(this.burndownChart);

            // Generate burndown chart for the selected iteration
            this.burndownChart = Ext.create('Rally.ui.report.StandardReport',
                {
                    project: Rally.util.Ref.getRelativeUri(this.getContext().getProject()),
                    projectScopeUp: this.getContext().getProjectScopeUp(),
                    projectScopeDown: this.getContext().getProjectScopeDown(),
                    width: 800,
                    height: 600,
                    reportConfig: {
                        report: Rally.ui.report.StandardReport.Reports.IterationBurndown,
                        iterations: [selectedIteration]
                    },
                    scope: this
                });

            // Add the burndown chart to the App container
            this.add(this.burndownChart);
        }
    });
        //API Docs: https://help.rallydev.com/apps/2.0/doc/



