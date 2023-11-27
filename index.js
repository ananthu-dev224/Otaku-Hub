const express = require('express')
const app = express()

const PORT = 3000 || process.env.PORT









app.listen(PORT,'localhost',()=>{
   console.log(`Server started at https://localhost:${PORT}`);
})