var core = require('./core'),
    xhr = require('binary-xhr'),
    xxtea = require('xxtea-xmlhttprequest'),
    buildDataURL = (function() {
      var charMap, i, _i;

      charMap = {};
      for (i = _i = 0; _i < 256; i = ++_i) {
        charMap[i] = String.fromCharCode(i);
      }
      return function(data, content_type) {
        var data = new Uint8Array(data);
        var str, _j, _ref3;

        str = '';
        for (i = _j = 0, _ref3 = data.length; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
          str += charMap[data[i]];
        }
        return 'data:'+ content_type +';base64,' + btoa(str);
      };
    })();    


module.exports = function(base_url) {
  var api = core(base_url)

  api.as_string = function(node, filename, key, cb){

    var file = api.find(node, filename),
        endpoint = api.resolve('file/' + file.id);

    if (key) xxtea(endpoint, key, {return_string: true}, cb)
    else xhr(endpoint, function(err, buf){
      if (err) return cb(err);
      cb(null, String.fromCharCode.apply(null, new Uint8Array(buf)))
    })
  }

  api.as_bytes = function(node, filename, key, cb) {
    var file = api.find(node, filename),
        endpoint = api.resolve('file/' + file.id);

    if (key) xxtea(endpoint, key, {}, cb)
    else xhr(endpoint, cb)
  }

  api.as_data_url = function(node, filename, key, cb) {
    var file = api.find(node, filename);

    api.as_bytes(node, file, key, function(err, data){
      if(err) return cb(err);
      cb(null, buildDataURL(data, file.content_type));
    });
  }

  api.as_blob = function(node, filename, key, cb) {
    if (typeof Blob === 'undefined') return cb('No blob support');

    var file = api.find(node, filename),
        endpoint = api.resolve('file/' + file.id),
        blober = function(err, bytes) {
          if (err) return cb(err);
          var blob = new Blob([bytes], {type: file.content_type});
          cb(null, blob);          
        }
    if (!key) xhr(endpoint, blober)
    else xxtea(endpoint, key, {}, blober)
  }

  return api;

}