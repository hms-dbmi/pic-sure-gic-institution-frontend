define([
    'jquery',
    'requestSearch/requestSearch',
], function($, requestSearch){
    const displayDatasetRequests = function () {
        $('.header-btn.active').removeClass('active');
        $('.header-btn[data-href="/picsureui/datasetRequests"]').addClass('active');
        $('#main-content').empty();
        const requestSearchView = new requestSearch.View({
          model: new requestSearch.Model(),
        });
        requestSearchView.render();
        $('#main-content').append(requestSearchView.$el);
      }
	return {
        routes : {
            'picsureui/datasetRequests(/)': displayDatasetRequests,
        }
    };
});
