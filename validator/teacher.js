const Joi = require('joi')

const schema = Joi.object({
  // 添加教师的验证规则
  id: Joi.number().integer().min(1).allow(''),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  class_id: Joi.number().integer().min(1).allow(''),
  id_number: Joi.string().pattern(/^\d{17}[\dXx]$/).required(),
  join_time: Joi.date().required(),
})

exports.reg_add_teacher = schema
