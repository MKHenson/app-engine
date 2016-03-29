var test = require('unit.js');
var fs = require('fs');
var yargs = require('yargs');
var args = yargs.argv;

if (!args.uconfig || !fs.existsSync(args.uconfig)) {
	console.log("Please specify a users --uconfig file to use in the command line. Eg --uconfig=\"../users/example-config.json\" ");
	process.exit();
}

if (!args.apiUrl) {
	console.log("Please specify a valid --apiUrl file to use in the command line. Eg --apiUrl=\"http://animate.webinate-test.net\"");
	process.exit();
}

// Load the files
var uconfig = fs.readFileSync(args.uconfig);
try
{
    // Parse the config files
    console.log("Parsing files...");
    uconfig = JSON.parse(uconfig);
}
catch (exp)
{
	console.log(exp.toString())
	process.exit();
}

var usersAgent = test.httpAgent("http://"+ uconfig.host +":" + uconfig.portHTTP);
var apiAgent = test.httpAgent(args.apiUrl);
var adminCookie = "";
var georgeCookie = "";
var janeCookie = "";
var project = null;
var plugin = null;

console.log("Logged in as " + uconfig.adminUser.username + ",  " + uconfig.adminUser.password);

describe('Testing REST with admin user', function(){
	
	it('should not be logged in', function(done){
		usersAgent
			.get('/users/logout').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isNotTrue()
				test.object(res.body).hasProperty("message")
				done();
			});
	})
	
	it('should log in with a valid admin username & valid password', function(done){
		usersAgent
			.post('/users/login').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({username: uconfig.adminUser.username, password: uconfig.adminUser.password })
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isNotTrue()
				test.bool(res.body.authenticated).isTrue()
				test.object(res.body).hasProperty("message")
				adminCookie = res.headers["set-cookie"][0].split(";")[0];
				done();
			});
	}).timeout(25000)
})

describe('Creating two regular users geoge and jane', function(){
	
	it('did remove any users called george', function(done){
		usersAgent
			.delete('/users/remove-user/george').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				done();
			});
	}).timeout(25000)
	
	it('did remove any users called jane', function(done){
		usersAgent
			.delete('/users/remove-user/jane').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				done();
			});
	}).timeout(25000)
	
	it('did create regular user george', function(done){
		usersAgent
			.post('/users/create-user').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({username: "george", password: "password", email: "test@test.com", privileges: 3 })
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isFalse()
				test.object(res.body).hasProperty("message")
				done();
			});
	}).timeout(16000)
		
	it('did create another regular user jane with valid details', function(done){
		usersAgent
			.post('/users/create-user').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({username: "jane", password: "password", email: "test2@test.com", privileges: 3 })
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isFalse()
				test.object(res.body).hasProperty("message")
				done();
			});
	}).timeout(16000)
	
	it('did active george through the admin', function(done){
		usersAgent
			.put('/users/approve-activation/george').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isFalse()
				done();
			});
	})
	
	it('did active jane through the admin', function(done){
		usersAgent
			.put('/users/approve-activation/jane').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isFalse()
				done();
			});
	})
	
	it('did get georges cookie', function(done){
		usersAgent
			.post('/users/login').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({username: "george", password: "password" })
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isFalse()
				test.bool(res.body.authenticated).isTrue()
				georgeCookie = res.headers["set-cookie"][0].split(";")[0];
				done();
			});
	})
	
	it('did get janes cookie', function(done){
		usersAgent
			.post('/users/login').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({username: "jane", password: "password" })
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isFalse()
				test.bool(res.body.authenticated).isTrue()
				janeCookie = res.headers["set-cookie"][0].split(";")[0];
				done();
			});
	})
});

describe('Testing the user-details API', function(){
	
	it('should not get details of a phony user', function(done){
		apiAgent
			.get('/app-engine/user-details/phony').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.bool(res.body.error).isTrue()
				test.string(res.body.message).is("Could not find details for target 'phony' : User does not exist")
				done();
			});
	}).timeout(25000)
	
	it('george should have user details when he registered & they are blank', function(done) {
		apiAgent
			.get('/app-engine/user-details/george').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				test.string(res.body.message).is("Found details for user 'george'")
				test.string(res.body.data.user).is("george")
				test.string(res.body.data.bio).is("")
				test.value(res.body.data.image).is("")
				test.number(res.body.data.plan).is(0)
				test.string(res.body.data.website).is("")
				test.string(res.body.data.customerId).is("")
				test.number(res.body.data.maxProjects).is(0)
				test.value(res.body.data._id).isNull()
				done();
			});
	}).timeout(25000)
	
	it('should allow george access his user details with verbose', function(done){
		apiAgent
			.get('/app-engine/user-details/george?verbose=true').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found details for user 'george'")
				test.string(res.body.data.user).is("george")
				test.string(res.body.data.bio).is("")
				test.number(res.body.data.plan).is(1)
				test.string(res.body.data.website).is("")
				test.string(res.body.data.customerId).is("")
				test.number(res.body.data.maxProjects).is(5)
				test.string(res.body.data._id).notContains("00000000")				
				done();
			});
	}).timeout(25000)
	
	it('george cannot access janes details with verbose', function(done){
		apiAgent
			.get('/app-engine/user-details/jane?verbose=true').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found details for user 'jane'")
				test.string(res.body.data.user).is("jane")
				test.string(res.body.data.bio).is("")
				test.number(res.body.data.plan).is(0)
				test.string(res.body.data.website).is("")
				test.string(res.body.data.customerId).is("")
				test.number(res.body.data.maxProjects).is(0)
				test.value(res.body.data._id).isNull()		
				done();
			});
	}).timeout(25000)
	
	it('should allow george update his user details', function(done){
		apiAgent
			.put('/app-engine/user-details/george').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Details updated")
				done();
			});
	}).timeout(25000)
})

describe('Testing plugin related functions', function(){
	
	it('should not create a plugin if not an admin', function(done){
		apiAgent
			.post('/app-engine/plugins/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "", description: "", plugins:[] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("You do not have permission")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should be able to edit a plugin if not an admin', function(done){
		apiAgent
			.put('/app-engine/plugins/111111111111111111111111').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "", description: "", plugins:[] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("You do not have permission")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should create a plugin if an admin', function(done){
		apiAgent
			.post('/app-engine/plugins/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Dinosaurs", description: "This is about dinosaurs", "version": "0.0.1", plugins:["111111111111111111111111"] })
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				plugin = res.body.data;
				test.string(res.body.message).is("Created new plugin 'Dinosaurs'")
				test.bool(res.body.error).isFalse()
				test.string(res.body.data.author).is(uconfig.adminUser.username)
				test.string(res.body.data.description).is("This is about dinosaurs")
				test.number(res.body.data.plan).is(1)
				test.array(res.body.data.deployables).isEmpty()
				test.number(res.body.data.plan).is(1)
				test.string(res.body.data.version).is("0.0.1")
				test.bool(res.body.data.isPublic).isFalse()
				
				done();
			});
	}).timeout(25000)
	
	it('should not be able to get a plugin if not an admin and set to private', function(done){
		apiAgent
			.get('/app-engine/plugins/' + plugin._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 0 plugins")
				test.bool(res.body.error).isFalse()
				done();
			});
	}).timeout(25000)
	
	it('should be able to get a plugin if an admin and set to private', function(done){
		apiAgent
			.get('/app-engine/plugins/' + plugin._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 1 plugins")
				test.bool(res.body.error).isFalse()
				done();
			});
	}).timeout(25000)
	
	it('should not be able to delete a plugin if not an admin', function(done){
		apiAgent
			.delete('/app-engine/plugins/' + plugin._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("You do not have permission")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should be able to delete a plugin if not an admin', function(done){
		apiAgent
			.delete('/app-engine/plugins/' + plugin._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Plugin has been successfully removed")
				test.bool(res.body.error).isFalse()
				done();
			});
	}).timeout(25000)
	
});

describe('Testing project related functions', function(){
	
	it('should not create a project with an empty name', function(done){
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "", description: "", plugins:[] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("name cannot be empty")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should catch untrimmed names as well', function(done){
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "      ", description: "", plugins:[] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("name cannot be empty")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should not allowed html in names', function(done){
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "<b></b>", description: "", plugins:[] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("name cannot be empty")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should not allowed dangerous html in description', function(done){
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project", description: "<script>hello</script><b>Hello world!</b>", plugins:[] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("'description' has html code that is not allowed")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should not be allowed with no plugins', function(done){
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project", description: "<b>Hello world!</b>", plugins:[] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("You must select at least 1 item for plugins")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should create a valid project', function(done){
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project", description: "<b>Hello world!</b>", plugins:["111111111111111111111111"] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				project = res.body.data;
				test.string(res.body.message).is("Created project 'Test project'")
				test.bool(res.body.error).isFalse()
				test.string(res.body.data.name).is("Test project")
				test.string(res.body.data.description).is("<b>Hello world!</b>")
				test.value(res.body.data.image).is("")
				test.number(res.body.data.category).is(1)
				test.string(res.body.data.subCategory).is("")
				test.bool(res.body.data.public).isFalse()
				test.value(res.body.data.curFile).isNull()
				test.number(res.body.data.rating).is(0)
				test.bool(res.body.data.suspicious).isFalse()
				test.bool(res.body.data.deleted).isFalse()
				test.number(res.body.data.numRaters).is(0)
				test.string(res.body.data.user).is("george")
				test.string(res.body.data.build).isNot("")
				test.number(res.body.data.type).is(0)
				test.array(res.body.data.tags).isEmpty()
				test.array(res.body.data.readPrivileges).isEmpty()
				test.array(res.body.data.writePrivileges).isEmpty()
				test.array(res.body.data.adminPrivileges).isEmpty()
				test.array(res.body.data.plugins).isNotEmpty()
				test.array(res.body.data.files).isEmpty()
				test.number(res.body.data.createdOn).isNot(0)
				test.number(res.body.data.lastModified).isNot(0)
				test.string(res.body.data._id).notContains("00000000")	
				
				done();
			});
	}).timeout(25000)
	
	it('should have a build at this point', function(done){
		apiAgent
			.get('/app-engine/builds/george/' + project._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.number(res.body.count).is(1)
				test.bool(res.body.error).isFalse()
				done();
			});
	}).timeout(25000)
	
	it('should not get a project with a bad ID', function(done){
		apiAgent
			.get('/app-engine/projects/george/123').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Please use a valid object id")
				test.bool(res.body.error).isTrue()				
				done();
			});
	}).timeout(25000)
	
	it('should not get a project with a non-existant ID', function(done){
		apiAgent
			.get('/app-engine/projects/george/123456789112').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 0 projects")
				test.bool(res.body.error).isFalse()
				test.number(res.body.count).is(0)
				done();
			});
	}).timeout(25000)
	
	it('should get a valid project but not show sensitives unless specified', function(done){
		apiAgent
			.get('/app-engine/projects/george/' + project._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 1 projects")
				test.bool(res.body.error).isFalse()
				test.number(res.body.count).is(1)
				test.value(res.body.data[0].readPrivileges).isNull()
				done();
			});
	}).timeout(25000)
	
	it('should get a valid project & show sensitives when verbose', function(done){
		apiAgent
			.get('/app-engine/projects/george/' + project._id + "?verbose=true").set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 1 projects")
				test.bool(res.body.error).isFalse()
				test.number(res.body.count).is(1)
				test.array(res.body.data[0].readPrivileges).isEmpty()
				done();
			});
	}).timeout(25000)
	
	it('should not allow a different user access to sensitive data', function(done){
		apiAgent
			.get('/app-engine/projects/george/' + project._id + "?verbose=true").set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', janeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 1 projects")
				test.bool(res.body.error).isFalse()
				test.number(res.body.count).is(1)
				test.value(res.body.data[0].readPrivileges).isNull()
				done();
			});
	}).timeout(25000)
	
	it('should get a sanitized project when no user cookie is detected', function(done){
		apiAgent
			.get('/app-engine/projects/george/' + project._id + "?verbose=true").set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 1 projects")
				test.bool(res.body.error).isFalse()
				test.number(res.body.count).is(1)
				test.value(res.body.data[0].readPrivileges).isNull()
				done();
			});
	}).timeout(25000)
	
	it('should not get a project for a user that doesnt exist', function(done){
		apiAgent
			.get('/app-engine/projects/george3/' + project._id + "?verbose=true").set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', janeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found 0 projects")
				test.bool(res.body.error).isFalse()
				test.number(res.body.count).is(0)
				done();
			});
	}).timeout(25000)
	
	it('should not let a guest remove a project', function(done){
		apiAgent
			.delete('/app-engine/projects/george/' + project._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', janeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("You do not have permission")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should not remove an invalid project ID', function(done){
		apiAgent
			.delete('/app-engine/projects/george/123').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Please use a valid object id")
				test.bool(res.body.error).isTrue()
				done();
			});
	}).timeout(25000)
	
	it('should not remove a valid project ID that doesnt exist', function(done){
		apiAgent
			.delete('/app-engine/projects/george/123456789112').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("0 items have been removed")
				test.bool(res.body.error).isFalse()
				test.array(res.body.itemsRemoved).isEmpty()
				done();
			});
	}).timeout(25000)
	
	it('should remove a valid project', function(done){
		apiAgent
			.delete('/app-engine/projects/george/' + project._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("1 items have been removed")
				test.bool(res.body.error).isFalse()
				test.array(res.body.itemsRemoved).isNotEmpty()
				done();
			});
	}).timeout(25000)
	
	
	it('should not allow george to create 6 projects', function(done){
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project 1", description: "<b>Hello world!</b>", plugins:["111111111111111111111111"] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){ if (err) return done(err); });
			
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project 2", description: "<b>Hello world!</b>", plugins:["111111111111111111111111"] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){ if (err) return done(err); });
			
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project 3", description: "<b>Hello world!</b>", plugins:["111111111111111111111111"] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){ if (err) return done(err); });
			
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project 4", description: "<b>Hello world!</b>", plugins:["111111111111111111111111"] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){ if (err) return done(err); });
			
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project 5", description: "<b>Hello world!</b>", plugins:["111111111111111111111111"] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){ if (err) return done(err);  });
			
		apiAgent
			.post('/app-engine/projects/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.send({name: "Test project 6", description: "<b>Hello world!</b>", plugins:["111111111111111111111111"] })
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("You cannot create more projects on this plan. Please consider upgrading your account")
				test.bool(res.body.error).isTrue()
				done();
			});
			
	}).timeout(25000)

})

describe('Cleaning up', function(){
	
	it('did remove any users called george', function(done){
		usersAgent
			.delete('/users/remove-user/george').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				done();
			});
	}).timeout(25000)
	
	it('did remove any users called jane', function(done){
		usersAgent
			.delete('/users/remove-user/jane').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', adminCookie)
			.end(function(err, res){
				if (err) return done(err);
				done();
			});
	}).timeout(25000)
})