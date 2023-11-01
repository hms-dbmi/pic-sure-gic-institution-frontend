define([
  "backbone", "handlebars",
  "text!requestSearch/requestSearchResult.hbs",
  "common/modal", "dataset/dataset-view"
], function (
  BB, HBS,
  requestSearchResultTemplate,
  modal, viewDataset
) {
  var requestSearchResultModel = BB.Model.extend({
    defaults: {
      s3Directory: "",
      queryStartDate: "",
      queryData: {},
    },
  });
  var requestSearchResultView = BB.View.extend({
    initialize: function (opts) {
      this.template = HBS.compile(requestSearchResultTemplate);
      this.render = this.render.bind(this);
      this.onDownloadClick = this.render.bind(this);
      this.model.set("s3Directory", opts.queryResult.id);
      this.model.set("queryStartDate", opts.queryResult.date);
      this.model.set("queryId", opts.queryResult.uuid);
      this.model.set("queryData", opts.queryResult.data);
    },
    tagName: "div",
    className: "request-result-row",
    events: {
      "click .request-result-data-button": "onDownloadClick",
      "click #data-request-btn": "openDataRequestModal"
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
      link.setAttribute("download", this.model.get("s3Directory") + ".json");
      document.body.appendChild(link); // Required for FF
      link.click();
    },
    openDataRequestModal: function(){
      const onClose = (view) => {
        $(".close").click();
        $("#data-request-btn").focus();
      };
      const onDownload = () => {
        console.log('download button');
      }
      const data = this.model.get("queryData");
      data.query.uuid = this.model.get("queryId");
      modal.displayModal(
          new viewDataset(data, { onClose, onDownload }),
          "View Dataset",
          onClose,
          { width: "40%" }
      );
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
