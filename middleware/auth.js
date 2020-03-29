module.exports = function(req, res, next) {
  if(!req.session.isAunteticated) {
    return res.redirect('/auth/login')
  }
  next()
}
