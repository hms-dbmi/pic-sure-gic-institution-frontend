define([
  "jquery",
  "underscore",
  "overrides/session",
  "picSure/settings",
  "common/styles",
], function ($, _, sessionOverrides, settings) {
  //Styles are loaded here (and only here) for some reason; we don't need to reference the module, just load it

  var storedSession = JSON.parse(sessionStorage.getItem("session"));

  var session = storedSession
    ? storedSession
    : {
        username: null,
        permissions: [],
        privileges: [],
        email: null,
      };

  var expired = function () {
    if (sessionStorage.session) {
      return (
        new Date().getTime() / 1000 >
        JSON.parse(atob(JSON.parse(sessionStorage.session).token.split(".")[1]))
          .exp
      );
    }
    //no session -> no token --> session has expired or does not exist.
    return true;
  };

  var handleNotAuthorizedResponse = function () {
    try {
      if (expired()) {
        history.pushState({}, "", "/psamaui/logout");
      } else {
        history.pushState({}, "", "/psamaui/not_authorized");
      }
    } catch (e) {
      console.log("Error determining token expiry");
      history.pushState({}, "", "/psamaui/not_authorized");
    }
  };

  var configureAjax = function () {
    $.ajaxSetup({
      headers: { Authorization: "Bearer " + session.token },
      statusCode: {
        401: function () {
          sessionOverrides.handleNotAuthorizedResponse
            ? sessionOverrides.handleNotAuthorizedResponse()
            : handleNotAuthorizedResponse();
        },
        403: function () {
          history.pushState({}, "", "/psamaui/not_authorized");
        },
      },
    });
  };

  var authenticated = function (
    /*userId,*/ token,
    username,
    permissions,
    acceptedTOS
  ) {
    //		session.userId = userId;
    session.token = token;
    session.username = username;
    session.permissions = permissions;
    session.acceptedTOS = acceptedTOS;
    sessionStorage.setItem("session", JSON.stringify(session));
    configureAjax();
  };

  var updatePrivileges = function (deferred) {
    var queryTemplateRequest = function () {
      return $.ajax({
        url:
          window.location.origin +
          "/psama/user/me/queryTemplate/" +
          settings.applicationIdForBaseQuery,
        type: "GET",
        headers: {
          Authorization:
            "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
        },
        contentType: "application/json",
      });
    };
    var meRequest = function () {
      return $.ajax({
        url: window.location.origin + "/psama/user/me",
        type: "GET",
        headers: {
          Authorization:
            "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
        },
        contentType: "application/json",
      });
    };
    var userRequest = function () {
      return $.ajax({
        url: window.location.origin + "/psama/user",
        type: "GET",
        headers: {
          Authorization:
            "Bearer " + JSON.parse(sessionStorage.getItem("session")).token,
        },
        contentType: "application/json",
      });
    };
    $.when(queryTemplateRequest(), meRequest(), userRequest()).then(
      function (queryTemplateResponse, meResponse, userResponse) {
        var currentSession = JSON.parse(sessionStorage.getItem("session"));
        currentSession.queryTemplate = queryTemplateResponse[0].queryTemplate;
        // Check for data admin role from users
        var meUUID = meResponse[0].uuid;
        var meUserIndex = userResponse[0].map((u) => u.uuid).indexOf(meUUID);
        var meUser = userResponse[0][meUserIndex];
        if (meUser.roles.map((r) => r.name).indexOf("Data Admin") != -1) {
          var privileges = meResponse[0].privileges;
          privileges.push("DATA_ADMIN");
          currentSession.privileges = privileges;
        } else {
          currentSession.privileges = meResponse[0].privileges;
        }
        currentSession.acceptedTOS = meResponse[0].acceptedTOS;
        currentSession.username = meResponse[0].email;

        sessionStorage.setItem("session", JSON.stringify(currentSession));

        if (
          sessionStorage.redirection_url &&
          sessionStorage.redirection_url != "undefined"
        ) {
          window.location = sessionStorage.redirection_url;
        } else {
          window.location = "/picsureui/";
        }
      },
      function (queryTemplateResponse, meResponse) {
        if (
          queryTemplateResponse[0] &&
          queryTemplateResponse[0].status !== 200
        ) {
          transportErrors.handleAll(
            queryTemplateResponse[0],
            "Cannot retrieve query template with status: " +
              queryTemplateResponse[0].status
          );
        } else {
          transportErrors.handleAll(
            meResponse[0],
            "Cannot retrieve user with status: " + meResponse[0].status
          );
        }
        if (deferred) {
          deferred.resolve();
        }
      }
    );
  };

  return {
    username: session.username,
    may: function (permission) {
      return _.contains(permission, session.permissions);
    },
    isValid: function (deferred) {
      if (session.token) {
        var isExpired = expired();
        if (!isExpired) {
          configureAjax();

          if (
            (session.privileges == undefined ||
              session.privileges.length == 0) &&
            !window.location.href.includes("/psamaui/tos")
          ) {
            updatePrivileges(deferred);
          } else {
            if (deferred) {
              deferred.resolve();
            }
          }
          return true;
        }
        return false;
      } else {
        return false;
      }
    },
    token: function () {
      return JSON.parse(sessionStorage.session).token;
    },
    setToken: function (token) {
      session.token = token;
      sessionStorage.setItem("session", JSON.stringify(session));
    },
    username: function () {
      return JSON.parse(sessionStorage.session).username;
    },
    email: function () {
      return JSON.parse(sessionStorage.session).email;
    },
    //		userId : function(){
    //			return JSON.parse(sessionStorage.session).userId;
    //		},
    // userMode : function(){
    // 	return JSON.parse(sessionStorage.session).currentUserMode;
    // },
    acceptedTOS: function () {
      return sessionStorage.session
        ? JSON.parse(sessionStorage.session).acceptedTOS
        : undefined;
    },
    privileges: function () {
      return sessionStorage.session
        ? JSON.parse(sessionStorage.session).privileges
        : undefined;
    },
    activity: _.throttle(function (activity) {
      if (typeof activity !== "string") {
        activity = window.location.href;
      }
      /**
       * /interaction end-point cannot be found. Do we still need to call it?
       */
      // $.ajax({
      // 	data: JSON.stringify({
      // 		description : activity
      // 	}),
      // 	url: "/rest/interaction",
      // 	type: 'POST',
      // 	dataType: "json",
      // 	contentType: "application/json"
      // });
    }, 10000),
    setAcceptedTOS: function () {
      session.acceptedTOS = true;
      sessionStorage.setItem("session", JSON.stringify(session));
    },
    sessionInit: function (data) {
      authenticated(
        /*data.userId,*/ data.token,
        data.email,
        data.permissions,
        data.acceptedTOS,
        this.handleNotAuthorizedResponse
      );
      if (data.acceptedTOS !== "true") {
        history.pushState({}, "", "/psamaui/tos");
      } else {
        updatePrivileges();
      }
    },
  };
});
