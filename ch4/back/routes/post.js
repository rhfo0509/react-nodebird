const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    { id: 1, content: "test1"},
    { id: 2, content: "test2"},
    { id: 3, content: "test3"},
  ])
});

router.post("/", (req, res) => {
  res.json({ id: 4, content: "test4"});
})

module.exports = router;