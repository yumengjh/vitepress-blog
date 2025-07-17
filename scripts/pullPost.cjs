const { execSync } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function copyDirTo(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirTo(srcPath, destPath);
    } else {
      // 直接覆盖写入
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function fetchDocs() {
  console.log('🚀 开始拉取私有仓库文档...');

  const token = process.env.VITE_GITHUB_TOKEN;
  if (!token) {
    throw new Error('❌ VITE_GITHUB_TOKEN 未设置');
  }

  const repoUrl = `https://${token}@github.com/yumengjh/note-data.git`;

  try {
    // 克隆仓库
    execSync(`git clone --depth=1 ${repoUrl} temp-docs`, { stdio: 'inherit' });

    // 删除多余文件
    await fs.rm(path.join('temp-docs', '.git'), { recursive: true, force: true });
    await fs.rm(path.join('temp-docs', 'LICENSE'), { force: true });
    await fs.rm(path.join('temp-docs', 'README.md'), { force: true });
    await fs.rm(path.join('temp-docs', 'package-lock.json'), { force: true });
    await fs.rm(path.join('temp-docs', 'package.json'), { force: true });
    await fs.rm(path.join('temp-docs', '.gitignore'), { force: true });
    const folderToDelete = path.join('temp-docs', 'scripts');
    try {
      await fs.rm(folderToDelete, { recursive: true, force: true });
      console.log(`🗑️ 已删除文件夹: ${folderToDelete}`);
    } catch (err) {
      console.warn(`⚠️ 删除文件夹 ${folderToDelete} 失败:`, err.message);
    }

    console.log('🗑️ 删除.git、LICENSE、README.md 完成');

    // 清空目标 docs 文件夹
    // await fs.rm('./docs', { recursive: true, force: true });
    // await fs.mkdir('./docs', { recursive: true });

    // 判断是否存在posts文件夹，如果不存在则创建
    try {
      await fs.access('posts');
    } catch (err) {
      // 如果访问失败，说明posts文件夹不存在，需要创建
      await fs.mkdir('posts', { recursive: true });
      console.log('📁 posts 文件夹已创建');
    }

    // 复制文档：用Node.js原生方法跨平台复制
    await copyDirTo('temp-docs', 'posts');

    // 删除临时文件夹
    await fs.rm('temp-docs', { recursive: true, force: true });

    console.log('✅ 云端文档合并至 posts/ 完成');
  } catch (err) {
    console.error('❌ 拉取文档失败:', err);
    process.exit(1);
  }
}

fetchDocs();
