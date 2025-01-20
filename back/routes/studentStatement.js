const express = require('express')
const router = express.Router()
const ControllerStudentStatementAPI = require('../controller/ControllerStudentStatementAPI')

// ========== API 2 ==========

router.post('/api/student-statement', function (req, res) {
  ControllerStudentStatementAPI.create(req, res)
})

router.get(
  '/api/student-statement/user/:userId/exercise/:exerciseId/business-session/:businessSessionId',
  function (req, res) {
    ControllerStudentStatementAPI.read(req, res)
  }
)

router.put(
  '/api/student-statement/user/:userId/exercise/:exerciseId/business-session/:businessSessionId',
  function (req, res) {
    ControllerStudentStatementAPI.update(req, res)
  }
)

module.exports = router
