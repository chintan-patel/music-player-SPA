/**
 * app/routes.js
 **/

module.exports = function(app){
  /**
   * Serve home page
   */
  app.get('/', function (req, res) {
    res.render(__dirname + '/app/index.html');
  });
};

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
