const db = require('../model/database')
const sqlQuery = require('../model/query')

// 获取班级列表
exports.getClassList = async (req, res) => {
  const sql = 'SELECT * FROM class WHERE is_delete = 0'
  const result = await sqlQuery(sql, null, db)
  // 获取各班级的学生数量
  const sql1 = 'SELECT class, COUNT(*) AS student_count FROM student WHERE is_delete = 0 AND TIMESTAMPDIFF(DAY, student.create_time, CURDATE()) <= 3 * 365 GROUP BY class'
  const result1 = await sqlQuery(sql1, null, db)
  console.log(result1)
  // 给班级添加学生数量
  result.forEach(item => {
    result1.forEach(item1 => {
      if (item.id === item1.class) {
        item.student = item1.student_count
      }
    })
    if (!item.student) {
      item.student = 0
    }
  })

  if (result.length > 0) {
    res.json({
      code: 20000,
      data: result
    })
  } else {
    res.json({
      code: 20000,
      msg: '暂无数据'
    })
  }
}

// 添加班级
exports.addClass = async (req, res) => {
  const classInfo = req.body
  // 检查班级是否存在
  const sql1 = 'SELECT * FROM class WHERE name = ?'
  const result1 = await sqlQuery(sql1, [classInfo.name], db)
  if (result1.length > 0) {
    res.json({
      code: 40001,
      msg: '班级已存在'
    })
    return
  }

  const sql = 'INSERT INTO class set?'
  const result = await sqlQuery(sql, [classInfo], db)
  // 更新教师表中的班级id
  const sql2 = 'UPDATE teacher set class_id = ? WHERE id = ?'
  const result2 = await sqlQuery(sql2, [classInfo.id, classInfo.master_id], db)

  if (result.affectedRows > 0) {
    res.json({
      code: 20000,
      msg: '添加成功'
    })
  } else {
    res.json({
      code: 40001,
      msg: '添加失败'
    })
  }
}

// 修改班级
exports.updateClass = async (req, res) => {
  const classInfo = req.body
  // 检查班级是否存在
  const sql1 = 'SELECT * FROM class WHERE name = ? and id != ?'
  const result1 = await sqlQuery(sql1, [classInfo.name, classInfo.id], db)
  if (result1.length > 0) {
    res.json({
      code: 40001,
      msg: '班级已存在'
    })
    return
  }

  // 删除多余的键值对
  delete classInfo.student
  const sql = 'UPDATE class set? WHERE id = ?'
  const result = await sqlQuery(sql, [classInfo, classInfo.id], db)
  // 一个教师只能带一个班级，检查是否有其他班级
  const sql2 = 'SELECT * FROM class WHERE master_id = ? and id != ?'
  const result2 = await sqlQuery(sql2, [classInfo.master_id, classInfo.id], db)
  if (result2.length > 0) {
    // 有其他班级，删除原来的班级id
    res.json({
      code: 40001,
      msg: '一个老师只能是一个班的班主任'
    })
    return
  }
  // 更新教师表中的班级id
  const sql3 = 'UPDATE teacher set class_id = ? WHERE id = ?'
  const result3 = await sqlQuery(sql3, [classInfo.id, classInfo.master_id], db)

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

// 删除班级
exports.deleteClass = async (req, res) => {
  const id = req.params.id
  if (!id) {
    res.json({
      code: 40001,
      msg: '参数错误'
    })
    return
  }
  // 当有学生存在时，不允许删除 因为外键约束
  const sql1 = 'SELECT * FROM student WHERE is_delete=0 and class = ?'
  const result1 = await sqlQuery(sql1, [id], db)
  if (result1.length > 0) {
    res.json({
      code: 40001,
      msg: '班级中有学生，不允许删除'
    })
    return
  }

  // 真实删除
  const sql = 'DELETE FROM class WHERE id = ?'
  const result = await sqlQuery(sql, [id], db)
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
