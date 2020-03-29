const keys = require('../keys/index')

module.exports = function (customer, token) {
  return {
    to: customer,
    from: keys.EAMIL_FROM,
    subject: 'Reset password',
    html: `
     <h1>You forget a password? If not just ignore message!</h1>
     <p>Else click on link below:</p>
     <p><a href="${keys.BASE_URL}auth/password/${token}">RESET PASSWORD</a></p>
     <hr>
     <a href="${keys.BASE_URL}">Courses Store</a>
   `
  }
}
