const {Router} = require('express')
const router = Router()
const crypto = require('crypto')
const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys/index')
const regEmail = require('../emails/registrations')
const resetEmail = require('../emails/reset')
const {registerValidators} = require('../utils/validators')
const User = require('../models/user')


const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Log in',
    isRegistration: true,
    error: req.flash('error')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login')
  })
})

router.post('/login', async (req, res) => {
  try {
    const {email, pass} = req.body


    const candidate = await User.findOne({ email })

    if(candidate) {
      const isSame = await bcrypt.compare(pass, candidate.password)
      if (isSame) {
        req.session.user = candidate
        req.session.isAunteticated = true
        req.session.save(err => {
          if (err) throw err
          else {
            res.redirect('/')
          }
        })
      } else {
        req.flash('error', 'Incorrect password, try again!')
        res.redirect('/auth/login')
      }
    } else {
      req.flash('error', 'Incorrect email, try again!')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }


})

router.post('/signup', registerValidators, async (req, res) => {
  try {
    const {email, pass, confirm, username} = req.body
    const candidate = await User.findOne({ email })
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#registration')
    }
    if (candidate) {
      req.flash('error', 'User with such email already exists')
      res.redirect('/auth/login#login')
    } else {
      const hashPassword = await bcrypt.hash(pass, 10)
      const user = User({
        email,
        name: username,
        password: hashPassword,
        cart: { items: [] }
      })
      await user.save()
      await transporter.sendMail(regEmail(email))
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Forget Password',
    error: req.flash('error')
  })
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login')
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (!user) {
      return res.redirect('/auth/login')
    } else {
      res.render('auth/password', {
        title: 'Update Password',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
      })
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.user_id,
      resetToken: req.body.token,
      resetTokenExp: {$gt: Date.now()}
    })

    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10)
      user.resetToken = undefined
      user.resetTokenExp = undefined
      await user.save()
      res.redirect('/auth/login')
    } else {
      req.flash('error', 'Token time is over!')
      res.redirect('/auth/login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash('error', 'Something went wrong( Try again later!')
        return res.redirect('/auth/reset')
      }

      const token = buffer.toString('hex')
      const candidate = await User.findOne({email: req.body.email})
      if (candidate) {
        candidate.resetToken = token
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000 // one hour
        await candidate.save()
        await transporter.sendMail(resetEmail(candidate.email, token))
        res.redirect('/auth/login')
      } else {
        req.flash('error', 'THERE IS NO SUCH USER!')
        res.redirect('/auth/reset')
      }
    })
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
