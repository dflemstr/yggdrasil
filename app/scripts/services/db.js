'use strict';

/**
 * @ngdoc service
 * @name yggdrasilApp.db
 * @description
 * # db
 * Service in the yggdrasilApp.
 */
angular.module('yggdrasilApp')
  .factory('db', function (pouchdb, $http, $base64, rfc4122, $q) {
    var dbname = 'yggdrasil';
    var user = 'admin';
    var password = 'abc123';
    var host = 'localhost';
    var port = 5984;

    var db = pouchdb.create(dbname);
    var remote = 'http://' + user + ':' + password + '@' + host + ':' + port;
    var remoteDb = remote + '/' + dbname + '/';

    // Make the `db` synchronize with `remoteDb`
    var replicate = function () {
      var opts = {live: true};
      db.replicate.to(remoteDb, opts);
      db.replicate.from(remoteDb, opts);
    };

    // Create the `remoteDb`; returns promise
    var createDb = function () {
      return $http.put(remoteDb, {}, {
        headers: {
          'Authorization': 'Basic ' + $base64.encode(user + ':' + password)
        }
      });
    };

    // Create the `remoteDb` if it doesn't exist; returns promise
    var createIfAbsent = function () {
      return $http.get(remote + '/_all_dbs').then(function (response) {
        if (response.data.indexOf(dbname) === -1) {
          return createDb();
        }
      });
    };

    // Creates a new random node ID
    var makeNodeId = function() {
      return 'node/' + rfc4122.v4();
    };

    // Given that a certain `doc` has changed, include or exclude it from an
    // `array`
    var sync = function (array, doc) {
      for (var i = 0; i < array.length; i++) {
        // Other version of doc is already in array
        if (array[i]._id === doc._id) {
          if (doc._deleted) {
            // doc is deleted, so it should be removed from the array
            array.splice(i, 1);
          } else {
            // doc was simply updated
            array[i] = doc;
          }
          return;
        }
      }
      if (!doc._deleted) {
        // doc was created and should be added
        array.push(doc);
      }
    };

    var syncedFilters = {};
    var syncedFilter = function (id, filter) {
      if (!syncedFilters[id]) {
        var into = [];
        db.query(function (doc, emit) {
          if (filter(doc)) {
            emit();
          }
        }, {
          include_docs: true
        }).then(function (data) {
          var docs = data.rows.map(function (r) {return r.doc;});
          Array.prototype.splice.apply(into, [0, docs.length].concat(docs));
        });

        syncedFilters[id] = {
          filter: filter,
          into: into
        };
      }

      return syncedFilters[id].into;
    };

    db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      onChange: function(data) {
        var doc = data.doc;
        console.log(data);
        Object.keys(syncedFilters).forEach(function(id) {
          var f = syncedFilters[id];
          if (f.filter(doc) || doc._deleted) {
            sync(f.into, doc);
          }
        });
      }
    });

    createIfAbsent().then(replicate);

    return {
      raw: db,
      add: function (node) {
        node._id = makeNodeId();
        db.put(node);
      },
      delete: function (node) {
        db.remove(node);
      },
      save: function (newNode) {
        db.get(newNode._id).then(function (currentNode) {
          if (!angular.equals(currentNode, newNode)) {
            db.put(newNode);
          }
        });
      },
      roots: syncedFilter('roots', function(doc) {
        return !doc.parent;
      }),
      children: function (node) {
        return syncedFilter('children-' + node._id, function(doc) {
          return doc.parent === node._id;
        });
      }
    };
  });
