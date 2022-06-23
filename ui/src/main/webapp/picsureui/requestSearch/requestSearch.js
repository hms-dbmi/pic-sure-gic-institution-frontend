define([
  "jquery",
  "picSure/querySearch",
  "backbone",
  "handlebars",
  "text!requestSearch/requestSearch.hbs",
  "requestSearch/requestSearchResult",
], function ($, search, BB, HBS, requestSearchTemplate, requestSearchResult) {
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
    },
    reset: function () {
      this.model.clear().set(this.model.defaults);
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
      if (result.error) {
        $("#request-search-result-container").append(
          '<div class="request-search-none">No Results Found</div>'
        );
      } else {
        //clear out any old data
        var requestSearchResultView = new requestSearchResult.View({
          model: new requestSearchResult.Model(),
          queryResult: {
            queryID: this.model.get("searchTerm"),
            ...result,
          },
        });
        requestSearchResultView.render();
        $("#request-search-result-container").append(
          requestSearchResultView.$el
        );
      }
    },
    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      //   0091bac0-b978-493b-8354-2510406c9ad7
    },
  });
  return {
    View: requestSearchView,
    Model: requestSearchModel,
  };
});
