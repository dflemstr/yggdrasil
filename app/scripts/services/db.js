'use strict';

/**
 * @ngdoc service
 * @name yggdrasilApp.db
 * @description
 * # db
 * Service in the yggdrasilApp.
 */
angular.module('yggdrasilApp')
  .factory('db', function (pouchdb, $http, base64) {
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
      var onChange = function (info) {
        console.log('change', info);
      };
      var onComplete = function (info) {
        console.log('complete', info);
      };
      var onUpToDate = function (info) {
        console.log('upToDate', info);
      };
      var onError = function (err) {
        console.log('error', err);
      };

      db.replicate.to(remoteDb, opts)
        .on('change', onChange)
        .on('complete', onComplete)
        .on('uptodate', onUpToDate)
        .on('error', onError);

      db.replicate.from(remoteDb, opts)
        .on('change', onChange)
        .on('complete', onComplete)
        .on('uptodate', onUpToDate)
        .on('error', onError);;
    };

    // Create the `remoteDb`; returns promise
    var createDb = function () {
      return $http.put(remoteDb, {}, {
        headers: {
          'Authorization': 'Basic ' + base64.encode(user + ':' + password)
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
      var digits = 'ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789-_';

      var id = '';
      for (var i = 0; i < 20; ++i) {
        id += digits[Math.floor(Math.random() * digits.length)];
      }

      return 'node/' + id;
    };

    var syncedFilters = {};
    var syncedFilter = function (id, filter) {
      if (!syncedFilters[id]) {
        var collection = {};

        db.query(function (doc, emit) {
          if (filter(doc)) {
            emit(doc.weight);
          }
        }, {
          include_docs: true
        }).then(function (data) {
          data.rows.forEach(function(row) {
            var doc = row.doc;
            collection[doc._id] = doc;
          });
        });

        syncedFilters[id] = {
          filter: filter,
          collection: collection
        };
      }

      return syncedFilters[id].collection;
    };

    db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      onChange: function(data) {
        var doc = data.doc;
        console.log('database entry changed: ', data);
        Object.keys(syncedFilters).forEach(function(id) {
          var f = syncedFilters[id];
          if (f.filter(doc) && !doc._deleted) {
            f.collection[doc._id] = doc;
          } else {
            delete f.collection[doc._id];
          }
        });
      }
    });

    createIfAbsent().then(replicate);

    return {
      raw: db,
      add: function (node, after, before) {
        var weight;
        if (after && before) {
          weight = (after.weight + before.weight) / 2;
        } else if (after && !before) {
          weight = (after.weight + 1) / 2;
        } else if (!after && before) {
          weight = before.weight / 2;
        } else {
          weight = 0.5;
        }
        node.weight = weight;
        node._id = makeNodeId();
        return db.put(node);
      },
      remove: function (node) {
        return db.remove(node);
      },
      save: function (newNode) {
        return db.get(newNode._id).then(function (currentNode) {
          if (!angular.equals(currentNode, newNode)) {
            db.put(newNode);
          }
        });
      },
      byId: function (id) {
        return syncedFilter('id-' + id, function (doc) {
          return doc._id === id;
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
