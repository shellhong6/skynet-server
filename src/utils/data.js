module.exports = {
  format: function(val, mes, code, redirect){
    return {
      message: mes || '',
      code: code || 200,
      value: val,
      redirect: redirect || ''
    };
  }
}
