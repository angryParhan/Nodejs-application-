const keys = require('../keys/index')


module.exports = function (customer) {
 return {
   to: customer,
   from: keys.EAMIL_FROM,
   subject: 'Registration to Web Courses',
   html: `
     <h1>Welcome to our Shop!</h1>
     <p>You successfully created account.</p>
     <hr>
     <a href="${keys.BASE_URL}">Courses Store</a>
   `
 }
}
