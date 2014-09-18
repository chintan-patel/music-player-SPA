var User = require(__dirname + '/../models/user.js');

module.exports = function(router) {
    router.get('/user', function(req, res) {
	User.find( { "delete" : false }, function(err, users) {

		var Map= {};
		users.forEach(function(user) {
		    Map[user._id] = user;
		});
		res.send(Map);  
	    });
    });
    
    // API
    // http://localhost:8080/api/user
    // @POST
    // @GET
    router.route('/user')
	.post(function(req, res) {
		
	    var user = new User();
	    user.username = req.body.username;
	    user.password= req.body.password;
	    user.salt= req.body.salt;
	    user.first_name= req.body.first_name;
	    user.last_name = req.body.last_name;
	    if (user.username == undefined) {
		res.json({message: 'Not Added'});
	    }
	    // save the user and check for errors
	    user.save(function(err, result) {
		if (err) 
		{
		    res.send(err);
		}
		res.send(result);
	    });
	});
	
    router.route('/user/:user_id')
	.get(function(req,res){
	    User.findById( req.params.user_id, function(err, user) {
		res.send(user);  
	    });
	})
	.put(function(req,res){
	    User.findById( req.params.user_id, function(err, user) {
		if (req.body.username != undefined) {
		    user.username = req.body.username;
		}
		if (req.body.password != undefined) {
		    user.password= req.body.password;
		}
		if (req.body.salt != undefined) {
		    user.salt = req.body.salt;
		}
		if (req.body.first_name != undefined) {
		    user.first_name = req.body.first_name;
		}
		if (req.body.last_name != undefined) {
		    user.last_name = req.body.last_name;
		}
		
		user.save(function(err){
		    if (err) {
			res.send(err);
		    }
		    res.json({ message: 'User Updated!' });
		});
	    });
	})
	.delete(function(req,res){
	    User.findById( req.params.user_id, function(err, user) {
		user.delete = true;
		
		user.save(function(err, user){
		    if (err) {
			res.send(err);
		    }
		    res.json(user);
		});
	    });
	})
	;
};
