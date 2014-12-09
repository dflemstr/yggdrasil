'use strict';

/**
 * @ngdoc service
 * @name yggdrasilApp.db
 * @description
 * # db
 * Service in the yggdrasilApp.
 */
angular.module('yggdrasilApp')
  .factory('db', function (pouchdb, $http, $base64) {
    var dbname = 'yggdrasil';
    var user = 'admin';
    var password = 'abc123';
    var host = 'localhost';
    var port = 5984;

    var db = pouchdb.create(dbname);
    var remote = 'http://' + user + ':' + password + '@' + host + ':' + port;
    var remoteDb = remote + '/' + dbname + '/';

    var replicate = function () {
      var opts = {live: true};
      db.replicate.to(remoteDb, opts);
      db.replicate.from(remoteDb, opts);
    };

    var createDb = function () {
      return $http.put(remoteDb, {}, {
        headers: {
          'Authorization': 'Basic ' + $base64.encode(user + ':' + password)
        }
      });
    };

    var createIfAbsent = function () {
      return $http.get(remote + '/_all_dbs').then(function (response) {
        if (response.data.indexOf(dbname) === -1) {
          return createDb();
        }
      });
    };

    createIfAbsent().then(replicate);

    var id = 0;
    return {
      raw: db,
      add: function (title, body) {
        db.put({
          _id: 'message-' + id++,
          title: title,
          body: body
        });
      },
      save: function (newMessage) {
        db.get(newMessage._id).then(function (currentMessage) {
          if (!angular.equals(currentMessage, newMessage)) {
            db.put(newMessage);
          }
        });
      }
    };
  });
