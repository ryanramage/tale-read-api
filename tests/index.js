var read = require('..')("http://t4.io/mrp9xw"),
		test = require('tape');

test('read package details', function(t){
	t.plan(2);
	read.package_details(function(err, pkg){
		t.error(err);
		t.equals(pkg.name, 'online');
	})	
})

test('read first chapter', function(t){
	t.plan(2);
	read.first_node(function(err, chapter){
		t.error(err);
		t.equals(chapter.type, 'markdown');		
	})
})

test('crack chapter', function(t){
	t.plan(4);
	read.crack_node('65c283d9-e6ac-4f27-9ef3-755bf8cf9d6e', '894', function(err, resp){
		t.error(err);
		t.equals(resp.key, 'iSSkNbKvWUm6pEDjUIEQwg==')
		t.equals(resp.node.name, 'chapter2');
		t.equals(resp.node.proof, '56e25f46-fae9-472d-98b0-68abeb753a49')
	})
})

test('crack chapter, bad password', function(t){
	t.plan(2);
	read.crack_node('65c283d9-e6ac-4f27-9ef3-755bf8cf9d6e', '895', function(err, resp){
		t.ok(err);
		t.error(resp);
	})
})

test('invalid chapter', function(t){
	t.plan(2);
	read.crack_node('fff283d9-e6ac-4f27-9ef3-755bf8cf9d6e', '895', function(err, resp){
		t.ok(err);
		t.error(resp);
	})	
})



