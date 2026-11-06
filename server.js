import app from './app.js'
import dotenv from 'dotenv'
dotenv.config()
const PORT = process.env.PORT || 3200

app.listen(PORT, () =>console.log(`🚀 API online em http://localhost:${PORT}`))
