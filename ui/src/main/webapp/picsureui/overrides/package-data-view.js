define(["jquery"], function($) {
    return {
        updateNamedDatasetObjects: function(self) {
            $("#dataset-saved", self.$el).addClass('hidden');
            $("#save-dataset-btn", self.$el).addClass('hidden');
        },
        saveDatasetId : function() {},
    };
});