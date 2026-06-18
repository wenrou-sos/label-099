import app from './app.js'
import { connectDB } from './config/database.js'
import seed from './seed.js'

const PORT = process.env.PORT || 3001

const startServer = async (): Promise<void> => {
  try {
    await connectDB()
    await seed()

    const server = app.listen(PORT, () => {
      console.log(`\n🎉 Server ready on port ${PORT}`)
      console.log(`📍 API Base:    http://localhost:${PORT}/api`)
      console.log(`💚 Health:     http://localhost:${PORT}/api/health`)
      console.log(`\n👤 Test accounts (password: 123456):`)
      console.log(`   专家: lidoctor / wangnanny`)
      console.log(`   用户: tianxinmama / doudouma / guoguomami\n`)
    })

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('SIGINT signal received')
      server.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
