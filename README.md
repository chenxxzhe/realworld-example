# Real world monorepo

1. 共用的, 编译无关, 业务无关

依赖全部放到 root, 例如 eslint, ts-node

2. 共用的, **编译相关**, 业务无关

依赖放到 root, 基本配置放到 root, 各 packages 引用 基本配置 来实现自身的配置; 例如 typescript
