const { execSync } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// 复制文件
async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true }); // 读取src目录下的所有文件和目录  withFileTypes: true 表示返回的是一个包含文件和目录的数组

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
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

    console.log('🗑️ 删除.git、LICENSE、README.md 完成');

    // 清空目标 docs 文件夹
    await fs.rm('./docs', { recursive: true, force: true });
    await fs.mkdir('./docs', { recursive: true });

    // 复制文档：用Node.js原生方法跨平台复制
    await copyDir('temp-docs', 'docs');

    // 删除临时文件夹
    await fs.rm('temp-docs', { recursive: true, force: true });

    console.log('✅ 文档拉取与处理完成');
  } catch (err) {
    console.error('❌ 拉取文档失败:', err);
    process.exit(1);
  }
}

fetchDocs();
