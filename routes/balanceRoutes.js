import express from "express";
import Balance from "../models/Balance.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET balance (per user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let balance = await Balance.findOne({ user: req.user.id });

    if (!balance) {
      balance = await Balance.create({
        user: req.user.id,
        amount: 0,
      });
    }

    res.json({ balance: balance.amount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE balance
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    const balance = await Balance.findOneAndUpdate(
      { user: req.user.id },
      { amount },
      { new: true, upsert: true }
    );

    res.json({ balance: balance.amount });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;