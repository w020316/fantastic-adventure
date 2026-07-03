import { z } from 'zod'

export const articleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImage: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
})

export const tagSchema = z.object({
  name: z.string().min(1).max(30),
  slug: z.string().min(1).max(30).regex(/^[a-z0-9-]+$/),
})

export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  nickname: z.string().min(1).max(30),
  email: z.string().email().optional().or(z.literal('')),
  articleId: z.string().min(1),
  parentId: z.string().optional(),
})

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
  // honeypot：正常用户留空，机器人可能填写
  website: z.string().max(0).optional().or(z.literal('')),
})

export const projectMetricSchema = z.object({
  label: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  suffix: z.string().optional(),
  display: z.string().optional(),
})

export const projectSchema = z.object({
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional().or(z.literal('')),
  description: z.string().min(1),
  impact: z.string().optional().or(z.literal('')),
  metrics: z.array(projectMetricSchema).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  repoUrl: z.string().url().optional().or(z.literal('')),
  caseStudyUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string()),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})
