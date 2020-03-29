const {Router} = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = Router()

function getCourses(user) {
  const courses = []
  for (let i = 0; i < user.cart.items.length; i++) {
    let currentObj = {
      title: user.cart.items[i].courseId.title,
      count: user.cart.items[i].count,
      id: user.cart.items[i].courseId._id,
      price: user.cart.items[i].courseId.price
    }
    courses.push(currentObj)
  }
  return courses
}

function getPrice(courses) {
  let price = 0
  for (let i = 0; i < courses.length; i++) {
    price += (courses[i].price * courses[i].count)
  }
  return price
}


router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id)
  await req.user.addToCart(course)
  res.redirect('/card')
})



router.delete('/remove/:id', auth, async (req, res) => {
  await req.user.removeFromCart(req.params.id)
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()

  const cart = {
    courses: getCourses(user),
    price: 0
  }
  cart.price = getPrice(cart.courses)
  res.status(200).json(cart)
})

router.get('/', auth, async (req, res) => {
  const user = await req.user
    .populate('cart.items.courseId', 'title price')
    .execPopulate()
  const card = {
    courses: [],
    price: 0
  }
  card.courses = getCourses(user)
  card.price = getPrice(card.courses)

  res.render('card', {
    title: 'Cart',
    isCard: true,
    courses: card.courses,
    price: card.price
  })
})


module.exports = router
