const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: true,
    enum: ['VIP', 'Standard', 'Economy'], 
  },
  numberOfRows: {
    type: [Number], 
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, 
  },
  availability: {
    type: Boolean,
    default: true, 
  },
},
{timestamps:true}
);

const classModel = mongoose.model('Class', classSchema);

module.exports = classModel;
