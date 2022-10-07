const query = require("../model/query")
const db = require("../model/database")

exports.verifyCode = async (email, emailCode, res) => {
  const sql = 'select * from code where email=?'
  let result = await query(sql, email, db)
  if (result.length > 0) {
    if (result[0].code === Number(emailCode)) {
      // 检查验证码是否过期 10分钟
      if (new Date() - result[0].create_time >= 600000) {
        // 验证码过期
        res.send({code: 40000, msg: '验证码过期'})
      } else {
        // 删除验证码
        const sql2 = 'delete from code where email=?'
        await query(sql2, email, db)
        return true
      }
    } else {
      // 验证码错误
      res.send({code: 40000, msg: '验证码错误'})
    }
  } else {
    // 验证码不存在
    res.send({code: 40000, msg: '请先获取验证码'})
  }
}
