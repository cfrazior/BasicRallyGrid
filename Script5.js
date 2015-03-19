Ext.define('CustomApp',
    {
    extend: 'Rally.app.App',
    componentCls: 'app',

    //layout: 'hbox',

    //items: [
    //    {
    //        xtype: 'container',
    //        cls: 'leftSide',
    //        itemId: 'leftSide',
    //        flex: 1
    //    },
    //{
    //    xtype: 'container',
    //    cls: 'rightSide',
    //    itemId: 'rightSide',
    //    flex: 1
    //}
    //],

    launch: function () {
        this._loadReleaseSelection();
        //this.buildReleaseComboBox();
    },

        // Load iteration combobox selector
    _loadReleaseSelection: function () {
        this.iterationCombo = Ext.create('Rally.ui.combobox.ReleaseComboBox',
            {
                width: 300,
                fieldLabel: 'PI Filter:',
                listeners: {
                    ready: function (combobox) {
                        this._buildStoryTree();
                    },
                    select: function (combobox, records) {
                        this._buildStoryTree();
                    },
                    scope: this
                }
            });

        this.add(this.iterationCombo);
    },  

    _buildStoryTree: function () {

        var selectedRelease = this.iterationCombo.getRecord().get('Name');

        var tree = Ext.widget('rallytree', {

            topLevelModel: 'PortfolioItem/feature',
            topLevelStoreConfig: { property: 'Release', value: selectedRelease, operator: '='},
            //enableDragAndDrop: true,

            childModelTypeForRecordFn: function (record) {
                if (record.get('Children') && record.get('Children').length > 0) {
                    return 'PortfolioItem';
                } else if (record.get('UserStories') && record.get('UserStories').length > 0) {
                    return 'UserStory';
                }

            },
            parentAttributeForChildRecordFn: function (record) {
                if (record.get('Children') && record.get('Children').length > 0) {
                    return 'Parent';
                } else if (record.get('UserStories') && record.get('UserStories').length > 0) {
                    return 'PortfolioItem';
                }
            },
            canExpandFn: function (record) {
                return (record.get('Children') && record.get('Children').length > 0) || (record.get('UserStories') && record.get('UserStories').length > 0);
            }
            //},
            //dragThisGroupOnMeFn: function (record) {
            //    return false;
            //}

        });

        console.log('Tree = ', tree);

        this.add(tree);

    },

    buildIterationTree: function () {

        if (this.iterationTree) {
            this.iterationTree.destroy();
        }

        var selectedRelease = this.releaseCombobox.getRecord();

        this.iterationTree = Ext.widget('rallytree', {
            topLevelModel: 'Iteration',
            enableDragAndDrop: true,

            topLevelStoreConfig: {
                filters: [
                    {
                        property: 'StartDate',
                        value: selectedRelease.raw.ReleaseStartDate,
                        operator: '>='
                    },
                   {
                       property: 'EndDate',
                       value: selectedRelease.raw.ReleaseDate,
                       operator: '<='
                   }
                ],
                sorters: []
            },

            childModelTypeForRecordFn: function (record) {
                return 'UserStory';

            },
            parentAttributeForChildRecordFn: function (record) {
                return 'Iteration';
            },
            canExpandFn: function (record) {
                if (record.get('_type') === 'iteration') {
                    return true;
                }

            },
            dragThisGroupOnMeFn: function (record) {
                if (record.get('_type') === 'iteration') {
                    return 'hierarchicalrequirement';
                }
            }

        });

        this.down('#rightSide').add(this.iterationTree);
    }

});