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

        // Get User Story Data From Rally
        _loadData: function () {

            this.iterations = [];
            this.userStoryStore = Ext.create('Rally.data.wsapi.Store',
                {
                    model: 'User Story',
                    autoLoad: true,
                    sorters: [{ property: 'Iteration', direction: 'ASC' }],
                    listeners:
                    {
                        load: function (userStoryStore, myData, success)
                        {
                            this._sumData(userStoryStore, myData);                                
                        },
                        scope: this
                    },
                    limit: Infinity,
                    fetch: ['FormattedID', 'Owner', 'Name', 'ScheduleState', 'Iteration', 'PlanEstimate', 'AcceptedDate', 'Release']
                });
        },

        // Get Defect Data from Rally
        _loadDefectData: function() {
            this.defectIterations = [];
            this.userStoryStore = Ext.create('Rally.data.wsapi.Store',
                {
                    model: 'Defect',
                    autoLoad: true,
                    sorters: [{ property: 'Iteration', direction: 'ASC' }],
                    listeners:
                    {
                        load: function (userStoryStore, myData, success) {
                            this._sumDefectData(userStoryStore, myData);
                        },
                        scope: this
                    },
                    limit: Infinity,
                    fetch: ['FormattedID', 'Owner', 'Name', 'ScheduleState', 'Iteration', 'PlanEstimate', 'AcceptedDate', 'Release']
                });
        },

        // Determine the number of Planned and Accepted Story Points for all User Stories in each Iteration
        _sumData: function (store, data) {
            var totalPoints = 0;
            var acceptedPoints = 0;
            var iteration;
            var selectedRelease = this.iterationCombo.getRecord().get('Name');

            // Loop through stories sorted by iteration
            Ext.Array.each(data, function (story)
            {             
                if (story.get('Iteration'))
                {
                    // Save off the current Iteration
                    var it = story.get('Iteration');
                    
                    // Check if an iteration was assigned to the story. If not, skip it.
                    var result = this._matchIterationWithRelease(selectedRelease, it.Name);
                    if (result) {
                        // If the iteration is undefined that means it's the first time through.
                        if (!iteration)
                        {
                            iteration = it.Name;
                            totalPoints = totalPoints + story.get('PlanEstimate');
                            if (story.get('AcceptedDate'))
                            {
                                acceptedPoints = acceptedPoints + story.get('PlanEstimate');
                            }
                        }
                        // if the iteration is the same as the last time through keep adding up
                        else if (iteration)
                        {
                            if (iteration == it.Name) {
                                totalPoints = totalPoints + story.get('PlanEstimate');
                                if (story.get('AcceptedDate'))
                                {
                                    acceptedPoints = acceptedPoints + story.get('PlanEstimate');
                                }
                            }
                            // if the iteration is different. Save off the last values we had in the array
                            // then clear all counters
                            // then add up values
                            else {
                                summary = {
                                    Iteration: iteration,
                                    PlanEstimate: totalPoints,
                                    AcceptedPoints: acceptedPoints,
                                    SDR: acceptedPoints / totalPoints
                                };
                                this.iterations.push(summary);

                                totalPoints = 0;
                                acceptedPoints = 0;
                                iteration = it.Name;
                                totalPoints = totalPoints + story.get('PlanEstimate');
                                if (story.get('AcceptedDate'))
                                {
                                    acceptedPoints = acceptedPoints + story.get('PlanEstimate');
                                }
                            }
                        }
                    } 
                } 
            }, this);

            // Last Time out ... record the last sprint in the iteration
            summary = {
                Iteration: iteration,
                PlanEstimate: totalPoints,
                AcceptedPoints: acceptedPoints,
                SDR: acceptedPoints / totalPoints
            };
            this.iterations.push(summary);

            this._loadDefectData();
        },
        
        // Determine the number of Planned and Accepted Points for all Defects in each Iteration
        _sumDefectData: function (store, data) {
            var totalPoints = 0;
            var acceptedPoints = 0;
            var iteration;
            var selectedRelease = this.iterationCombo.getRecord().get('Name');

            // Loop through stories sorted by iteration
            Ext.Array.each(data, function (story) {
                if (story.get('Iteration')) {
                    // Save off the current Iteration
                    var it = story.get('Iteration');

                    // Check if an iteration was assigned to the story. If not, skip it.
                    var result = this._matchIterationWithRelease(selectedRelease, it.Name);
                    if (result) {
                        // If the iteration is undefined that means it's the first time through.
                        if (!iteration) {
                            iteration = it.Name;
                            totalPoints = totalPoints + story.get('PlanEstimate');
                            if (story.get('AcceptedDate')) {
                                acceptedPoints = acceptedPoints + story.get('PlanEstimate');
                            }
                        }
                            // if the iteration is the same as the last time through keep adding up
                        else if (iteration) {
                            if (iteration == it.Name) {
                                totalPoints = totalPoints + story.get('PlanEstimate');
                                if (story.get('AcceptedDate')) {
                                    acceptedPoints = acceptedPoints + story.get('PlanEstimate');
                                }
                            }
                                // if the iteration is different. Save off the last values we had in the array
                                // then clear all counters
                                // then add up values
                            else {
                                summary = {
                                    Iteration: iteration,
                                    PlanEstimate: totalPoints,
                                    AcceptedPoints: acceptedPoints,
                                    SDR: acceptedPoints / totalPoints
                                };
                                this.defectIterations.push(summary);

                                totalPoints = 0;
                                acceptedPoints = 0;
                                iteration = it.Name;
                                totalPoints = totalPoints + story.get('PlanEstimate');
                                if (story.get('AcceptedDate')) {
                                    acceptedPoints = acceptedPoints + story.get('PlanEstimate');
                                }
                            }
                        }
                    }
                }
            }, this);

            // Last Time out ... record the last sprint in the iteration
            summary = {
                Iteration: iteration,
                PlanEstimate: totalPoints,
                AcceptedPoints: acceptedPoints,
                SDR: acceptedPoints / totalPoints
            };            
            this.defectIterations.push(summary);
            this._reconcileIterationArrays();          
        },
        
        // Merge User Story points and Defect points for each iteration to get a total count
        _reconcileIterationArrays: function () {
            this.displayValues = [];
            var iterationsLen = this.iterations.length - 1;
            var defectIterationsLen = this.defectIterations.length - 1;
            var noDefectsInIteration = true;
            
            // Loop through collection of user stories in each iteration
            for (var i = 0; i <= iterationsLen; i++) {
                var currentIteration = this.iterations[i].Iteration;
                // For each iteration, loop through all defects 
                for (var x = 0; x <= defectIterationsLen; x++)
                {
                    // if the defect iteration matches the current iteration
                    if (this.defectIterations[x].Iteration == currentIteration)
                    {
                        noDefectsInIteration = false;
                        this.iterations[i].PlanEstimate = this.iterations[i].PlanEstimate + this.defectIterations[x].PlanEstimate;
                        this.iterations[i].AcceptedPoints = this.iterations[i].AcceptedPoints + this.defectIterations[x].AcceptedPoints;
                        summary = {
                            Iteration: this.iterations[i].Iteration,
                            PlanEstimate: this.iterations[i].PlanEstimate,
                            AcceptedPoints: this.iterations[i].AcceptedPoints,
                            SDR: this.iterations[i].SDR
                        };
                        
                        this.displayValues.push(summary);
                        break;
                    } 
                }
                if (noDefectsInIteration)
                {
                        summary = {
                            Iteration: this.iterations[i].Iteration,
                            PlanEstimate: this.iterations[i].PlanEstimate,
                            AcceptedPoints: this.iterations[i].AcceptedPoints,
                            SDR: this.iterations[i].SDR
                        };
                this.displayValues.push(summary);
                }
                noDefectsInIteration = true;
            }
            this._createCustomIterationStore();
        },

        // Create a custom store to hold our custom data set
        _createCustomIterationStore: function () {
            this.iterationStore = Ext.create('Rally.data.custom.Store',
                {
                    data: this.displayValues,
                    pageSize: 100,
                    listeners: {
                        load: function(iterationStore, myData, success) {
                            this._loadGrid(iterationStore);
                        },
                        scope: this
                    },
                    scope: this
                });
        },

        // Create and Show a Grid of given stories
        // Use the RallyPercentDone control to show color coded progress bar
        _loadGrid: function (store) {
            
            // Remove Grid before replacing it with updated version based on filter selection 
            this.remove(this.myGrid);

            this.myGrid = Ext.create('Rally.ui.grid.Grid',
                {
                    height: 250,
                    store: store,
                    columnCfgs: [
                        { text: 'Iteration', dataIndex: 'Iteration' },
                        { text: 'Estimate', dataIndex: 'PlanEstimate' },
                        { text: 'Actual', dataIndex: 'AcceptedPoints' },
                        {
                            text: 'SDR', dataIndex: 'SDR', renderer: function (value, m, r) {
                                var id = Ext.id();                                
                                Ext.defer(function () {
                                    Ext.create('Ext.Container', { items: [{ xtype: 'rallypercentdone', percentDone: value }],
                                        renderTo:id                                       
                                    });
                                }, 50);
                                return Ext.String.format('<div id="{0}"></div>', id);
                            }
                        }
                    ],
                    scope: this,
                    resizable: true
                });

            // Add Grid to the APP container
            this.add(this.myGrid);
        },

        // Since Release gets cleared if a story isn't completed we need to filter based on Iteration ... even though we want to use a "Release" filter.
        // By matching up Iterations to their Releases we'll be able to accomplish this.
        // NOTE: Should see if there is a better way to do this so it's automatically extensible.
        _matchIterationWithRelease: function (release, iteration) {

            if (release.indexOf('EQ') != -1)
            {
                if (iteration.indexOf('EQ') == -1)
                    return false;
                else
                {
                    if (release.indexOf('1') != -1) {
                        if (iteration.indexOf('1.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('2') != -1) {
                        if (iteration.indexOf('2.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('3') != -1) {
                        if (iteration.indexOf('3.') != -1) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    else if (release.indexOf('4') != -1) {
                        if (iteration.indexOf('4.') != -1) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }
            else if (release.indexOf('OIS') != -1)
            {
                if (iteration.indexOf('OIS') == -1)
                    return false;
                else
                {
                    if (release.indexOf('1') != -1) {
                        if (iteration.indexOf('1.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('2') != -1) {
                        if (iteration.indexOf('2.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('3') != -1) {
                        if (iteration.indexOf('3.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('4') != -1) {
                        if (iteration.indexOf('4.') != -1)
                            return true;
                        else
                            return false;
                    }
                }
            }
            else if (release.indexOf('KM') != -1)
            {
                if (iteration.indexOf('KM') == -1)
                    return false;
                else
                {
                    if (release.indexOf('1') != -1) {
                        if (iteration.indexOf('1.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('2') != -1) {
                        if (iteration.indexOf('2.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('3') != -1) {
                        if (iteration.indexOf('3.') != -1)
                            return true;
                        else
                            return false;
                    }
                    else if (release.indexOf('4') != -1) {
                        if (iteration.indexOf('4.') != -1)
                            return true;
                        else
                            return false;
                    }
                }
            }
            return false;
        }
        
        //API Docs: https://help.rallydev.com/apps/2.0/doc/
    });

