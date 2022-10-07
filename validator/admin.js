const Joi = require('joi')

// 用户名的验证规则
const username = Joi.string().alphanum().min(1).max(10).required().error(new Error('用户名不符合验证规则'))
// 用户密码的验证规则
const password = Joi.string().pattern(/^\S{6,12}$/).required()

const schema = Joi.object({
  username,
  password,
})

const updatePassword = Joi.object({
  // 新旧密码均需要md5加密
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required().not(Joi.ref('oldPassword')).error(new Error('新密码不能与旧密码相同')),
  confirmPassword: Joi.ref('newPassword')
})
const retrievePassword = Joi.object({
  // 这次密码不需要md5加密
  email: Joi.string().email().required(),
  emailCode: Joi.number().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.ref('newPassword')
})

// 登录
exports.reg_userLogin = schema
// 修改密码
exports.reg_updatePassword = updatePassword
// 找回密码
exports.reg_retrievePassword = retrievePassword


/*// 更新用户信息
exports.reg_updateUserInfo = {
  body: {
    nickname, email, user_pic
  }
}
// 修改密码
exports.reg_modifyPassword = {
  body: {
    oldPsw: password,
    // 1. joi.ref('oldPwd') 表示 newPwd 的值必须和 oldPwd 的值保持一致
    // 2. joi.not(joi.ref('oldPwd')) 表示 newPwd 的值不能等于 oldPwd 的值
    // 3. .concat() 用于合并 joi.not(joi.ref('oldPwd')) 和 password 这两条验证规则
    newPsw: joi.not(joi.ref('oldPsw')).concat(password),
  }
}
// 更新头像
exports.reg_updateAvatar = {
  body: {
    user_pic,
  }
}*/
