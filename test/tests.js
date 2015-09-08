var test = require('unit.js');
var fs = require('fs');


// REPLACE THIS WITH A VALID WEBINATE-USERS CONFIG.JSON
var config = "../../webinate-users/server/config.json";

// REPLACE THIS WITH A VALID URL FOR PLUGIN API CALLS
var apiUrl = "http://animate.webinate-test.net"

// Load the file
config = fs.readFileSync( config, "utf8");
try
{
    // Parse the config
    console.log("Parsing file configs...");
	config = JSON.parse(config);
	
}
catch (exp)
{
	console.log(exp.toString())
	process.exit();
}

var usersAgent = test.httpAgent("http://"+ config.host +":" + config.portHTTP);
var apiAgent = test.httpAgent(apiUrl);
var adminCookie = "";
var georgeCookie = "";
var janeCookie = "";

console.log("Logged in as " + config.adminUser.username + ",  " + config.adminUser.password);

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
			.send({username: config.adminUser.username, password: config.adminUser.password })
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
				test.string(res.body.message).is("Could find details for target 'phony' : User does not exist")
				done();
			});
	}).timeout(25000)
	
	it('george should have user details when he registered & they are blank', function(done){
		apiAgent
			.get('/app-engine/user-details/george').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				test.string(res.body.message).is("Found details for user 'george'")
				test.string(res.body.data.user).is("george")
				test.string(res.body.data.bio).is("")
				test.string(res.body.data.image).contains("00000000")
				test.string(res.body.data.plan).is("")
				test.string(res.body.data.website).is("")
				test.string(res.body.data.customerId).is("")
				test.number(res.body.data.maxProjects).is(5)
				test.string(res.body.data._id).contains("00000000")				
				done();
			});
	}).timeout(25000)
	
	it('george can access his user details with verbose', function(done){
		apiAgent
			.get('/app-engine/user-details/george?verbose=true').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found details for user 'george'")
				test.string(res.body.data.user).is("george")
				test.string(res.body.data.bio).is("")
				test.string(res.body.data.plan).is("")
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
				test.string(res.body.data.plan).is("")
				test.string(res.body.data.website).is("")
				test.string(res.body.data.customerId).is("")
				test.number(res.body.data.maxProjects).is(5)
				test.string(res.body.data._id).contains("00000000")				
				done();
			});
	}).timeout(25000)
	
	it('should not create project with script in description', function(done){
		apiAgent
			.get('/app-engine/project/create').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
			.set('Cookie', georgeCookie)
			.end(function(err, res){
				if (err) return done(err);
				test.string(res.body.message).is("Found details for user 'jane'")
				test.string(res.body.data.user).is("jane")
				test.string(res.body.data.bio).is("")
				test.string(res.body.data.plan).is("")
				test.string(res.body.data.website).is("")
				test.string(res.body.data.customerId).is("")
				test.number(res.body.data.maxProjects).is(5)
				test.string(res.body.data._id).contains("00000000")				
				done();
			});
	}).timeout(25000)
})


describe('Testing the cleanup process', function(){
})