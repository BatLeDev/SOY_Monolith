const auth = require('./auth')

module.exports = {
  checkConnection: async function (req, res, next) {
    auth.isAuth(req, res, next)
  }
}
