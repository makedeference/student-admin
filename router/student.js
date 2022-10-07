const express = require('express')
const router = express.Router()
const studentController = require('../controller/student')
const { validate } = require('../middleware/validation')
const { reg_add_student } = require('../validator/student')
// 文件上传插件
const multer = require('multer')
const path = require('path')

const upload = multer({
  dest: path.join(__dirname, '../public/upload/avatar')
})

// 创建文件上传的处理器
const upload1 = multer({
  dest: path.join(__dirname, '../public/upload/excel'),
})

// 添加学生
router.post('/addStudent', validate(reg_add_student), studentController.addStudent)
// 头像上传
router.post('/upload/avatar', upload.single('file'), studentController.uploadAvatar)
// 修改学生信息
router.post('/updateStudent', validate(reg_add_student), studentController.updateStudent)
// 获取学生列表
router.get('/getStudentList/:status/:page?/:pageSize?', studentController.getStudentList)
// 获取学生信息
router.get('/getStudentInfo/:id', studentController.getStudentInfo)
// 删除学生
router.delete('/deleteStudent/:id', studentController.deleteStudent)
// 彻底删除学生
router.delete('/deleteStudentForever/:id', studentController.deleteStudentForever)
// 批量彻底删除学生
router.delete('/deleteStudentForeverBatch', studentController.deleteStudentForeverBatch)
// 恢复学生
router.put('/recoverStudent/:id', studentController.recoverStudent)
// 批量删除学生
router.delete('/batchDeleteStudent', studentController.deleteStudentBatch)
// 批量恢复学生
router.put('/batchRecoverStudent', studentController.recoverStudentBatch)
// 导出Excel
router.post('/exportExcel', studentController.exportExcel)
// 导入Excel
router.post('/importExcel', upload1.single('file'), studentController.importExcel)

module.exports = router
