define([
  "jquery",
  "picSure/querySearch",
  "backbone",
  "handlebars",
  "text!requestSearch/requestSearch.hbs",
  "requestSearch/requestSearchResult",
  "requestSearch/dataSharingResult",
], function ($, search, BB, HBS, requestSearchTemplate, requestSearchResult, dataSharingResult) {
  var requestSearchModel = BB.Model.extend({
    defaults: {
      searchTerm: "",
    },
  });
  var requestSearchView = BB.View.extend({
    initialize: function (opts) {
      this.template = HBS.compile(requestSearchTemplate);
      this.showResult = this.showResult.bind(this);
      this.render = this.render.bind(this);
    },
    tagName: "div",
    className: "request-search-entry margin-top-ten",
    events: {
      "keyup input.request-search-box": "enterButtonEventHandler",
      "click .request-search-button": "searchButtonHandler",
      "click .request-search-clear-button": "searchClearButtonHandler",
    },
    reset: function () {
      this.model.clear().set(this.model.defaults);
    },
    searchClearButtonHandler: function (event) {
      $("input.request-search-box", this.$el).val("");
      $("#request-result-header").css("display", "none");
      $("#request-search-result-container").css("display", "none");
      $("#request-sharing-result-container").css("display", "none");
      $("#send-data-header").css("display", "none");
      $("#send-data-body").css("display", "none");
      this.model.set("searchTerm", "");
    },
    searchButtonHandler: function (event) {
      var term = $("input.request-search-box", this.$el).val();
      if (term && term.length > 0) {
        this.model.set("searchTerm", term);
        this.searchTerm(term);
      }
    },
    enterButtonEventHandler: function (event) {
      if (event.keyCode == 13) {
        var term = $("input.request-search-box", this.$el).val();
        if (term && term.length > 0) {
          this.model.set("searchTerm", term);
          this.searchTerm(term);
        }
      }
    },
    searchTerm: function (term) {
      var deferredResult = $.Deferred();
      search.execute(term, deferredResult.resolve);
      $.when(deferredResult).then(this.showResult);
    },
    showResult: function (result) {
      $("#request-search-result-container").empty();
      $("#send-data-body").empty();
      if (result.error) {
        $("#request-result-header").css("display", "none");
        $("#request-search-result-container").css("display", "none");
        $("#request-sharing-result-container").css("display", "none");
        $("#send-data-header").css("display", "none");
        $("#send-data-body").css("display", "none");
        $("#dataset-request-search-input").val("")
        $("#request-search-result-container").append(
          '<div class="request-search-none">No Results Found</div>'
        );
      } else {
        var requestSearchResultView = new requestSearchResult.View({
          model: new requestSearchResult.Model(),
          queryResult: { ...result },
        });
        var dataSharingResultView = new dataSharingResult.View({
            model: new dataSharingResult.Model(),
            queryResult: { ...result },
        });
        $("#request-result-header").css("display", "");
        $("#request-search-result-container").css("display", "");
        $("#request-sharing-result-container").css("display", "");
        $("#send-data-header").css("display", "");
        $("#send-data-body").css("display", "");
        requestSearchResultView.render();
        dataSharingResultView.render();
        $("#request-search-result-container").append(
          requestSearchResultView.$el
        );
        $("#send-data-body").append(
          dataSharingResultView.$el
        );
      }
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
    },
  });
  return {
    View: requestSearchView,
    Model: requestSearchModel,
  };
});
