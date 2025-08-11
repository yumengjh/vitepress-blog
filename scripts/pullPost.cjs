const { execSync } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function copyDirTo(src, dest, excludeDirs = []) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    // 如果是目录且在排除列表中，则跳过
    if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
      console.log(`跳过目录: ${entry.name}`);
      continue;
    }

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirTo(srcPath, destPath, excludeDirs);
    } else {
      // 直接覆盖写入
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (err) {
    // 如果访问失败，说明文件夹不存在，需要创建
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`${dirPath} 文件夹已创建`);
  }
}

async function fetchDocs() {
  console.log('开始拉取私有仓库文档...');

  const token = process.env.VITE_GITHUB_TOKEN;
  if (!token) {
    throw new Error('VITE_GITHUB_TOKEN 未设置');
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
    async function deleteFolder(folder) {
      const folderToDelete = path.join('temp-docs', folder);
      try {
        await fs.rm(folderToDelete, { recursive: true, force: true });
        console.log(`已删除文件夹: ${folderToDelete}`);
      } catch (err) {
        console.warn(`删除文件夹 ${folderToDelete} 失败:`, err.message);
      }
    }
    await deleteFolder('scripts');
    await deleteFolder('.github');

    console.log('删除.git、LICENSE、README.md 完成');

    // 确保多语言目录存在
    await ensureDirectory('post');
    await ensureDirectory('en/post');
    await ensureDirectory('ja/post');

    // 多语言文档复制配置
    const copyConfigs = [
      {
        src: 'temp-docs',
        dest: 'post',
        description: '中文文档',
        excludeDirs: ['en', 'ja'] // 排除 en 和 ja 目录
      },
      {
        src: 'temp-docs/en',
        dest: 'en/post',
        description: '英文文档'
      },
      {
        src: 'temp-docs/ja',
        dest: 'ja/post',
        description: '日文文档'
      }
    ];

    // 执行多语言文档复制
    for (const config of copyConfigs) {
      try {
        // 检查源目录是否存在
        const srcExists = await fs.access(config.src).then(() => true).catch(() => false);
        
        if (srcExists) {
          // 获取源目录下的所有.md文件
          const entries = await fs.readdir(config.src, { withFileTypes: true });
          const mdFiles = entries.filter(entry => 
            entry.isFile() && entry.name.endsWith('.md')
          );

          if (mdFiles.length > 0) {
            console.log(`开始复制${config.description}...`);
            await copyDirTo(config.src, config.dest, config.excludeDirs);
            console.log(`${config.description}复制完成，共 ${mdFiles.length} 个文件`);
          } else {
            console.log(`${config.description}目录为空，跳过复制`);
          }
        } else {
          console.log(`${config.description}源目录不存在，跳过复制`);
        }
      } catch (err) {
        console.warn(`复制${config.description}时出错:`, err.message);
      }
    }

    // 删除临时文件夹，若遇 ENOTEMPTY 错误则重试
    async function removeTempDocs(retry = 3) {
      try {
        await fs.rm('temp-docs', { recursive: true, force: true });
        console.log('已删除临时文件夹 temp-docs');
      } catch (err) {
        if (err.code === 'ENOTEMPTY' && retry > 0) {
          console.warn(`temp-docs 目录未清空，重试删除... 剩余重试次数: ${retry}`);
          // 等待 500ms 后重试
          await new Promise(res => setTimeout(res, 500));
          await removeTempDocs(retry - 1);
        } else if (err.code === 'ENOENT') {
          // 文件夹本来就不存在
          console.log('temp-docs 文件夹不存在，无需删除');
        } else {
          console.error('删除 temp-docs 失败:', err);
        }
      }
    }
    await removeTempDocs();

    console.log('多语言云端文档拉取完成');
  } catch (err) {
    console.error('拉取文档失败:', err);
    process.exit(1);
  }
}

fetchDocs();