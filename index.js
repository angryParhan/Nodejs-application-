const express = require('express')
const path = require('path')
const csrf = require('csurf')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const helmet = require('helmet')
const compression = require('compression')
const exphbs = require('express-handlebars')
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const homeRouter = require('./routes/home')
const addRouter = require('./routes/add')
const coursesRouter = require('./routes/courses')
const cardRouter = require('./routes/card')
const orders = require('./routes/orders')
const registration = require('./routes/auth')
const profile = require('./routes/profile')
const Middleware = require('./middleware/variables')
const UserMiddleware = require('./middleware/user')
const ErrorHandler = require('./middleware/error')
const fileMiddleware = require('./middleware/file')
const keys = require('./keys/index')

const app = express()
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helpers')
})

const store  = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI

})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')




app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: keys.secret,
  resave: false,
  saveUninitialized: false,
  store

}))
app.use(fileMiddleware.single('avatar'))
app.use(csrf())
app.use(flash())
app.use(compression())
app.use(helmet())
app.use(Middleware)
app.use(UserMiddleware)
app.use('/', homeRouter)
app.use('/add', addRouter)
app.use('/courses', coursesRouter)
app.use('/card', cardRouter)
app.use('/orders', orders)
app.use('/auth', registration)
app.use('/profile', profile)


app.use(ErrorHandler)



const PORT = process.env.PORT || 3000


async function start () {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (e) {
    console.log(e)
  }
}

start()


