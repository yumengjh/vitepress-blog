---
title: 基于 NestJS 框架实现了一个图片代理网关服务，安全的图片中转能力，主要应用于前端防盗链、跨源加载控制、资源访问加密等场景。
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
aside: true
---

## 核心代码

::: details image-gateway.controller.ts

```ts
import { Controller, Get, Post, Req, Res, Query, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './image-gateway.service';
import { Request, Response } from 'express';
import { AppConfigService, IPWhitelistService } from '../ConfigService';

// 图片代理控制器
@Controller('image')
export class ImageProxyController {
  private readonly token = 'admin';

  constructor(
    private readonly appService: AppService,
    private readonly appConfigService: AppConfigService,
    private readonly ipWhitelistService: IPWhitelistService
  ) { }

  // 动态获取允许的域名列表
  private get allowedDomains(): string[] {
    return this.appConfigService.getAllowedDomains();
  }

  // IP 白名单列表
  // 动态获取 IP 白名单列表
  private get allowedIPs(): string[] {
    return this.ipWhitelistService.getAllowedIPs();
  }

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
      return true; // 没有 Referer 允许访问
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

  // 统一的验证函数
  private validateRequest(req: Request, res: Response, token?: string): void {
    // 1. 校验token
    if (token && token !== this.token) {
      this.setNoCacheHeaders(res);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // 2. 校验 IP 地址
    const realIP = this.getRealIP(req);
    if (!this.validateIP(realIP)) {
      this.setNoCacheHeaders(res);
      throw new HttpException('IP not allowed', HttpStatus.FORBIDDEN);
    }

    // 3. 校验 Referer
    const referer = req.headers.referer || req.headers.referrer;
    if (!this.validateReferer(referer as string)) {
      this.setNoCacheHeaders(res);
      throw new HttpException('Invalid Referer', HttpStatus.FORBIDDEN);
    }
  }

  // 设置不缓存响应头
  private setNoCacheHeaders(res: Response): void {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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

  @Get('config/ips')
  async getCurrentIPs() {
    return {
      success: true,
      data: {
        allowedIPs: this.allowedIPs,
        timestamp: new Date().toISOString()
      }
    };
  }

  @Post('config/refresh')
  async refreshConfig() {
    try {
      // 清除缓存并重新加载所有配置
      await Promise.all([
        this.appConfigService.clearCacheAndReload(),
        this.ipWhitelistService.clearCacheAndReload()
      ]);

      return {
        success: true,
        message: '配置刷新成功',
        data: {
          allowedDomains: this.allowedDomains,
          allowedIPs: this.allowedIPs,
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
          allowedIPs: this.allowedIPs,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  @Post('config/refresh/domains')
  async refreshDomainsConfig() {
    try {
      await this.appConfigService.clearCacheAndReload();
      return {
        success: true,
        message: '域名配置刷新成功',
        data: {
          allowedDomains: this.allowedDomains,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('域名配置刷新失败:', error);
      return {
        success: false,
        message: '域名配置刷新失败，使用默认配置',
        data: {
          allowedDomains: this.allowedDomains,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  @Post('config/refresh/ips')
  async refreshIPsConfig() {
    try {
      await this.ipWhitelistService.clearCacheAndReload();
      return {
        success: true,
        message: 'IP白名单配置刷新成功',
        data: {
          allowedIPs: this.allowedIPs,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('IP白名单配置刷新失败:', error);
      return {
        success: false,
        message: 'IP白名单配置刷新失败，使用默认配置',
        data: {
          allowedIPs: this.allowedIPs,
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
    // 统一验证请求
    this.validateRequest(req, res, token);

    // 获取原始图片路径（去掉 /image/ 前缀）
    const imgPath = req.path.replace(/^\/image\//, '');

    // 代理图片
    return this.appService.proxyImage(imgPath, res);
  }

  // 也支持 POST 请求
  @Post('*path')
  async proxyImagePost(
    @Req() req: Request,
    @Res() res: Response,
    @Query('token') token: string
  ) {
    // 统一验证请求
    this.validateRequest(req, res, token);

    // 获取原始图片路径（去掉 /image/ 前缀）
    const imgPath = req.path.replace(/^\/image\//, '');

    // 代理图片
    return this.appService.proxyImage(imgPath, res);
  }
}
```
:::

::: details image-gateway.module.ts

```ts
import { Module } from '@nestjs/common';
import { ImageProxyController } from './image-gateway.controller';
import { AppService } from './image-gateway.service';
import { AppConfigService, IPWhitelistService } from '../ConfigService';

@Module({
  controllers: [ImageProxyController],
  providers: [AppService, AppConfigService, IPWhitelistService],
  exports: [AppService], // 导出服务，以便其他模块可以使用
})
export class ImageGatewayModule { } 
```

:::

::: details image-gateway.service.ts

```ts
import { Injectable, Scope, HttpException, HttpStatus, ImATeapotException } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

@Injectable()
export class AppService {
  // 图片代理方法
  async proxyImage(imgPath: string, res: Response) {
    // 拼接原始图片地址
    const originUrl = `https://image.yumeng.icu/${imgPath}`;

    try {
      // 拉取图片内容
      const response = await axios.get(originUrl, {
        responseType: 'stream',
      });

      // 设置响应头
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      // 为图片设置适当的缓存策略，但确保验证失败不会被缓存
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // 缓存1小时
      res.setHeader('Vary', 'Referer'); // 根据Referer变化缓存

      // 直接把图片流返回给前端
      response.data.pipe(res);
    } catch (err) {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }
}

```

:::

::: details ConfigService.ts

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AppConfigService implements OnModuleInit {
    private supabase: SupabaseClient;
    private allowedDomains: string[] = [];

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;


        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase 环境变量未配置，使用默认配置');
            this.allowedDomains = [
                'localhost:3000',
                'localhost:3001',
                'localhost:5000',
                'yumeng.icu',
                'www.yumeng.icu',
                'images.yumeng.icu'
            ];
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async onModuleInit() {
        await this.loadAllowedDomains();
    }

    async loadAllowedDomains() {
        // 如果没有配置 Supabase，直接返回
        if (!this.supabase) {
            console.log('使用默认配置，跳过数据库加载');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('app_config')
                .select('value')
                .eq('key', 'allowed_domains')
                .single(); // 查询结果必须只有一行

            if (error) {
                console.error('加载配置失败:', error);
                // 保持默认配置，不重置为空数组
                return;
            } else {
                try {
                    this.allowedDomains = JSON.parse(data.value);
                    console.log('加载允许域名:', this.allowedDomains);
                } catch (e) {
                    console.error('配置 JSON 解析失败:', e);
                    // 保持默认配置，不重置为空数组
                }
            }
        } catch (error) {
            console.error('Supabase 连接失败:', error);
            // 保持默认配置
        }
    }

    getAllowedDomains(): string[] {
        return this.allowedDomains;
    }

    // 你可以再加个定时刷新配置的方法，比如每5分钟自动更新
    // 清除缓存并重新加载配置
    async clearCacheAndReload(): Promise<void> {
        console.log('🧹 清除缓存并重新加载配置...');
        // 清空当前配置
        this.allowedDomains = [];
        // 重新加载
        await this.loadAllowedDomains();
    }
}


// ------------------------------------------------------------------

@Injectable()
export class IPWhitelistService implements OnModuleInit {
  private supabase: SupabaseClient;
  private allowedIPs: string[] = [];

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase 环境变量未配置，使用默认IP白名单');
      this.allowedIPs = [
        '127.0.0.1',        // 本地回环
        '::1',              // IPv6 本地回环
        '192.168.1.100',    // 局域网 IP
        '192.168.220.1',    // 局域网 IP
        '10.0.0.0/8',       // 内网段
        '172.16.0.0/12',    // 内网段
        '192.168.0.0/16',   // 内网段
        '*'                 // 允许所有IP（开发环境）
      ];
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onModuleInit() {
    await this.loadAllowedIPs();
  }

  async loadAllowedIPs() {
    // 如果没有配置 Supabase，直接返回
    if (!this.supabase) {
      console.log('使用默认IP白名单，跳过数据库加载');
      return;
    }

    try {
      const { data, error } = await this.supabase
        .from('ip_whitelist')
        .select('ip')
        .eq('enabled', true);

      if (error) {
        console.error('加载 IP 白名单失败:', error);
        // 保持默认配置，不重置为空数组
        return;
      } else {
        this.allowedIPs = data.map(item => item.ip);
        console.log('加载允许 IP 列表:', this.allowedIPs);
      }
    } catch (error) {
      console.error('Supabase 连接失败:', error);
      // 保持默认配置
    }
  }

  getAllowedIPs(): string[] {
    return this.allowedIPs;
  }

  // 清除缓存并重新加载IP白名单配置
  async clearCacheAndReload(): Promise<void> {
    console.log('🧹 清除IP白名单缓存并重新加载配置...');
    // 清空当前配置
    this.allowedIPs = [];
    // 重新加载
    await this.loadAllowedIPs();
  }
}
```

:::

## SQL代码：

### ip_whitelist


```sql
-- 1. 创建 IP 白名单配置表
create table if not exists public.ip_whitelist (
  id serial primary key,
  ip text not null,
  description text,
  enabled boolean default true,
  updated_at timestamp with time zone default now()
);

-- 2. 插入默认的白名单 IP，包括本地回环和内网段
insert into public.ip_whitelist (ip, description) values
  ('127.0.0.1', 'IPv4 本地回环'),
  ('::1', 'IPv6 本地回环'),
  ('192.168.1.100', '自定义局域网 IP'),
  ('192.168.220.1', '自定义局域网 IP'),
  ('10.0.0.0/8', 'Class A 私有网络'),
  ('172.16.0.0/12', 'Class B 私有网络'),
  ('192.168.0.0/16', 'Class C 私有网络'),
  ('*', '允许所有 IP');

-- 3. 授权认证用户（authenticated）查询该表
grant select on public.ip_whitelist to authenticated;

-- 4. 启用 RLS（行级权限控制）
alter table public.ip_whitelist enable row level security;

-- 5. 创建策略：允许所有认证用户读取（你后端可用 service_role 绕过）
create policy "authenticated can read ip whitelist"
  on public.ip_whitelist
  for select
  to authenticated
  using (true);

```

### app_config

```sql
-- 创建配置表
create table if not exists public.app_config (
  id serial primary key,
  key text not null unique,
  value text not null,
  description text,
  updated_at timestamp with time zone default now()
);

-- 授权给认证用户读权限（authenticated 是 Supabase 默认认证用户角色）
grant select on public.app_config to authenticated;

-- 如果需要管理权限（写、更新、删除），可以单独授权给你管理的角色（假设是 "admin"）
-- grant insert, update, delete on public.app_config to admin;

-- 你也可以创建视图或者函数进一步控制权限，但以上是基本的权限配置

insert into public.app_config (key, value, description)
values (
  'allowed_domains',
  '["localhost:3000","localhost:3001","yumeng.icu","your-domain.com"]',
  '允许的域名列表'
);


select * from public.app_config where key = 'allowed_domains';

```

## 示例：

图片地址：https://api.yumeng.icu/image/test/2025-07-05/224223.jpg

![](https://api.yumeng.icu/image/test/2025-07-05/224223.jpg?token=admin){title=图片来自Pixiv}