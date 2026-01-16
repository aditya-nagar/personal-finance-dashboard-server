import express from "express";
import Transaction from "../models/Transaction.js";
import Balance from "../models/Balance.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= GET TRANSACTIONS ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error("FETCH TRANSACTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

/* ================= ADD TRANSACTION ================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, amount, type, category } = req.body;
    const numericAmount = Number(amount);

    if (
      !title ||
      !["income", "expense"].includes(type) ||
      !Number.isFinite(numericAmount)
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const transaction = await Transaction.create({
      title: title.trim(),
      amount: numericAmount,
      type,
      category: category || "Others",
      user: req.user.id,
    });

    let balance = await Balance.findOne({ user: req.user.id });
    if (!balance) {
      balance = await Balance.create({ user: req.user.id, amount: 0 });
    }

    balance.amount += type === "income" ? numericAmount : -numericAmount;
    await balance.save();

    res.status(201).json(transaction);
  } catch (err) {
    console.error("ADD TRANSACTION ERROR:", err);
    res.status(500).json({ message: "Failed to add transaction" });
  }
});

/* ================= DELETE TRANSACTION ================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    let balance = await Balance.findOne({ user: req.user.id });
    if (balance) {
      balance.amount +=
        transaction.type === "income"
          ? -transaction.amount
          : transaction.amount;

      await balance.save();
    }

    await transaction.deleteOne();

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("DELETE TRANSACTION ERROR:", err);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});

export default router;