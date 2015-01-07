'use strict';

/**
 * @ngdoc service
 * @name yggdrasilApp.db
 * @description
 * # db
 * Service in the yggdrasilApp.
 */
angular.module('yggdrasilApp')
  .factory('db', function (pouchdb, $http, $rootScope, base64) {
    var dbname = 'yggdrasil';

    var designId = '_design/yggdrasil';
    var design = {
      _id: designId,
      views: {
        children: {
          map: (function (doc) {
            if (doc.parent) {
              emit(doc.parent, null);
            }
          }).toString()
        },
        roots: {
          map: (function (doc) {
            if (!doc.parent) {
              emit(null, null);
            }
          }).toString()
        }
      }
    };

    var db = pouchdb.create(dbname);
    var withDb = db.get(designId).then(function(data) {
      design._rev = data._rev;
      if (angular.equals(data, design)) {
        return undefined;
      } else {
        return db.put(design);
      }
    }).catch(function(err) {
      if (err.status === 404) {
        return db.put(design);
      } else {
        console.error('Could not update design doc', err);
        return undefined;
      }
    });

    var makeNodeId = function() {
      var digits = 'ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789-_';

      var id = '';
      for (var i = 0; i < 20; ++i) {
        id += digits[Math.floor(Math.random() * digits.length)];
      }

      return 'node/' + id;
    };

    var responseToCollection = function (response) {
      var result = {};
      response.rows.forEach(function (row) {
        result[row.id] = row.doc;
      });
      return result;
    };

    db.changes({
      include_docs: true,
      live: true,
      onChange: function(change) {
        if (change.id.indexOf('node/') == 0) {
          $rootScope.$broadcast('node-change', change.doc);
        }
      }
    });

    return {
      raw: db,
      add: function (doc, after, before) {
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
        doc.weight = weight;
        doc._id = makeNodeId();
        return db.put(doc);
      },
      remove: function (doc) {
        return db.remove(doc);
      },
      save: function (newDoc) {
        return db.get(newDoc._id).then(function (currentDoc) {
          if (!angular.equals(currentDoc, newDoc)) {
            return db.put(newDoc);
          }
          return undefined;
        });
      },
      updateCollection: function (coll, curr, retain) {
        if (curr._id in coll && (curr._deleted || !retain)) {
          delete coll[curr._id];
        } else if (retain) {
          coll[curr._id] = curr;
        }
      },
      byId: function (id) {
        return db.get(id);
      },
      roots: function() {
        return withDb.then(function () {
          return db.query('yggdrasil/roots', {
            include_docs: true
          }).then(responseToCollection);
        });
      },
      children: function (node) {
        return withDb.then(function () {
          return db.query('yggdrasil/children', {
            key: node._id,
            include_docs: true
          }).then(responseToCollection);
        });
      }
    };
  });

/* online mode:

    var dbname = 'yggdrasil';
    var user = 'admin';
    var password = 'abc123';
    var host = 'localhost';
    var port = 5984;

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
          'Authorization': 'Basic ' + base64.encode(user + ':' + password)
        }
      });
    };

    // Create the `remoteDb` if it doesn't exist; returns promise
    var createIfAbsent = function () {
      return $http.get(remote + '/_all_dbs').success(function (data) {
        if (data.indexOf(dbname) === -1) {
          return createDb();
        }
        return undefined;
      }).error(function (data, status) {
        if (status === 503 || status === 0) {
          console.info('Could not contact backend; running in offline mode');
        }
      });
    };

    createIfAbsent().then(replicate);
 */
