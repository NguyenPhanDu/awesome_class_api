async function generateRandomCode(length) {
   try{
      var result           = [];
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result.push(characters.charAt(Math.floor(Math.random() * 
         charactersLength)));
      }
      return result.join('');
   }
   catch(err){
      console.log(err)
      return
   }
}

module.exports = generateRandomCode