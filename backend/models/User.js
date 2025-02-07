const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  },
  username: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], required: true },
  password_hash: { type: String, required: true },
  purchased_policies: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Policy' ,
      default: []
    }
  ]
}, { timestamps: true });



const User = mongoose.model('User', userSchema);
module.exports = User;
