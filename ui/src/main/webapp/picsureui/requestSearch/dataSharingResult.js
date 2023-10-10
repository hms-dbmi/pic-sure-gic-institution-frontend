define([
  "backbone",
  "handlebars",
  "text!requestSearch/dataSharingResult.hbs",
], function (BB, HBS, dataSharingResultTemplate) {
  var dataSharingResultModel = BB.Model.extend({
    defaults: {
      site: "",
      sharingStatus: "",
    },
  });
  var dataSharingResultView = BB.View.extend({
    initialize: function (opts) {
      this.template = HBS.compile(dataSharingResultTemplate);
      this.render = this.render.bind(this);
      this.model.set("site", opts.queryResult.metadata.site);
      this.model.set("sharingStatus", opts.queryResult.metadata.sharingStatus);
    },
    tagName: "div",
    className: "request-result-row",
    reset: function () {
      this.model.clear().set(this.model.defaults);
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
    },
  });
  return {
    View: dataSharingResultView,
    Model: dataSharingResultModel,
  };
});