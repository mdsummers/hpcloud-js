var Server = require('./server');

var URL = require('url');
var Futil = require('../futil');

// Create a new Compute instance.
exports.newFromIdentity = newFromIdentity;

// The top-level object storage object.
exports.Compute = Compute;

/**
 * Create a new Compute instance from an IdentityServices
 * Identity.
 *
 * @param {Identity} identity
 *   An identity with a service catalog.
 * @param {string} region
 *   The availability zone. e.g. 'az-1.region-a.geo-1'. If this is
 *   omitted, the first available compute will be used.
 */
function newFromIdentity(identity, region) {
  var service = identity.serviceByName('compute', region);
  var endpoint = service.publicURL;
  var comp = new Compute(identity.token(), endpoint);

  return comp;
}

/**
 * Given an authentication token and an endpoint, create a
 * Compute instance.
 *
 * @param {string} authToken
 *   An authentication token. These typically are supplied by Identity
 *   Services.
 * @param {string} endpoint
 *   An endpoint base URL.
 */
function Compute(authToken, endpoint) {
  this.token = authToken;
  this.endpoint = endpoint;
}

/**
 * Get the token.
 *
 * @return {string}
 *   The auth token.
 */
Compute.prototype.tokens = function () {
  return this.token;
}
/**
 * Get the endpoint URL.
 *
 * @param {string}
 *  The URL endpoint.
 */
Compute.prototype.url = function () {
  return this.endpoint;
}

/**
 * Get a list of servers from the remote server.
 *
 *
 * @param {int} limit (Optional)
 *   The maximum number of servers to be returned.
 * @param {String} marker (Optional)
 *   The name of the last entry received.
 * @param {Function} fn
 *   The callback. This will receive two parameters: fn(Error e, Array listOfContainers).
 */
Compute.prototype.servers = function (limit, marker, fn) {

  // Handle optional params.
  var a = Futil.argsWithFn(arguments, ['limit', 'marker', 'fn'])
  limit = a.limit;
  marker = a.marker;
  fn = a.fn;

  var url = this.url() + '/servers/detail?format=json';
  if (a.limit) {
    url += '&limit=' + encodeURIComponent(a.limit);
  }
  if (a.marker) {
    url += '&marker=' + encodeURIComponent(a.marker);
  }

  var opts = URL.parse(url);
  opts.method = 'GET';
  opts.headers = this.standardHeaders();

  var token = this.token;
  var url = this.url();

  Transport.doRequest(opts, function (error, response, data) {
    if (error) {
      fn(error);
      return;
    }

    var list = [];
    var serverArray = JSON.parse(data).servers;
    for (var i = 0; i < serverArray.length; ++i) {
      serverArray[i].endpoint = url;
      list.push(Server.newFromJSON(serverArray[i], token, url));
    }
    fn(false, list);
  });
}

/**
 * Fetch a list of flavors
 *
 * @param {Function} fn
 *   Callback to be executed. It will receive two arguments:
 *    fn(Error e, Array listOfFlavors).
 */
Compute.prototype.flavors = function (fn) {
  var opts = URL.parse(this.url() + '/flavors/detail?format=json');
  opts.method = 'GET';
  opts.headers = this.standardHeaders();

  Transport.doRequest(opts, function (error, response, data) {
    if (error) {
      fn(error);
      return;
    }

    var list = [];
    var flavorArray = JSON.parse(data).flavors;
    for (var i = 0; i < flavorArray.length; ++i) {
      list.push(flavorArray[i]);
      //list.push(Server.newFromJSON(flavorArray[i]));
    }
    fn(false, list);
  });
}

/**
 * Fetch a flavor by id.
 *
 * @param {String} id
 *   The id of the flavor
 * @param {Function} fn
 *   Callback to be executed. It will receive two arguments:
 *   fn(Error e, Object flavor).
 */
Compute.prototype.flavor = function (id, fn) {
  var opts = URL.parse(this.url() + '/flavors/' + encodeURI(id)
    + '?format=json');
  opts.method = 'GET';
  opts.headers = this.standardHeaders();

  Transport.doRequest(opts, function (error, response, data) {
    if (error) {
      fn(error);
      return;
    }

    var flavor = JSON.parse(data).flavor;
    fn(false, flavor);
  });
}

/**
 * Internal method for building standard HTTP headers.
 */
Compute.prototype.standardHeaders = function () {
  return {
    'X-Auth-Token': this.token
  };
}
