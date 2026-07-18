# 干员与立绘后台管理流程

## 1. 目标

后台需要解决两类配置问题：

1. 使用接近 Photoshop 的拖动方式校准每位干员立绘
2. 管理网站当前支持哪些干员和哪些语音

后台只管理配置 不承担立绘和音频文件编辑

立绘 日文 中文和音频来源仍然是 PRTS

## 2. 推荐架构

后台分成三个边界：

```text
本地浏览器中的可视化编辑器
        ↓ localhost
本地 Nuxt Server 发布代理
        ↓ HTTPS 或 Tailscale 私网
雨云生产管理 API
        ↓
SQLite 持久化配置
```

这样设计最重要的原因是生产管理密钥不会进入浏览器 JavaScript

本地页面只向本机 Nuxt Server 提交草稿

本机 Nuxt Server 从本地 `.env` 读取发布密钥 再请求雨云服务器

## 3. 本地如何管理后台

### 3.1 本地编辑入口

后续在项目中增加本地专用页面：

```text
/admin/operators
```

开发者本人运行项目后通过 localhost 打开

生产构建默认不暴露这个编辑页面 或只允许通过 Tailscale 私网访问

页面包含：

- 干员列表
- 游戏风格卡片实时预览
- 鼠标拖动立绘
- 滚轮或缩放手柄
- 旋转手柄
- 撤销 重做和重置
- 保存草稿
- 发布到生产服务器

### 3.2 拖动如何转换成配置

编辑器不直接修改图片

它修改的是当前已有的五个字段：

```ts
interface OperatorPortraitPlacement {
    widthPercent: number
    leftPercent: number
    topPercent: number
    scale: number
    rotationDegrees: number
}
```

拖动过程中：

```text
Pointer Down 记录起点
Pointer Move 计算位移
像素位移 ÷ 预览框尺寸
转换成 leftPercent 和 topPercent
Pointer Up 写入本地草稿
```

保存百分比而不是固定像素 可以让手机和桌面端复用同一份配置

旋转和缩放直接对应 CSS transform

后台预览必须复用前台的立绘卡片组件或同一个纯展示内核

否则后台看到的效果和用户实际看到的效果可能不一致

## 4. 草稿如何保存

本地草稿推荐保存在本地 SQLite：

```text
.data/admin/operator-config.sqlite
```

它不进入 Git 也不会上传给普通用户

每次拖动结束后保存草稿 而不是每个 Pointer Move 都写磁盘

这样可以同时获得实时预览和稳定存储

还应支持导出版本化 JSON：

```json
{
  "schemaVersion": 1,
  "revision": 12,
  "operators": []
}
```

JSON 用于审查 备份和恢复 SQLite 不是让用户手写的配置文件

## 5. 生产服务器保存什么

### 5.1 operator 表

```text
id
display_name
voice_page_title
portrait_file_title
enabled
width_percent
left_percent
top_percent
scale
rotation_degrees
updated_at
revision
```

### 5.2 operator_voice_rule 表

```text
operator_id
voice_title
enabled
difficulty_override
updated_at
```

这张表不复制 PRTS 的全部语音正文

它只记录某条语音是否进入题库 以及是否需要覆盖自动难度映射

如果没有覆盖值 就继续使用现有标题映射规则

### 5.3 config_revision 表

```text
revision
published_at
published_by
```

每次发布都增加 revision

revision 用来让目录缓存和题库缓存知道配置已经变化

## 6. 从本地发布到雨云的完整流程

### 第一步 本地调整

1. 本地编辑器读取生产配置或上次草稿
2. 选择一位干员
3. 拖动 缩放和旋转立绘
4. 本地实时预览
5. Pointer Up 后保存本地草稿

### 第二步 本地校验

发布前检查：

- 干员 ID 是否唯一
- PRTS 页面标题是否为空
- 百分比和缩放值是否为有限数字
- 缩放和位置是否在允许范围内
- 至少保留一条启用语音
- 难度覆盖值是否合法

### 第三步 创建发布包

本地 Nuxt Server 生成：

```json
{
  "schemaVersion": 1,
  "baseRevision": 12,
  "operators": [],
  "voiceRules": []
}
```

`baseRevision` 用于乐观锁

如果服务器已经是 revision 13 本地不能拿 revision 12 直接覆盖

需要先拉取新配置再处理冲突

### 第四步 私密发布

推荐优先使用 Tailscale：

```text
本地电脑 → Tailscale 私网 → 雨云管理 API
```

公开网站继续使用正常域名

管理 API 只监听私网地址 不对公网开放

如果暂时不用 Tailscale 则必须使用 HTTPS 管理端点和高强度 Bearer Token

Token 只放在：

```text
本地 .env
雨云环境变量
```

绝不能放入 Vue 页面 源代码 Git 或 LocalStorage

### 第五步 生产端事务写入

生产管理 API 收到发布包后：

1. 验证管理身份
2. 再次验证所有字段
3. 检查 baseRevision
4. 开启 SQLite transaction
5. 更新 operator 和 operator_voice_rule
6. 增加 config revision
7. 提交 transaction
8. 让相关 Nitro 缓存失效
9. 返回新 revision

任何一步失败都回滚事务 避免只更新一半配置

### 第六步 缓存更新

发布后不立即并发抓取全部 PRTS 数据

推荐策略：

- 立绘位置和启用状态立即更新目录缓存
- 只对本次变化的干员顺序预热语音缓存
- 其他干员继续按需加载
- PRTS 失败时保留旧缓存并记录日志

这样不会因为发布一次配置就瞬间向 PRTS 发出数百个请求

## 7. 生产 SQLite 如何保存

生产数据库放在 Docker named volume：

```text
/app/.data/database/operator-config.sqlite
```

更新镜像和重新创建容器不会删除 named volume

仍需要定期备份：

```text
每天复制一份 SQLite 快照
保留最近 7 到 30 天
发布前自动生成一份快照
```

不要只依赖 Docker volume

volume 可以防止普通容器更新丢数据 不能代替备份

## 8. 干员池如何动态影响练习池

练习池生成流程调整为：

```text
读取 enabled 干员
→ 获取这些干员的缓存语音
→ 应用 operator_voice_rule
→ 过滤禁用语音
→ 应用难度覆盖或标题映射
→ 得到简单 中等 困难完整池
→ 完整池洗牌
→ 每 5 条切成一组
```

增加或关闭一个干员后 三个难度池数量可以自然变化

前端不能再假设简单永远 90 题或困难永远 102 题

## 9. 分阶段实现建议

### 阶段 A 本地编辑器

- 可视化拖动 缩放和旋转
- 本地草稿
- JSON 导入导出
- 暂时仍生成 TypeScript 配置供人工提交

### 阶段 B 生产 SQLite

- operator 表
- voice rule 表
- 配置 revision
- 公开 API 改为读取数据库

### 阶段 C 安全发布

- 本地发布代理
- Tailscale 私网管理 API
- 乐观锁
- 事务和备份
- 缓存精确失效

这种顺序可以先完成最有价值的可视化调整 再增加生产写入能力

不会在后台认证尚未完成时提前暴露危险的公网修改接口
