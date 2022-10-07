exports.validate = (reg_schema) => {
  return async(req,res,next)=>{
    try {
      await reg_schema.validateAsync(req.body);
      next()
    }catch(err){
      return res.send({
        code: 40001,
        msg: err.message,
      })
    }
  }
}
