const express = require('express')
const router = express.Router()
const { validate } = require('../middleware/validation')
const adminController = require('../controller/admin')
const { reg_userLogin, reg_updatePassword, reg_retrievePassword } = require('../validator/admin')
const { reg_verifyCode } = require('../validator/emailcode')

// 登录
router.post('/login', validate(reg_userLogin), adminController.login)
// 获取用户信息
router.get('/adminInfo', adminController.adminInfo)
// 退出登录
router.get('/logout', adminController.logout)
// 修改密码
router.post('/updatePassword', validate(reg_updatePassword), adminController.updatePassword)
// 获取邮箱验证码
router.post('/getEmailCode', adminController.getEmailCode)
// 找回密码
router.post('/retrievePassword', validate(reg_retrievePassword), adminController.retrievePassword)
// 换绑邮箱 - 验证码确认
router.post('/confirmEmailCode', validate(reg_verifyCode), adminController.confirmEmailCode)
// 换绑邮箱 - 修改邮箱
router.post('/updateEmail',  validate(reg_verifyCode), adminController.updateEmail)

module.exports = router
