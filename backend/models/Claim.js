const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    claim_date: {
      type: Date,
      required: true,
      validate: {
        validator: async function (value) {
          const policy = await mongoose.model("Policy").findById(this.policy_id);
          return policy ? value < policy.policy_end_date : false;
        },
        message: "Claim date must be before the policy end date.",
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: async function (value) {
          const policy = await mongoose.model("Policy").findById(this.policy_id);
          return policy ? value <= policy.premium_amount : false;
        },
        message: "Claim amount cannot exceed policy coverage amount.",
      },
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Claim = mongoose.model("Claim", claimSchema);
module.exports = Claim;
