/**
 * A server represents a vm on hp cloud.
 *
 * A server will contain a large number of fields, relating to
 * the metadata for the vm stored.
 */

module.exports = Server;

/**
 * Create a new server
 *
 * @class Server
 * @constructor
 *
 * @param {String} id The id of the Server.
 * @param {String} token An authentication token.
 * @param {String} url The URL to the compute endpoint. Used to construct
 *   an URL to the Server itself.
 * @param {Object} details Additional information about this server.  
 */
function Server(id, details, token, url) {
  this._id        = id;
  details         = details || {};
  this._token     = token;
  this._url       = url + "/servers/" + encodeURI(id);
  this._name      = details.name;
  this._status    = details.status;

  this._progress  = details.progress;
  this._imageId   = details.imageId;
  this._addresses = details.addresses || {};
  this._metadata  = details.metadata  || {};
  this._flavorId  = details.flavorId;
  this._hostId    = details.hostId;
  this._tenant_id = details.tenant_id;
  this._user_id   = details.user_id;
  this._endpoint  = details.endpoint;
  this._original  = details;

  if (! this._imageId && details.image && details.image.id) {
    this._imageId = details.image.id;
  }

  if (! this._flavorId && details.flavor && details.flavor.id) {
    this._flavorId = details.flavor.id;
  }
}

/**
 * Create a new Server from JSON data.
 *
 * This is used to create a new server object from a JSON response.
 *
 * @method newFromJSON
 * @static
 *
 * @param {Object} json JSON data in the correct format.
 * @param {String} token An authentication token.
 * @param {String} url The URL to the compute endpoint. Used to construct
 * @return {Server} A server object.
 */
Server.newFromJSON = function (json, token, url) {
  var server = new Server(json.id, json, token, url);

  return server;
};
