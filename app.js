const express = require('express')
// 日志输出
const morgan = require('morgan')
const cors = require('cors')
const errorHandler = require('./middleware/error-handler')
const { jwtSecretKey } = require("./config/config")
const { sqlSearch } = require('./middleware/sqlSearch')
const expressJWT = require('express-jwt')

// 路由
const adminRouter = require('./router/admin')
const studentRouter = require('./router/student')
const classRouter = require('./router/class')
const teacherRouter = require('./router/teacher')

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/uploads', express.static('./public/upload'))

// 配置解析token的中间件
app.use(expressJWT({
  secret: jwtSecretKey,
}).unless({ path: [/^\/api\/admin\/login/, /^\/api\/student\/upload\//, /^\/api\/student\/importExcel/] }))

// 全局响应方法 数据库的模糊查询和范围查询
app.use(sqlSearch())

// 路由
app.use('/api/admin', adminRouter)
app.use('/api/student', studentRouter)
app.use('/api/class', classRouter)
app.use('/api/teacher', teacherRouter)

// 错误处理中间件
app.use(errorHandler())

app.listen(8080, () => {
  console.log(`Server running on http://127.0.0.1:8080`)
})
