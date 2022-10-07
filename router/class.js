const express = require('express')
const router = express.Router()
const classController = require('../controller/class')
const { validate } = require('../middleware/validation')
const { reg_add_class } = require('../validator/class')

// 获取班级列表
router.get('/getClassList/', classController.getClassList)
// 添加班级
router.post('/addClass', validate(reg_add_class), classController.addClass)
// 修改班级
router.put('/updateClass', classController.updateClass)
// 删除班级
router.delete('/deleteClass/:id', classController.deleteClass)



module.exports = router
