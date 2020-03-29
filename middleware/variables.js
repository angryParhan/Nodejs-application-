module.exports = function (req, res, next) {
  res.locals.isAuth = req.session.isAunteticated
  res.locals.crf = req.csrfToken()
  next()
}
