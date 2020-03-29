const {Schema, model} = require('mongoose')

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: String,
  password: {
    type: String,
    required: true
  },
  avatarUrl: String,
  resetToken: String,
  resetTokenExp: Date,
  cart: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true
        }
      }
    ]
  }
})

userSchema.methods.addToCart = function(course) {
  const clonedItems = [...this.cart.items]
  const idx = clonedItems.findIndex(c => {
    return c.courseId.toString() === course._id.toString()
  })
  if (idx >= 0) {
    clonedItems[idx].count = clonedItems[idx].count + 1
  } else {
    clonedItems.push({
      count: 1,
      courseId: course._id
    })
  }

  const newCart = {items: clonedItems}
  this.cart = newCart
  return this.save()
}


userSchema.methods.removeFromCart = function(id) {
  const items = [...this.cart.items]
  const idx = items.findIndex(c => {
    return c.courseId.toString() === id.toString()
  })
  if (items[idx].count > 1) {
    items[idx].count--
  } else {
    items.splice(idx, 1)
  }
  this.cart.items = items
  return this.save()
}

userSchema.methods.clearCart = function() {
  this.cart.items = []
  return this.save()
}


module.exports = model('User', userSchema)
