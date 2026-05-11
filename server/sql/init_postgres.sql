CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  avatar VARCHAR(255),
  role VARCHAR(20) DEFAULT 'visitor' CHECK (role IN ('admin', 'visitor')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(500),
  cover_image VARCHAR(255),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(10) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);

CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  content TEXT NOT NULL,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  tech_stack JSONB,
  cover_image VARCHAR(255),
  demo_url VARCHAR(255),
  repo_url VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stats (
  id BIGSERIAL PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  ip VARCHAR(45),
  referrer VARCHAR(500),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stats_path ON stats(path);
CREATE INDEX IF NOT EXISTS idx_stats_created ON stats(created_at);

INSERT INTO users (username, password, email, role) VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrqJ3Y9eYz1z5Vp3z5Yz1z5Vp3z5Yz1z5', 'admin@blog.com', 'admin') ON CONFLICT (username) DO NOTHING;

INSERT INTO categories (name, sort_order) VALUES ('前端开发', 1), ('后端开发', 2), ('DevOps', 3), ('随笔', 4) ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name, color) VALUES ('Vue', '#42b883'), ('React', '#61dafb'), ('TypeScript', '#3178c6'), ('Node.js', '#339933'), ('CSS', '#264de4'), ('JavaScript', '#f7df1e') ON CONFLICT (name) DO NOTHING;
