module.exports = function(router, passport) {
    // API
    // http://localhost:8080/api/user
    // @POST
    router.route('/login')
    .post(function(req, res) {
	console.log(req.body);
	passport.authenticate('local', function(req, res){
	    console.log(req.body);
	    res.redirect('/');
	})
    });
    

}

