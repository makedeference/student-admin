const Joi = require('joi')

const schema = Joi.object({
  id: Joi.number().integer().min(1).allow(null),
  name: Joi.string().required(),
  note: Joi.string().allow(null),
  master_id: Joi.number().integer().min(1).allow(null),
  master_name: Joi.string().allow(null),
  is_delete: Joi.number().integer().min(0).max(1).allow(null),
})

exports.reg_add_class = schema
