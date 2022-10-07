const Joi = require('joi')

const schema = Joi.object({
  id: Joi.number().integer().min(1).allow(null),
  class: Joi.number().allow(null),
  create_time: Joi.allow(null),
  update_time: Joi.allow(null),
  is_delete: Joi.number().integer().valid(0, 1).allow(null),
  name: Joi.string().min(1).max(10).required().error(new Error('用户名不符合验证规则')),
  sex: Joi.string().valid('男', '女').required().error(new Error('性别不符合验证规则')),
  remark: Joi.string().valid(0, 1, 2).required().error(new Error('备注不符合要求')),
  id_number : Joi.string().min(1).max(100).required().error(new Error('身份证号不符合验证规则')),
  // 头像可要可不要
  avatar: Joi.string().allow(null).allow('').error(new Error('头像不符合验证规则')),
  father_name: Joi.string().required().error(new Error('父亲姓名不符合验证规则')),
  father_tel: Joi.string().required().error(new Error('父亲电话不符合验证规则')),
  address: Joi.string().required().error(new Error('地址不符合验证规则')),
})

exports.reg_add_student = schema
