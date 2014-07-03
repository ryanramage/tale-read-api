
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
		oboe(this.resolve('package.json'))
			.done(function(pkg){  cb(null, pkg) })
			.fail(function(err){ cb(err); })
  }

  api.first_chapter = function(cb) {
  	var self = this;

  	this.package_details(function(err, pkg){
  		if (err) return cb(err);
      oboe(self.resolve('node/' + pkg.start_id))
      	.fail(function(err){ return cb(err) })
      	.done(function(start_chapter){
      		cb(null, start_chapter);
	      })
  	})
  }

  api.crack_chapter = function(key_id, pass, cb) {
  	var self = this;

    oboe(self.resolve('key/' + key_id))
      .fail(function(err){ return cb(err) })
    	.done(function(key_ct){
	      try {
	        var c2 = JSON.parse( sjcl.decrypt(pass, JSON.stringify(key_ct)));
	        oboe(self.resolve('node/' + c2.to))
            .fail(function(err){ return cb(err) })
		        .done(function(chapter_ct){
		          var chapter = JSON.parse( sjcl.decrypt(c2.key, JSON.stringify(chapter_ct)));
		          chapter.id = c2.to;
		          return cb(null, {key: c2.key, chapter: chapter});
		        })
	      } catch(e) {
	        return cb(e);
	      }
	    })
  }

  api.blob = function(chapter, filename, key, cb) {
  	var self = this,
				file = _.find(chapter.files, function(file){ return file.name === filename })

    xxtea(self.resolve('file/' + file.id), key, false, function(err, bytes){
      var blob = new Blob([bytes], {type: file.content_type});
      cb(null, blob);
    })
  }

  return api;

}