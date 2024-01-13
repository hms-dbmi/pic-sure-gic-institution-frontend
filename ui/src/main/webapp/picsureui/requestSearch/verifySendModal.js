define([
    "jquery", "backbone", "handlebars", "underscore",
    "text!requestSearch/verifySendModal.hbs", "common/modal"
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
            "click #verify-send-modal-cancel-btn": "onClose",
            "click #verify-send-modal-send-btn": "onSend",
        },
        onClose: function() {
            this.handlers.onClose(this);
        },
        onSend: function() {
            this.handlers.onSend();
            this.handlers.onClose(this);
        },
        render: function(){
            this.$el.html(this.template(this));
            $(".modal-header").css("display", "none");
            $(".modal-footer").css("display", "none");
            $(".modal-dialog").css("margin-top", "20%");
            modal.createTabIndex(); // always do this at end
        }
    });
});