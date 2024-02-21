define([
    "jquery", "backbone", "handlebars", "underscore",
    "text!requestSearch/dataTypesHelp.hbs", "common/modal"
], function(
    $, BB, HBS, _,
    template, modal
){
    return BB.View.extend({
        initialize : function(handlers){
            this.template = HBS.compile(template);
            this.handlers = handlers;
        },
        events: {
            "click #data-types-help-close-btn": "onClose",
        },
        onClose: function() {
            this.handlers.onClose(this);
        },
        render: function(){
            this.$el.html(this.template(this));
            modal.createTabIndex(); // always do this at end
        }
    });
});