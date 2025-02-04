const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  premium_amount: { type: Number, required: true, min: 1 },
  policy_end_date: { type: Date, required: true },
  users: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  ]
}, { timestamps: true });

const Policy = mongoose.model('Policy', policySchema);
module.exports = Policy;
