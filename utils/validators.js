const {check, body} = require('express-validator')


exports.registerValidators = [
  check('email').isEmail().withMessage('Enter correct email').normalizeEmail(),
  check('pass', 'Enter correct password minimal length 8 max length 48').isLength({min: 8, max: 48}).trim(),
  check('confirm').custom((value, {req}) => {
    if (value !== req.body.pass) {
      throw new Error('Passwords must be the same!')
    }
    return true
  }).trim(),
  check('username', 'Name must be minimum 3 characters long').isLength({min: 3}).trim()
]



exports.curseValidators = [
  body('title').isLength({ min:3, max:26 }).withMessage('Minimal title length 3, Max: 26').trim(),
  body('price').isNumeric().withMessage('Enter correct price!'),
  body('img', 'Enter correct img URL').isURL()
]
