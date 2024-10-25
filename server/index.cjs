const express = require("express")

const app = express()

app.get("/api/data", (req, res) => {
  const pageNum = req.query.pageNum
  const delay = pageNum > 5 ? 3000 : 1000
  setTimeout(() => {
    if (pageNum === "7") {
      res.status(500).json({ message: "error" })
    } else {
      res.json(new Array(10).fill(1).map((_, i) => `${pageNum}-${i}`))
    }
  }, delay)
})

app.listen(8080, () => {
  console.log("server is running at http://localhost:8080")
})
