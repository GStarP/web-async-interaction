const express = require("express")

const app = express()

app.get("/api/data", (req, res) => {
  const pageNum = req.query.pageNum
  setTimeout(() => {
    res.json(new Array(10).fill(1).map((_, i) => `${pageNum}-${i}`))
  }, 3000)
})

app.listen(8080, () => {
  console.log("server is running at http://localhost:8080")
})
