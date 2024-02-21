define([
  "backbone", "handlebars",
  "text!requestSearch/requestSearchResult.hbs",
  "common/modal", "dataset/dataset-view", "requestSearch/dataStoreLocationHelp", "requestSearch/verifySendModal",
  "requestSearch/alertUploadTime", "requestSearch/dataTypesHelp",
], function (
  BB, HBS,
  requestSearchResultTemplate,
  modal, viewDataset, viewHelp, confirmUpload,
  alertUploadTime, dataTypesHelp
) {
  var statusIconMapping = {
    'Uploaded': 'fa-circle-check',
    'Querying': 'fa-magnifying-glass',
    'Queued': 'fa-hourglass',
    'Unsent': 'fa-circle-xmark',
    'Unknown': 'fa-circle-question',
    'Error': 'fa-circle-xmark',
    'Uploading': 'fa-paper-plane'
  };
  var requestSearchResultModel = BB.Model.extend({
    defaults: {
      s3Directory: "",
      queryStartDate: "",
      queryData: {},
      approved: "",
      sites: [],
      homeSite: {
        site: "",
        display: "",
      },
      requesterEmail: "Unknown",
      sendGenoData: false,
      sendPhenoData: false,
    },
  });
  var requestSearchResultView = BB.View.extend({
    initialize: function (opts) {
      this.template = HBS.compile(requestSearchResultTemplate);
      this.render = this.render.bind(this);
      this.approveQueryForUpload = this.approveQueryForUpload.bind(this);
      this.fetchQueryStatus = this.fetchQueryStatus.bind(this);
      this.populateQueryStatus = this.populateQueryStatus.bind(this);
      this.populateSites = this.populateSites.bind(this);
      this.setSite = this.setSite.bind(this);
      this.uploadData = this.uploadData.bind(this);
      this.openVerifySend = this.openVerifySend.bind(this);
      this.onDownloadClick = this.onDownloadClick.bind(this);
      this.displayAlertThenPopulateStatus = this.displayAlertThenPopulateStatus.bind(this);
      this.toggleGeno = this.toggleGeno.bind(this);
      this.togglePheno = this.togglePheno.bind(this);
      this.model.set("s3Directory", opts.queryResult.id);
      this.model.set("queryStartDate", opts.queryResult.date);
      this.model.set("queryId", opts.queryResult.uuid);
      this.model.set("queryData", opts.queryResult.data);
      this.model.set("commonAreaID", opts.queryResult.data.commonAreaUUID);
      this.model.set("requesterEmail", opts.queryResult.data.requesterEmail);
      this.fetchQueryStatus();
    },
    tagName: "div",
    className: "request-result-row",
    events: {
      "click .request-result-data-button": "onDownloadClick",
      "click #data-request-btn": "openDataRequestModal",
      "click #data-store-help-button": "openDataStoreHelp",
      "click #data-types-help-button": "openDataTypesHelp",
      "click #upload-data-button": "openVerifySend",
      "click #refresh-status-btn": "fetchQueryStatus",
      "click #pheno_check": "togglePheno",
      "click #geno_check": "toggleGeno",
      "input #query-approved": "approveQueryForUpload",
      "change #site-select": "setSite"
    },
    reset: function () {
      this.model.clear().set(this.model.defaults);
    },
    togglePheno() {
        this.model.set('sendPhenoData', !this.model.get('sendPhenoData'))
    },
    toggleGeno() {
        this.model.set('sendGenoData', !this.model.get('sendGenoData'))
    },
    fetchQueryStatus() {
        var queryID = this.model.get("commonAreaID");
        if (!queryID) {
            // support queries not made in common area
            queryID = this.model.get("queryId");
        }
        var populateQueryStatus = this.populateQueryStatus;
        var populateSites = this.populateSites;
        $.ajax({
            url: window.location.origin + "/picsure/proxy/uploader/status/" + queryID,
            headers: {
              Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
            },
            contentType: "application/json",
            type: "GET",
            success: populateQueryStatus,
            dataType: "json",
        });
        $.ajax({
            url: window.location.origin + "/picsure/proxy/uploader/sites",
            headers: {
              Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
            },
            contentType: "application/json",
            type: "GET",
            success: populateSites,
            dataType: "json",
        });
    },
    setSite(event) {
        this.model.set("selectedSite", event.target.value);
    },
    populateSites(response) {
        this.model.set("sites", response.sites);
        this.model.set("selectedSite", response.homeSite);
        this.model.set("homeSite", { site: response.homeSite, display: response.homeDisplay });
        this.render();
    },
    displayAlertThenPopulateStatus(response) {
        if (localStorage.getItem("disable-upload-reminder") === 'true') {
            this.populateQueryStatus(response);
        } else {
            const populateQueryStatus = this.populateQueryStatus;
            const onClose = (view) => {
              $(".close").click();
              $("#data-request-btn").focus();
              populateQueryStatus(response);
            };
            modal.displayModal(
              new alertUploadTime({ onClose }),
              "",
              onClose,
              { width: "19%" }
            );
        }
    },
    populateQueryStatus(response) {
        this.model.set("approved", response.approved);
        this.model.set("site", response.site);
        this.model.set("genomicStatus", response.genomic);
        this.model.set("genomicStatusIcon", statusIconMapping[response.genomic]);
        this.model.set("phenotypicStatus", response.phenotypic);
        this.model.set("phenotypicStatusIcon", statusIconMapping[response.phenotypic]);

        this.render();
    },
    uploadData(dataType) {
        var query = this.model.get("queryData").query;
        query.picSureId = this.model.get("commonAreaID");
        if (!query.picSureId) {
            // support queries not made in common area
            query.picSureId = this.model.get("queryId");
        }
        var site = this.model.get("selectedSite");
        var displayAlertThenPopulateStatus = this.displayAlertThenPopulateStatus;
        $.ajax({
            url: window.location.origin + "/picsure/proxy/uploader/upload/" + site + "?dataType=" + dataType,
            headers: {
              Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
            },
            data: JSON.stringify(query),
            contentType: "application/json",
            type: "POST",
            success: displayAlertThenPopulateStatus,
            dataType: "json",
        });
    },
    approveQueryForUpload(event) {
        var date = event.target.value;
        this.model.set("approved", date);
        var queryID = this.model.get("commonAreaID");
        if (!queryID) {
            // support queries not made in common area
            queryID = this.model.get("queryId");
        }
        var populateQueryStatus = this.populateQueryStatus;
        $.ajax({
            url: window.location.origin + "/picsure/proxy/uploader/status/" + queryID + "/approve?date=" + date,
            headers: {
              Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
            },
            contentType: "application/json",
            type: "GET",
            success: populateQueryStatus,
            dataType: "json",
        });
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
      const data = this.model.get("queryData");
      data.query.uuid = this.model.get("queryId");
      modal.displayModal(
          new viewDataset(data, {
            onClose,
            onDownload: undefined // add a method here to get the download button to auto populate in the dataset view modal
          }),
          "View Dataset",
          onClose,
          { width: "40%" }
      );
    },
    openDataStoreHelp: function(){
      const onClose = (view) => {
        $(".close").click();
        $("#data-request-btn").focus();
      };

      modal.displayModal(
          new viewHelp({ onClose }),
          "Data Storage Location",
          onClose,
          { width: "50%" }
      );
    },
    openDataTypesHelp: function(){
      const onClose = (view) => {
        $(".close").click();
        $("#data-request-btn").focus();
      };

      modal.displayModal(
          new dataTypesHelp({ onClose }),
          "Data Types",
          onClose,
          { width: "50%" }
      );
    },
    openVerifySend: function(){
      const onClose = (view) => {
        $(".close").click();
        $("#data-request-btn").focus();
      };
      const upload = this.uploadData;
      const data = {
        datasetUUID: this.model.get("queryId"),
        commonAreaID: this.model.get("commonAreaID"),
        site: this.model.get("site"),
        sendPhenoData: this.model.get('sendPhenoData'),
        sendGenoData: this.model.get('sendGenoData'),
      };
      const onSend = function () {
        if (data.sendGenoData) {
          upload("Genomic");
        }
        if (data.sendPhenoData) {
          upload("Phenotypic");
        }
      };

      modal.displayModal(
          new confirmUpload({ onClose, onSend }, data),
          "",
          onClose,
          { width: "19%" }
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
