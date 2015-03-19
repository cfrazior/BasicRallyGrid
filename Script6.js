
    Ext.define('Rally.apps.portfoliohierarchy.PortfolioHierarchyApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.data.util.PortfolioItemHelper',
            'Rally.ui.notify.Notifier',
            'Rally.data.wsapi.Filter',
            'Rally.util.Help',
            'Rally.util.Test'
        ],

        layout: 'auto',

        items: [
            {
                xtype: 'container',
                itemId: 'header',
                cls: 'header'
            },
            {
                xtype: 'container',
                itemId: 'bodyContainer'
            }
        ],

        appName: 'Portfolio Hierarchy',

        cls: 'portfolio-hierarchy-app',

        launch: function () {

            //if (Rally.environment.getContext().getSubscription().isModuleEnabled('Rally Portfolio Manager')) {
                Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
                    typeRef: this.getSetting('type'),
                    context: this.getContext().getDataContext(),
                    defaultToLowest: false,
                    success: this.addTreeForType,
                    scope: this
                });
            //} else {
            //    this.down('#bodyContainer').add({
            //        xtype: 'container',
            //        html: '<div class="rpm-turned-off" style="padding: 50px; text-align: center;">You do not have RPM enabled for your subscription</div>'
            //    });

            //    if (Rally.BrowserTest) {
            //        Rally.BrowserTest.publishComponentReady(this);
            //    }
            //}

            this.tooltip = Ext.create('Rally.ui.tooltip.StateToolTip', {
                target: this.getEl(),
                listeners: {
                    beforeshow: function (tooltip) {
                        var triggerEl = Ext.get(tooltip.triggerElement);
                        var stateValue = triggerEl.getAttribute('state-data');
                        if (stateValue) {
                            tooltip.update(stateValue);
                        }
                    },
                    scope: this
                }
            });

            

        },

        onDestroy: function () {
            this.tooltip.destroy();
            this.callParent(arguments);
        },

        _drawHeader: function () {
            var header = this.down('#header');
            header.add(this._buildHelpComponent());
            header.add(this._buildFilterInfo());
        },

        addTreeForType: function (record) {

            this.typePath = record.get('Name');
            this._drawHeader();

            var tree = this.buildTreeForType(record);
            this.down('#bodyContainer').add(tree);

            tree.on('initialload', function () {
                if (Rally.BrowserTest) {
                    Rally.BrowserTest.publishComponentReady(this);
                }
            }, this);

        },

        buildTreeForType: function (typeRecord) {
            var me = this;

            var filters = [];
            if (this.getSetting('query')) {
                try {
                    filters.push(Rally.data.QueryFilter.fromQueryString(this.getSetting('query')));
                } catch (e) {
                    Rally.ui.notify.Notifier.showError({
                        message: e.message
                    });
                }
            }

            return Ext.create('Rally.ui.tree.PortfolioTree', {
                stateful: true,
                stateId: this.getAppId() + 'rallyportfoliotree',
                workspace: this.getContext().getWorkspace(),
                shouldRetrievePlanData: !!Rally.environment.getContext().isFeatureEnabled("ROADMAP_PLANNING_PAGE"),
                topLevelModel: typeRecord.get('TypePath'),
                topLevelStoreConfig: {
                    filters: filters,
                    context: this.getContext().getDataContext()
                },
                childItemsStoreConfigForParentRecordFn: function () {
                    return {
                        context: {
                            project: undefined,
                            workspace: me.getContext().getDataContext().workspace
                        },
                        fetch: this._getChildLevelFetchFields()
                    };
                },
                emptyText: '<p>No portfolio items of this type found.</p>' +
                           '<p>Click the gear to set your project to match the location of your portfolio items or to filter further by type.</p>'
            });
        },

        _buildHelpComponent: function () {
            return Ext.create('Ext.Component', {
                cls: Rally.util.Test.toBrowserTestCssClass('portfolio-hierarchy-help-container'),
                renderTpl: Rally.util.Help.getIcon({
                    id: 268
                })
            });
        },

        _buildFilterInfo: function () {
            return Ext.create('Rally.ui.tooltip.FilterInfo', {
                projectName: this.getSetting('project') && this.getContext().get('project').Name || 'Following Global Project Setting',
                typePath: this.typePath,
                scopeUp: this.getSetting('projectScopeUp'),
                scopeDown: this.getSetting('projectScopeDown'),
                query: this.getSetting('query')
            });
        }

    });