exports.sqlSearch = () => {
  return (req, res,next) => {
    // 增加数据库全局方法 按条件查询
    res.getSearchSql = (searchObj) => {
      let sql = ''
      for (let key in searchObj) {
        if (key.indexOf('Time') === -1) {
          sql += ` AND ${key} LIKE '%${searchObj[key]}%'`
        }
      }
      return sql
    }
    // 增加数据库全局方法 按时间范围查询
    res.getRangeSql = (searchObj, keys = ['create_time', 'startTime', 'endTime']) => {
      let sql = ''
      sql += ` AND ${keys[0]} BETWEEN '${searchObj[keys[1]]}' AND '${searchObj[keys[2]]}'`
      return sql
    }
    next()
  }
}
