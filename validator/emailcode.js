const Joi = require("joi")

// 验证密码
const verifyCode = Joi.object({
  // 这次密码不需要md5加密
  email: Joi.string().email().required(),
  emailCode: Joi.number().required(),
})

// 登录
exports.reg_verifyCode = verifyCode
