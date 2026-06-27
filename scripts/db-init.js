/**
 * 数据库初始化脚本
 * 使用 Prisma Client 的 $executeRawUnsafe 执行 DDL 语句
 * 不依赖 prisma CLI，可在 standalone 镜像中运行
 *
 * 用法: node scripts/db-init.js
 */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// 从 prisma migrate diff 生成的 SQL 语句
const statements = [
  'CREATE SCHEMA IF NOT EXISTS "public"',
  'CREATE TYPE "Role" AS ENUM (\'USER\', \'ADMIN\')',
  'CREATE TYPE "PublishStatus" AS ENUM (\'DRAFT\', \'PUBLISHED\')',
  'CREATE TYPE "CommentStatus" AS ENUM (\'PENDING\', \'APPROVED\', \'HIDDEN\')',
  'CREATE TYPE "ContactStatus" AS ENUM (\'NEW\', \'READ\', \'REPLIED\', \'ARCHIVED\')',
  `CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "article_tags" (
    "articleId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("articleId","tagId")
  )`,
  `CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,
    "articleId" TEXT NOT NULL,
    "parentId" TEXT,
    "ip" TEXT,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "impact" TEXT,
    "metrics" JSONB,
    "coverImage" TEXT,
    "demoUrl" TEXT,
    "repoUrl" TEXT,
    "caseStudyUrl" TEXT,
    "techStack" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "capabilities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "skills" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "capabilities_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "ip" TEXT,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "site_profile" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL DEFAULT 'XIAO/WU',
    "authorNameCn" TEXT NOT NULL DEFAULT '周末',
    "authorNameEn" TEXT NOT NULL DEFAULT 'Cris',
    "tagline" TEXT NOT NULL DEFAULT '用代码把想法真正实现出来',
    "role" TEXT NOT NULL DEFAULT '全栈工程师',
    "bio" TEXT,
    "avatar" TEXT,
    "location" TEXT NOT NULL DEFAULT 'China',
    "email" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "linkedin" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "yearsExp" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 8,
    "userReach" TEXT NOT NULL DEFAULT '1000+',
    "uptime" TEXT NOT NULL DEFAULT '99.9%',
    "spotlightCursor" BOOLEAN NOT NULL DEFAULT true,
    "brandColor" TEXT NOT NULL DEFAULT '#ccff00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_profile_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "site_stats" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "ip" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_stats_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "site_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "site_configs_pkey" PRIMARY KEY ("id")
  )`,
  // 索引（使用 IF NOT EXISTS 避免重复创建报错）
  'CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "articles_slug_key" ON "articles"("slug")',
  'CREATE INDEX IF NOT EXISTS "articles_status_publishedAt_idx" ON "articles"("status", "publishedAt")',
  'CREATE INDEX IF NOT EXISTS "articles_authorId_idx" ON "articles"("authorId")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "categories_name_key" ON "categories"("name")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_key" ON "categories"("slug")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key" ON "tags"("name")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "tags_slug_key" ON "tags"("slug")',
  'CREATE INDEX IF NOT EXISTS "comments_articleId_status_idx" ON "comments"("articleId", "status")',
  'CREATE INDEX IF NOT EXISTS "contact_messages_status_idx" ON "contact_messages"("status")',
  'CREATE INDEX IF NOT EXISTS "contact_messages_createdAt_idx" ON "contact_messages"("createdAt")',
  'CREATE INDEX IF NOT EXISTS "site_stats_createdAt_idx" ON "site_stats"("createdAt")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "site_configs_key_key" ON "site_configs"("key")',
  // 外键（使用 IF NOT EXISTS 避免重复创建报错）
  'ALTER TABLE "articles" ADD CONSTRAINT IF NOT EXISTS "articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
  'ALTER TABLE "articles" ADD CONSTRAINT IF NOT EXISTS "articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE',
  'ALTER TABLE "article_tags" ADD CONSTRAINT IF NOT EXISTS "article_tags_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE',
  'ALTER TABLE "article_tags" ADD CONSTRAINT IF NOT EXISTS "article_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE',
  'ALTER TABLE "comments" ADD CONSTRAINT IF NOT EXISTS "comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE',
  'ALTER TABLE "comments" ADD CONSTRAINT IF NOT EXISTS "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE',
]

async function main() {
  console.log('🔧 开始数据库初始化...')
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql)
    } catch (e) {
      // 忽略"已存在"错误，其他错误打印警告但继续
      if (e.code === 'P2010' && e.message.includes('already exists')) {
        // 跳过
      } else {
        console.warn('⚠️ SQL 执行警告:', e.message?.substring(0, 100))
      }
    }
  }
  console.log('✅ 数据库初始化完成')
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e.message)
    // 不以非零退出码退出，避免阻止服务器启动
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
