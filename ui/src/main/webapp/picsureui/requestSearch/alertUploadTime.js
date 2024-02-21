define([
    "jquery", "backbone", "handlebars", "underscore",
    "text!requestSearch/alertUploadTime.hbs", "common/modal"
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
            "click #upload-data-alert-cancel-btn": "onClose",
            "click #upload-data-alert-ok-btn": "onClose",
            "click #upload-data-alert-no-remind": "dontRemindMe",
        },
        onClose: function() {
            this.handlers.onClose(this);
        },
        render: function(){
            this.$el.html(this.template(this));
            $(".modal-header").css("display", "none");
            $(".modal-footer").css("display", "none");
            $(".modal-dialog").css("margin-top", "20%");
            modal.createTabIndex(); // always do this at end
        },
        dontRemindMe: function() {
            localStorage.setItem("disable-upload-reminder", true);
        }
    });
});