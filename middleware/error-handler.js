const util = require("util")
const joi = require("joi")

module.exports = () => {
  return (err, req, res, next) => {
    if (err instanceof joi.ValidationError) {
      return res.send({
        status: 0,
        code: 40001,
        msg: err.message,
      })
    } else if (err.name === 'UnauthorizedError') {
      return res.send({
        status: 0,
        code: 40100,
        msg: 'token认证失败, 未经授权访问',
      })
      // 捕获数据库错误
    } else if (err.name === 'SequelizeDatabaseError') {
      return res.send({
        status: 0,
        code: 40001,
        msg: err.message,
      })
    } else if (err.name === 'SequelizeValidationError') {
      return res.send({
        status: 0,
        code: 40001,
        msg: err.message,
      })
    }
    return res.send({
      status: 0,
      code: 40100,
      msg: err,
    })

  }
}
