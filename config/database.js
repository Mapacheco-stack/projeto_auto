import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from '@prisma/client'

const { Pool } = pg
const { PrismaClient } = pkg


const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})


const adapter = new PrismaPg(pool)

// Instanciamos o Prisma passando o adaptador (exigência da v7!)
const prisma = new PrismaClient({ adapter })

export default prisma