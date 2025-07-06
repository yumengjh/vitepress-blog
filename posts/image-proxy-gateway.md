---
title: 使用NestJS做一个图片代理网关，referer限制，IP限制，token验证
date: 2025-07-06
category: Note
tags: 
    - Nest.js
description: 
outline: [2,3]
draft: false
sticky: false
cbf: false
zoomable: true
publish: true
AutoAnchor: false
aside: false
---


```ts
import { Controller, Get, Post, Req, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './image-gateway.service';
import { Request, Response } from 'express';
import { AppConfigService } from '../ConfigService';

// 图片代理控制器
@Controller('image')
export class ImageProxyController {
  private readonly token = 'admin';

  constructor(
    private readonly appService: AppService,
    private readonly appConfigService: AppConfigService
  ) { }

  // 动态获取允许的域名列表
  private get allowedDomains(): string[] {
    return this.appConfigService.getAllowedDomains();
  }

  // IP 白名单列表
  private readonly allowedIPs = [
    // '127.0.0.1',        // 本地回环
    // '::1',              // IPv6 本地回环
    // '192.168.1.100',    // 你的局域网 IP
    // '192.168.220.1',    // 你的局域网 IP（根据之前的信息）
    // '10.0.0.0/8',       // 内网段
    // '172.16.0.0/12',    // 内网段
    // '192.168.0.0/16',   // 内网段
    // 你可以添加更多 IP 或 IP 段
    '*'
  ];

  // 验证 IP 地址
  private validateIP(ip: string): boolean {
    if (!ip) {
      return false;
    }

    // 检查是否在白名单中
    return this.allowedIPs.some(allowedIP => {
      // 如果是通配符 *，允许所有 IP
      if (allowedIP === '*') {
        return true;
      }
      // 如果是 CIDR 格式（如 192.168.0.0/16）
      if (allowedIP.includes('/')) {
        return this.isIPInRange(ip, allowedIP);
      }
      // 直接 IP 匹配
      return ip === allowedIP;
    });
  }

  // 检查 IP 是否在指定范围内
  private isIPInRange(ip: string, cidr: string): boolean {
    try {
      const [range, bits] = cidr.split('/');
      const mask = ~((1 << (32 - parseInt(bits))) - 1);
      const ipLong = this.ipToLong(ip);
      const rangeLong = this.ipToLong(range);
      return (ipLong & mask) === (rangeLong & mask);
    } catch (error) {
      return false;
    }
  }

  // IP 地址转长整型
  private ipToLong(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  // 获取真实 IP 地址
  private getRealIP(req: Request): string {
    // 按优先级获取 IP
    return req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown';
  }

  // 验证 Referer
  private validateReferer(referer: string): boolean {

    if (!referer) {
      return true
      return false; // 没有 Referer 直接拒绝
    }

    try {
      const url = new URL(referer);
      const host = url.hostname + (url.port ? `:${url.port}` : '');

      return this.allowedDomains.some(domain => {
        // 支持通配符匹配
        if (domain.startsWith('*.')) {
          const wildcardDomain = domain.slice(2);
          return host === wildcardDomain || host.endsWith('.' + wildcardDomain);
        }
        return host === domain;
      });
    } catch (error) {
      return false; // URL 解析失败，拒绝请求
    }
  }

  // 配置管理接口
  @Get('config/domains')
  async getCurrentDomains() {
    return {
      success: true,
      data: {
        allowedDomains: this.allowedDomains,
        timestamp: new Date().toISOString()
      }
    };
  }

  @Post('config/refresh')
  async refreshConfig() {
    try {
      // 清除缓存并重新加载
      await this.appConfigService.clearCacheAndReload();
      return {
        success: true,
        message: '配置刷新成功',
        data: {
          allowedDomains: this.allowedDomains,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('配置刷新失败:', error);
      return {
        success: false,
        message: '配置刷新失败，使用默认配置',
        data: {
          allowedDomains: this.allowedDomains,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // 匹配 image/后所有路径（包括多级目录和文件名）
  @Get('*path')
  async proxyImage(
    @Req() req: Request,
    @Res() res: Response,
    @Query('token') token: string
  ) {
    // 1. 校验token
    // 如果没有token则跳过验证，有token则进行验证
    if (token && token !== this.token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // 2. 校验 IP 地址
    const realIP = this.getRealIP(req);
    // console.log('Client IP:', realIP);
    if (!this.validateIP(realIP)) {
      throw new HttpException('IP not allowed', HttpStatus.FORBIDDEN);
    }

    // 3. 校验 Referer
    const referer = req.headers.referer || req.headers.referrer;
    // console.log('Referer:', referer);
    if (!this.validateReferer(referer as string)) {
      throw new HttpException('Invalid Referer', HttpStatus.FORBIDDEN);
    }

    // 4. 获取原始图片路径（去掉 /image/ 前缀）
    const imgPath = req.path.replace(/^\/image\//, '');

    // 5. 代理图片
    return this.appService.proxyImage(imgPath, res);
  }
}
```

```ts
import { Injectable, Scope, HttpException, HttpStatus, ImATeapotException } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

@Injectable()
export class AppService {
  // 图片代理方法
  async proxyImage(imgPath: string, res: Response) {
    // 拼接原始图片地址
    const originUrl = `https://****.*****.**/${imgPath}`;

    try {
      // 拉取图片内容
      const response = await axios.get(originUrl, {
        responseType: 'stream',
      });

      // 设置响应头
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时

      // 直接把图片流返回给前端
      response.data.pipe(res);
    } catch (err) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }
}
```

示例：

图片地址：https://api.yumeng.icu/image/test/2025-07-05/224223.jpg

![](https://api.yumeng.icu/image/test/2025-07-05/224223.jpg?token=admin){width=100% title=图片来自Pixiv}