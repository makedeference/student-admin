const db = require('../model/database')
const sqlQuery = require('../model/query')
const dayjs = require('dayjs')
const path = require("path")
const fs = require("fs")
// 引入exceljs
const xlsx = require('node-xlsx')

// 添加学生
exports.addStudent = async (req, res) => {
  const studentInfo = req.body
  // 检查身份证号是否已存在
  let is_idCard_exist = await sqlQuery('SELECT * FROM student WHERE id_number = ?', [studentInfo.id_number], db)
  // 如果身份证号已存在
  if (is_idCard_exist.length > 0) {
    // 如果身份证号已存在，且删除状态为0，说明该学生已存在
    if (is_idCard_exist[0].is_delete === 0) {
      res.json({
        code: 40001,
        msg: '该学生已存在'
      })
      return
    }
    // 如果身份证号已存在，且删除状态为1，说明该学生已被删除，可以恢复
    if (is_idCard_exist[0].is_delete === 1) {
      studentInfo.is_delete = 0
      const sql = `UPDATE student SET ? WHERE id = ${is_idCard_exist[0].id}`
      const result = await sqlQuery(sql, studentInfo, db)
      if (result.affectedRows > 0) {
        res.json({
          code: 20000,
          msg: '已将该学生从误删库中恢复, 并且已更新信息'
        })
      } else {
        res.json({
          code: 40001,
          msg: '恢复失败'
        })
      }
    }
    return
  }
  // 如果不存在，就添加
  studentInfo.create_time = dayjs().format('YYYY-MM-DD HH:mm:ss')
  let result = await sqlQuery('INSERT INTO student SET ?', studentInfo, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '添加成功'
    })
  }
}

// 头像上传
exports.uploadAvatar = async (req, res) => {
  const file = req.file
  if (file) {
    // 获取后缀
    const ext = path.extname(file.originalname)
    // 重命名
    const random = Math.floor(Math.random() * 9999999)
    let oldName = file.path //获取path: 'public\\upload\\0f625978d5d1a783b12e149718f8b634',
    let newName = path.join(__dirname, '../public/upload/avatar/' + random + ext)
    fs.renameSync(oldName, newName)//将老的文件名改成新的有后缀的文件 #同步写法
    res.send({
      code: 20000,
      data: 'http://127.0.0.1:8080/uploads/avatar/' + random + ext
    })
  } else {
    res.send({
      code: 40001,
      data: '请选择正确的文件'
    })
  }
}

// 修改学生信息
exports.updateStudent = async (req, res) => {
  const studentInfo = req.body
  studentInfo.create_time = dayjs(studentInfo.create_time).format('YYYY-MM-DD HH:mm:ss')
  studentInfo.update_time = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  const sql = `UPDATE student SET ? WHERE id = ${studentInfo.id}`
  const result = await sqlQuery(sql, studentInfo, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '修改成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '修改失败'
    })
  }
}

// 获取学生列表
exports.getStudentList = async (req, res) => {
  const page = req.params.page || 1
  const pageSize = req.params.pageSize || 10
  const status = req.params.status || '0'
  let is_delete
  // 0 2 分别是在校生和已毕业生 1是已删除
  if (status === '0' || status === '2') {
    is_delete = 0
  } else {
    is_delete = 1
  }
  // 获取查询参数
  const searchObj = req.query
  // 模糊查询
  const tempSql = res.getSearchSql(searchObj)
  // 范围查询
  let tempSql2 = ''
  if (searchObj['startTime']) {
    tempSql2 = res.getRangeSql(searchObj)
  }
  // 查询年满三年及以下的学生
  let tempSql3 = ''
  if (status === '0') {
    tempSql3 = ` AND TIMESTAMPDIFF(DAY, student.create_time, CURDATE()) <= 3 * 365`
  }
  // 查询年满三年及以上的学生
  if (status === '2') {
    tempSql3 = ` AND TIMESTAMPDIFF(DAY, student.create_time, CURDATE()) > 3 * 365`
  }

  // 合并sql
  const sql = `SELECT * FROM student  where is_delete = ${is_delete} ${tempSql} ${tempSql2} ${tempSql3} LIMIT ${(page - 1) * pageSize}, ${pageSize}`
  const sql2 = `SELECT * FROM student where is_delete = ${is_delete} ${tempSql} ${tempSql2} ${tempSql3}`
  // 执行sql
  let result = await sqlQuery(sql, null, db)
  let result2 = await sqlQuery(sql2, null, db)

  // 返回数据
  if (result.length > 0) {
    res.json({
      code: 20000,
      data: result,
      total: result2.length
    })
  } else {
    res.json({
      code: 20000,
      msg: '没有数据'
    })
  }
}

// 获取学生信息
exports.getStudentInfo = async (req, res) => {
  const id = req.params.id
  if (id === 'undefined') {
    res.json({
      code: 40001,
      msg: 'id不能为空'
    })
    return
  }
  const sql = `SELECT * FROM student WHERE id = ${id} and is_delete = 0`
  const result = await sqlQuery(sql, null, db)
  if (result.length > 0) {
    res.json({
      code: 20000,
      data: result[0]
    })
  }
}

// 删除学生
exports.deleteStudent = async (req, res) => {
  const id = req.params.id
  if (id === 'undefined') {
    res.json({
      code: 40001,
      msg: 'id不能为空'
    })
    return
  }
  const sql = `UPDATE student SET is_delete = 1 WHERE id = ${id}`
  const result = await sqlQuery(sql, null, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '删除成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '删除失败'
    })
  }
}

// 彻底删除学生
exports.deleteStudentForever = async (req, res) => {
  const id = req.params.id
  if (id === 'undefined') {
    res.json({
      code: 40001,
      msg: 'id不能为空'
    })
    return
  }
  const sql = `DELETE FROM student WHERE id = ${id}`
  const result = await sqlQuery(sql, null, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '删除成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '删除失败'
    })
  }
}

// 批量彻底删除学生
exports.deleteStudentForeverBatch = async (req, res) => {
  const ids = req.body
  if (ids.length === 0) {
    res.json({
      code: 40001,
      msg: 'id不能为空'
    })
    return
  }
  const sql = `DELETE FROM student WHERE id in (${ids})`
  const result = await sqlQuery(sql, null, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '删除成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '删除失败'
    })
  }
}

// 恢复学生
exports.recoverStudent = async (req, res) => {
  const id = req.params.id
  if (id === 'undefined') {
    res.json({
      code: 40001,
      msg: 'id不能为空'
    })
    return
  }
  const sql = `UPDATE student SET is_delete = 0 WHERE id = ${id}`
  const result = await sqlQuery(sql, null, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '恢复成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '恢复失败'
    })
  }
}

// 批量删除学生
exports.deleteStudentBatch = async (req, res) => {
  const ids = req.body
  if (ids.length === 0) {
    res.json({
      code: 40001,
      msg: 'id不能为空, 请选择要删除的学生'
    })
    return
  }
  const sql = `UPDATE student SET is_delete = 1 WHERE id in (${ids})`
  const result = await sqlQuery(sql, null, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '删除成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '删除失败'
    })
  }
}

// 批量恢复学生
exports.recoverStudentBatch = async (req, res) => {
  const ids = req.body
  console.log(ids)
  if (ids.length === 0) {
    res.json({
      code: 40001,
      msg: 'id不能为空'
    })
    return
  }
  const sql = `UPDATE student SET is_delete = 0 WHERE id in (${ids})`
  const result = await sqlQuery(sql, null, db)
  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '恢复成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '恢复失败'
    })
  }
}

// 导出学生
exports.exportExcel = async (req, res) => {
  const exportInfo = req.body
  // 将数据写入excel
  const data = [
    // 表头
    exportInfo.tag.map(item => [item.label]),
    // 数据
    ...exportInfo.student.map((item) => {
      return exportInfo.tag.map((tag) => {
        // 选择导出的字段
        return item[tag.key]
      })
    })
  ]
  // 将数据写入excel
  const buffer = xlsx.build([{ name: '课程分类', data }])
  // 设置响应头
  res.setHeader('Content-Type', 'application/vnd.openxmlformats')
  res.setHeader('Content-Disposition', 'attachment; filename=studentInfo.xlsx')
  res.send(buffer)
}

// 导入学生
exports.importExcel = async (req, res) => {
  const file = req.file
  // 读取excel
  const data = xlsx.parse(file.path)
  // 如果excel中没有数据
  if (data[0].data.length === 0) {
    res.json({
      code: 40001,
      msg: 'excel中没有数据'
    })
    return
  }
  // 获取表头
  const tag = data[0].data[0].map(item => item.replace(/\s+/g, ''))
  // 表头对应的字段
  const tagMap = {
    name: '姓名',
    sex: '性别',
    class: '班级',
    father_name: '监护人',
    father_tel: '联系电话',
    address: '住址',
    id_number: '身份证',
    create_time: '入学时间',
    remark: '备注'
  }
  // 获取表头对应的字段
  const tagKey = tag.map(item => {
    return Object.keys(tagMap).find(key => tagMap[key] === item)
  })
  // 删除undefined
  while (tagKey.indexOf(undefined) > -1) {
    tagKey.splice(tagKey.indexOf(undefined), 1)
  }
  // 需要的字段必须存在
  if (tagKey.length < 7) {
    res.json({
      code: 40001,
      msg: '表头字段不正确,必须要有 姓名,性别,监护人,联系电话,住址和身份证 入学时间 这6个字段'
    })
    return
  }
  // 获取表头字段的位置
  const tagIndex = tagKey.map(item => tag.indexOf(tagMap[item]))
  // 电话，班级,备注,身份证号的位置
  const telIndex = tagKey.indexOf('father_tel')
  const classIndex = tagKey.indexOf('class')
  const remarkIndex = tagKey.indexOf('remark')
  const idIndex = tagKey.indexOf('id_number')
  const createIndex = tagKey.indexOf('create_time')
  // 获取数据
  const student = data[0].data.slice(1)
  // 获取需要的数据
  const studentInfo = student.map(item => {
    return tagIndex.map(index => item[index])
  })
  // 获取班级信息
  const classInfo = await sqlQuery('SELECT id, name FROM class', null, db)
  console.log(classInfo)
  // 修改班级和备注的数据
  studentInfo.forEach(item => {
    item[telIndex] = item[telIndex].toString()
    item[createIndex] = new Date(item[createIndex])
    item[classIndex] = classInfo.find(classItem => classItem.name === item[classIndex]).id
    if (item[remarkIndex] === '无') {
      item[remarkIndex] = 0
    } else if (item[remarkIndex] === '低收入') {
      item[remarkIndex] = 1
    } else if (item[remarkIndex] === '低保户') {
      item[remarkIndex] = 2
    }
  })
  // 删除文件
  fs.unlinkSync(file.path)
  // 写入数据库之前检验表格 身份证号码不能重复 获得表格中所有的身份证号码
  const idNumber = studentInfo.map(item => item[idIndex])
  const idNumberSet = new Set(idNumber)
  // 去重后的长度和原来的长度不一样，说明有重复的
  if (idNumber.length !== idNumberSet.size) {
    res.json({
      code: 40001,
      msg: '表格中有身份证号码重复的学生,请检查后在提交'
    })
    return
  }
  // 与数据库中的数据对比
  const sql = `SELECT id_number FROM student WHERE is_delete = 0`
  const result = await sqlQuery(sql, null, db)
  // 获得数据库中所有的身份证号码
  const idNumberDB = result.map(item => item.id_number)
  const idNumberDBSet = new Set(idNumberDB)
  // 表格中的身份证号码与数据库中的身份证号码对比 返回数组形式
  const idNumberDBRepeat = idNumber.filter(item => idNumberDBSet.has(item))
  // 数据库中已存在的数据
  if (idNumberDBRepeat.length > 0) {
    res.json({
      code: 40001,
      msg: `身份证号码为 ${idNumberDBRepeat.join(',')} 的数据已存在`
    })
    return
  }
  // 将数据写入数据库
  const sql1 = `INSERT INTO student (${tagKey.join(',')}) VALUES ?`
  const result1 = await sqlQuery(sql1, [studentInfo], db)
  if (result1.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '导入成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '导入失败'
    })
  }
}
