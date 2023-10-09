define(["common/transportErrors"], function (transportErrors) {
  var handleResponse = function (response) {
    var dateObj = new Date(response.startTime);
    var result = {
      id: response.resourceResultId,
      date: formatDate(dateObj.toISOString()),
      data: response.resultMetadata.queryJson,
      metadata: JSON.parse(response.resultMetadata.queryResultMetadata),
      error: false,
    };
    return result;
  };

  var formatDate = function (isoDate) {
    var datePortion = isoDate.slice(0, 10);
    var dateParts = datePortion.split("-");
    return dateParts[1] + "/" + dateParts[2] + "/" + dateParts[0];
  };

  return {
    dictionary: function (queryID, success, error) {
      return $.ajax({
        url: window.location.origin + "/picsure/query/" + queryID + "/metadata",
        headers: {
          Authorization:
            "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
        },
        contentType: "application/json",
        type: "GET",
        success: success,
        error: error,
        dataType: "json",
      });
    },
    execute: function (queryID, done) {
      return this.dictionary(
        queryID,
        function (response) {
          var result = handleResponse(response);
          done(result);
        }.bind({
          done: done,
        }),
        function (response) {
          if (!transportErrors.handleAll(response, "error in search.query")) {
            done({
              error: true,
            });
          }
        }
      );
    },
  };
});
