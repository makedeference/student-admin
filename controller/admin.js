const db = require('../model/database')
const query = require('../model/query')
const jwt = require('../util/jwt')
const Jwt = require('jsonwebtoken')
const crypto = require("crypto")
const {jwtSecretKey} = require('../config/config')
const nodeMail = require("../util/nodemailer")
// 引入自己封装的验证码校验工具
const { verifyCode } = require('../util/verifycode')

// 登录
exports.login = async (req, res) => {
  const userInfo = req.body
  //---定义使用MD5加密
  const md5 = crypto.createHash('md5')
  //---输出加密的密码
  const md5crypto = md5.update(userInfo.password).digest('hex')// 获取结果
  // 确认登录密码是否正确
  const sql = 'select * from admin where username=?'
  let result = await query(sql, userInfo.username, db)

  if (result.length > 0) {
    // 排除密码
    const user = {...result[0], password: ''}
    const token = 'Bearer ' + await jwt.sign(user, jwtSecretKey, {expiresIn: '72h'})
    result[0].password === md5crypto ? res.send({code: 20000, msg: '登陆成功', data: {token}}) : res.send({
      code: 40000,
      msg: '密码错误,登录失败'
    })
  } else {
    res.send({code: 40000, msg: '用户不存在'})
  }
}

// 获取用户信息
exports.adminInfo = (req, res) => {
  // 去除bearer
  const token = req.query.token.split(' ')[1]
  let user = {}
  //解密token
  Jwt.verify(token, jwtSecretKey, (error, authData) => {
    if (error) {
      res.send({code: 40000, msg: 'token过期'})
    } else {
      user = authData;
      delete user.password
      res.send({code: 20000, msg: '登陆成功', data: {...user}})
    }
  })
}

// 退出登录
exports.logout = (req, res) => {
  res.send({code: 20000, msg: '退出成功'})
}

// 修改密码
exports.updatePassword = async (req, res) => {
  const {oldPassword, newPassword, confirmPassword} = req.body
  // 解析token
  const token = req.headers.authorization.split(' ')[1]
  let user = {}
  //解密token
  Jwt.verify(token, jwtSecretKey, (error, authData) => {
    if (error) {
      res.send({code: 40000, msg: 'token过期'})
    } else {
      user = authData;
    }
  })

  const sql = 'select * from admin where id=?'
  let result = await query(sql, user.id, db)
  if (result.length > 0) {
    if (result[0].password === oldPassword) {
      const sql = 'update admin set password=? where id=?'
      await query(sql, [newPassword, user.id], db)
      res.send({code: 20000, msg: '修改成功'})
    } else {
      res.send({code: 40000, msg: '原密码错误'})
    }
  } else {
    res.send({code: 40000, msg: '用户不存在'})
  }
}

// 邮箱验证码
exports.getEmailCode = async (req, res) => {
  const { email, codeVerify } = req.body
  if (!email) {
    res.send({code: 40000, msg: '邮箱不能为空'})
    return
  }
  const code = Math.floor(Math.random() * 1000000)
  // 查询邮箱和账号是否匹配
  const sql = 'select * from admin where email=?'
  let result = await query(sql, email, db)
  if (result.length === 0) {
    if (!codeVerify) {
      res.send({code: 40000, msg: '邮箱不存在'})
      return
    }
  } else {
    if (result[0].id !== req.user.id) {
      if (!codeVerify) {
        res.send({code: 40000, msg: '邮箱与账号不匹配'})
        return
      }
    }
  }
  // 查询是否已经发送过验证码且未过期 时间戳单位是毫秒
  const sql2 = 'select * from code where email=?'
  let result2 = await query(sql2, email, db)
  if (result2.length > 0) {
    // 计算时间差
    const deadline = (60 - Math.floor((new Date() - result2[0].create_time) / 1000))
    // 每1分钟发送一次
    if (new Date() - result2[0].create_time < 60000) {
      res.send({code: 40000, msg: `距离下次发送时间还有${deadline}秒`})
      return
    } else {
      // 删除之前的验证码, 以便更新新的验证码
      const sql3 = 'delete from code where email=?'
      await query(sql3, email, db)
    }
  }
  // 发送邮件
  const mail = {
    from: `"学生管理系统"<1878656671@qq.com>`,// 发件人
    subject: '验证码',//邮箱主题
    to: email,//收件人，这里由post请求传递过来
    // 邮件内容，用html格式编写
    html: `
            <p>您好！</p>
            <p>您的验证码是：<strong style="color:orangered;">${code}</strong>, 有效期十分钟</p>
            <p>如果不是您本人操作，请无视此邮件</p>
        `
  }
  await nodeMail.sendMail(mail, async (err, info) => {
    if (!err) {
      // 保存验证码和时间
      const sql1 = 'insert into code (email, code, create_time) values (?, ?, ?)'
      await query(sql1, [email, code, new Date().getTime()], db)
      res.json({code: 20000, msg: "验证码发送成功"})
    } else {
      res.json({code: 40001, msg: "验证码发送失败，请稍后重试"})
    }
  })
}

// 找回密码
exports.retrievePassword = async (req, res) => {
  const { newPassword, email, emailCode } = req.body
  // 将密码加密
  const password = crypto.createHash('md5').update(newPassword).digest('hex')
  // 检查验证码是否存在以及是否正确
  const codeStatus = await verifyCode(email, emailCode, res)
  if (codeStatus) {
    // 更新密码
    const sql1 = 'update admin set password=? where email=?'
    await query(sql1, [password, email], db)
    res.send({code: 20000, msg: '修改成功'})
  }
}

// 更换邮箱 - 验证码验证
exports.confirmEmailCode = async (req, res) => {
  const { email, emailCode } = req.body
  const codeStatus = await verifyCode(email, emailCode, res)
  if (codeStatus) {
    res.send({code: 20000, msg: '验证成功'})
  }
}

// 更换邮箱 - 换绑邮箱
exports.updateEmail = async (req, res) => {
  const { email, emailCode } = req.body
  // 检查验证码是否存在以及是否正确
  const codeStatus = await verifyCode(email, emailCode, res)
  if (codeStatus) {
    // 更新邮箱
    const sql1 = 'update admin set email=? where id=?'
    await query(sql1, [email, req.user.id], db)
    res.send({code: 20000, msg: '修改成功'})
  }
}

