// 封装查询数据库的方法
function sqlQuery(sql, values, db) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results, fields) => {
      if (err) reject(err)
      resolve(results)
    })
  })
}

module.exports = sqlQuery
