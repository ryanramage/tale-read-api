var core = require('./core'),
    request = require('request'),
    xxtea = require('xxtea-xmlhttprequest')

module.exports = function(base_url) {
  var api = core(base_url)

  api.as_string = function(node, filename, key, cb){
    var file = api.find(node, filename),
        endpoint = api.resolve('file/' + file.id);

    if (key) xxtea(endpoint, key, {return_string: true}, cb)
    else request(endpoint, function(err, resp, body){
      return cb(err, body)
    })
  }

  api.as_bytes = function(node, filename, key, cb) {
    var file = api.find(node, filename),
        endpoint = api.resolve('file/' + file.id);

    if (key) xxtea(endpoint, key, {}, cb)
    else request({url: endpoint, encoding: null}, cb)
  }


  api.as_blob = function(node, filename, key, cb) {
    return cb('No blob support');
  }

  return api;

}