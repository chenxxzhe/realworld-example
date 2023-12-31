# RealWorld Backend Nest

## Command
```bash
pnpm install
pnpm start
pnpm test
pnpm build
```

## 参考文档

- realworld document: `https://www.realworld.how/docs/specs/backend-specs/introduction`


## 搭建顺序

1. 新建项目 `nest new --strict -p pnpm -s xxx`
2. 设置 prisma `https://nestjs-prisma.dev/docs/installation/`
  - init schema `https://www.prisma.io/docs/concepts/components/prisma-schema`
  - 修改 generate out 避免读不到type `output = "../node_modules/.prisma/client"`
  - 设置生成随机数据 `prisma/seed.ts`, `https://www.prisma.io/docs/guides/migrate/seed-database`
3. 设置 configuration service
4. 安全设置: helmet, rate limit
5. 设置 log 使用 winston `https://www.npmjs.com/package/nest-winston`, `https://lsmod.medium.com/nestjs-setting-up-file-logging-daily-rotation-with-winston-28147af56ec4`  `https://juejin.cn/post/7187910528918880311`;
  - 使用 interceptor 与 filter 写 info log; error log 通过`useLogger`绑定到 nest 上自动记录
6. 编写登录授权逻辑 passport, 只是用 jwt, 不用 local(自己实现)
7. 新建 CRUD resource, 编写业务
8. 运行 postgresql
9.  dev 运行项目调试
10. postman 测试用例 `https://github.com/gothinkster/realworld/blob/main/api/Conduit.postman_collection.json`
11. 设置 swagger `https://docs.nestjs.com/openapi/introduction`
12. 写测试
13. TODO: 部署运行 docker

## postgreSQL 使用

- 运行服务

设置环境变量 `PGDATA=/usr/local/var/postgres`, 运行 `postgres`,
或者每次运行 `postgres -D /usr/local/var/postgres`

- CLI 使用
`psql` 进入cli,
各种命令参考 `https://quickref.me/postgres.html`

## prisma 使用

- 初始化
`prisma init` 生成 schema, 写 model
`prisma generate` 生成 client 代码供调用

- push
`prisma db push` 试验阶段使用, **不关心数据损失,不要在生产环境使用**,  推送到数据库, 调试效果.

`prisma db seed` 生成种子数据

- migrate
`prisma migrate dev` 记录 model 的变化, 生成步骤文件, prisma 会按步骤应用到数据库

## docker 使用

部署

运行