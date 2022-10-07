const express = require('express')
const router = express.Router()
const teacherController = require('../controller/teacher')
const expressJoi = require('@escook/express-joi')
const { reg_add_teacher } = require('../validator/teacher')

// 获取老师列表
router.get('/getTeacherList', teacherController.getTeacherList)
// 添加老师
router.post('/addTeacher', expressJoi(reg_add_teacher), teacherController.addTeacher)
// 修改老师
router.post('/editTeacher', expressJoi(reg_add_teacher), teacherController.editTeacher)
// 删除老师
router.delete('/deleteTeacher/:id', teacherController.deleteTeacher)

module.exports = router
