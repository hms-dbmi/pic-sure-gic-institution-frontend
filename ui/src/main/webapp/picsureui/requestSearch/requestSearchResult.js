define([
  "backbone",
  "handlebars",
  "text!requestSearch/requestSearchResult.hbs",
], function (BB, HBS, requestSearchResultTemplate) {
  var requestSearchResultModel = BB.Model.extend({
    defaults: {
      queryID: "",
      queryStartDate: "",
      queryData: {},
    },
  });
  var requestSearchResultView = BB.View.extend({
    initialize: function (opts) {
      this.template = HBS.compile(requestSearchResultTemplate);
      this.render = this.render.bind(this);
      this.onDownloadClick = this.render.bind(this);
      this.model.set("queryID", opts.queryResult.queryID);
      this.model.set("queryStartDate", opts.queryResult.date);
      this.model.set("queryData", opts.queryResult.data);
    },
    tagName: "div",
    className: "request-search-result row",
    events: {
      "click .request-result-data-button": "onDownloadClick",
    },
    reset: function () {
      this.model.clear().set(this.model.defaults);
    },
    onDownloadClick() {
      var downloadData =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(this.model.get("queryData")));
      var link = document.createElement("a");
      link.setAttribute("href", downloadData);
      link.setAttribute("download", this.model.get("queryID") + ".json");
      document.body.appendChild(link); // Required for FF
      link.click();
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
    },
  });
  return {
    View: requestSearchResultView,
    Model: requestSearchResultModel,
  };
});
