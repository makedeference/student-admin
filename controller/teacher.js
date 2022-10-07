const db = require('../model/database')
const sqlQuery = require('../model/query')

// 获取老师列表
exports.getTeacherList = async (req, res) => {
  // 是否有查询条件
  const search = req.query
  const searchSql = res.getSearchSql(search)
  const sql = `SELECT * FROM teacher where is_delete = 0 ${searchSql}`
  let result = await sqlQuery(sql, null, db)
  res.send({
    status: 1,
    code: 20000,
    data: result
  })
}

// 添加老师
exports.addTeacher = async (req, res) => {
  const teacherInfo = req.body
  // 判断有没有班级id
  if (!teacherInfo.class_id) {
    delete teacherInfo.class_id
  }
  const sql = `INSERT INTO teacher set ?`
  let result = await sqlQuery(sql, teacherInfo, db)

  if (result.affectedRows === 1) {
    res.send({
      status: 1,
      code: 20000,
      msg: '添加成功'
    })
    return
  }
  res.send({
    status: 1,
    code: 40001,
    msg: '添加失败'
  })
}

// 修改老师
exports.editTeacher = async (req, res) => {
  const teacherInfo = req.body
  // 判断有没有教师id
  if (!teacherInfo.id) {
    res.send({
      status: 1,
      code: 40001,
      msg: '教师id不能为空'
    })
    return
  }
  const sql = `UPDATE teacher set ? where id = ${teacherInfo.id}`
  let result = await sqlQuery(sql, teacherInfo, db)

  if (result.affectedRows === 1) {
    res.send({
      status: 1,
      code: 20000,
      msg: '修改成功'
    })
    return
  }
  res.send({
    status: 1,
    code: 40001,
    msg: '修改失败'
  })
}

// 删除老师
exports.deleteTeacher = async (req, res) => {
  const id = req.params.id
  if (!id) {
    res.send({
      status: 1,
      code: 40001,
      msg: '教师id不能为空'
    })
    return
  }
  // 如果有班级id，不能删除
  const sql1 = `SELECT * FROM teacher where id = ${id}`
  let result1 = await sqlQuery(sql1, null, db)
  if (result1[0].class_id) {
    res.send({
      code: 40001,
      msg: '该教师有班级担任班主任s，不能删除'
    })
    return
  }

  const sql = `UPDATE teacher set is_delete = 1 where id = ${id}`
  let result = await sqlQuery(sql, null, db)

  if (result.affectedRows === 1) {
    res.send({
      code: 20000,
      msg: '删除成功'
    })
    return
  }
  res.send({
    code: 40001,
    msg: '删除失败'
  })
}
