
var url = require('url'),
		_ = require('lodash'),
		oboe = require('oboe'),
    sjcl  = require('sjcl'),
    xxtea = require('xxtea-xmlhttprequest');

module.exports = function(base_url) {
  
  var api = {};

  api.resolve = function(route) {
  	return  url.resolve(base_url + '/', route);
  }

  api.package_details = function(cb){
		oboe(api.resolve('package.json'))
			.done(function(pkg){ cb(null, pkg) })
			.fail(function(err){ cb(err); })
  }

  api.first_node = function(cb) {

    api.package_details(function(err, pkg){
  		if (err) return cb(err);
      oboe(api.resolve('node/' + pkg.start_id))

      	.done(function(start_chapter){
      		cb(null, start_chapter);
	      })
        .fail(function(err){ return cb(err) })
  	})
  }

  api.crack_node = function(key_id, pass, cb) {

    oboe(api.resolve('key/' + key_id))
      .fail(function(err){ return cb(err) })
    	.done(function(key_ct){
	      try {
	        var c2 = JSON.parse( sjcl.decrypt(pass, JSON.stringify(key_ct)));
	        oboe(api.resolve('node/' + c2.to))
            .fail(function(err){ return cb(err) })
		        .done(function(node_ct){
		          var node = JSON.parse( sjcl.decrypt(c2.key, JSON.stringify(node_ct)));
		          node.id = c2.to;
		          return cb(null, {key: c2.key, node: node});
		        })
	      } catch(e) {
	        return cb(e);
	      }
	    })
  }

  api.read_node = function(node_id, key, cb) {
    oboe(api.resolve('node/' + node_id))
      .fail(function(err){ return cb(err) })
      .done(function(node_ct){
          var node = JSON.parse( sjcl.decrypt(key, JSON.stringify(node_ct)) );
          node.id = node_id;
          cb(null, node);
      })
  }


  api.blob = function(chapter, filename, key, cb) {
    if (typeof Blob === 'undefined') return cb('No blob support');

    var file = _.find(chapter.files, function(file){ return file.name === filename })

    xxtea(api.resolve('file/' + file.id), key, {}, function(err, bytes){
      var blob = new Blob([bytes], {type: file.content_type});
      cb(null, blob);
    })
  }

  return api;

}