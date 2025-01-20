const express = require('express')
const router = express.Router()
// const ConfServ = require("../config/ConfServ");
const ControllerMail = require('../controller/ControllerMail')

router.post('/api/email', function (req, res) {
  const key = req.body.key
  if (key === process.env.EMAIL_INTERNAL_API_KEY) {
  // if (key == ConfServ.key) {
    ControllerMail.send_mail(req, res)
  } else {
    res.status(401).end()
  }
})

module.exports = router
