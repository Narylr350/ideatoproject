# idea-to-project-structure

把一个产品想法快速收敛成可执行的项目结构，并生成适合后续 AI 协作的仓库文档。

## 一个例子

你可以这样说：

```text
idea-to-project-structure 我需要一个 Windows 软件，用来管理多个软件项目目录。
比如单片机烧录软件、3D 软件、嘉立创软件的项目，我经常要查看这些目录，来回切换很麻烦。
这个软件只用于查看文件。完整文档模式。
```

这个 skill 不会直接写代码，也不会一上来生成冗长 PRD。它会先帮你把需求收敛成：

- 应该做成什么系统形态，例如单体桌面应用、前后端分离、移动端 + API、带后台的 monorepo。
- 第一版应该做什么、不做什么。
- 应该选什么技术栈，以及为什么。
- 项目目录应该如何划分。
- 后续 AI 接手项目时应该从哪些文档开始读。

如果选择 `full-docs`（完整文档模式），它还会把核心文档一次性写进新仓库，而不是只给一段聊天建议。

## 解决什么痛点

很多项目一开始只有一句想法，例如“我要做一个库存管理软件”“我要做一个桌面工具”。这时直接让 AI 写代码，常见问题是：

- 项目结构随手搭，后面很难扩展。
- 技术栈选择靠猜，不知道为什么这么选。
- 新对话接手时，AI 又要重新扫描整个仓库。
- 文档要么没有，要么变成很重的 PRD。
- 老项目想让 AI 接手，但没有清晰的入口文档和结构说明。

`idea-to-project-structure` 的目标是先把项目骨架和 AI 入口打稳。它会生成 `AGENTS.md` / `CLAUDE.md`、`AI_CONTEXT.md` 和 `docs/*`，让后续 AI 会话能低成本理解项目。

## 快速使用

显式点名 skill，然后描述你的项目。

```text
idea-to-project-structure 我要一个门店会员管理软件，支持会员档案、储值、消费记录、积分、短信通知和后台管理。
```

如果你想直接生成结构和核心文档：

```text
idea-to-project-structure 我要做一个设备巡检管理系统，用 full-docs 模式，帮我生成项目结构和核心文档。
```

如果你想给已有项目补 AI 友好的文档层：

```text
idea-to-project-structure 对 D:\Projects\my-old-app 做 retrofit，只叠加 AGENTS.md、AI_CONTEXT.md 和 docs 结构，不要移动源码。
```

在完整文档模式里，访谈会按 checkpoint 逐步推进，不会一次性把 workflow、路径、技术栈和 MVP 全部丢给你填写。MVP 会从管理对象、首次成功动作、只读/可写边界、明确非目标和成功信号逐步收敛出来。

如果你说“你推荐”或“按你的 MVP 推荐”，它只表示让 AI 提出推荐方案，不等于批准落盘。AI 必须先展示完整字段包，等你明确确认后才会创建文件。

## 验证范围

这个 skill 目前没有系统测试过所有 AI 工具和模型组合。

已实际测试过的组合：

- Codex + GPT 系列：表现良好，符合预期。
- Claude Code + GPT 系列：表现很差，几乎不可用。

因此，当前 README 和 skill 说明默认以 Codex 环境为主要使用场景。其他 AI 工具或模型组合可以自行尝试，但不保证能稳定遵循完整文档模式、逐步 checkpoint 和确认后落盘等关键流程。

## 安装

### 1. 克隆仓库

```bash
git clone https://github.com/Narylr350/ideatoproject.git
cd ideatoproject
```

### 2. 安装 skill

核心 skill 目录是：

```text
idea-to-project-structure/
```

推荐用目录链接，这样仓库更新后本地 skill 会自动更新。

Windows PowerShell 示例：

```powershell
New-Item -ItemType Junction `
  -Path "$env:USERPROFILE\.codex\skills\idea-to-project-structure" `
  -Target "D:\Narylr\ideatoproject\idea-to-project-structure"
```

如果你的环境使用新版 `~/.agents/skills/`，可以把 `-Path` 改成：

```text
$env:USERPROFILE\.agents\skills\idea-to-project-structure
```

也可以直接复制 `idea-to-project-structure/` 到对应 skills 目录，但复制后需要手动同步后续更新。

### 3. 重新打开会话

安装后建议开启一个新的 Codex 会话，再输入：

```text
idea-to-project-structure ...
```

## 三种模式

### 1. structure-only

默认模式。适合你还在想项目结构，暂时不想落盘。

它会输出：

- 需求摘要
- 推荐系统形态
- 推荐技术栈
- 模块边界
- 目录结构树
- 为什么这样划分

支持的基础形态包括：

- `single-app`
- `frontend-backend`
- `monorepo-web-api-admin`
- `mobile-api-admin`
- `ai-service-app`

### 2. full-docs

完整文档模式。适合你不只要目录结构，还希望把核心文档一起生成到仓库。

它会根据需求动态填充：

- `AGENTS.md`
- `CLAUDE.md`
- `AI_CONTEXT.md`
- `docs/context/project-overview.md`
- `docs/context/architecture.md`
- `docs/context/tech-stack.md`
- `docs/context/development-roadmap.md`
- `docs/product/idea.md`
- `docs/engineering/api.md`
- `docs/testing/README.md`
- `docs/tasks/<module>/INDEX.md`

其中 `development-roadmap.md` 和 `api.md` 是否写实，取决于项目是否真的需要路线规划或独立 API 边界；不会为了“完整”而机械填满。

脚本侧的 `--docs-mode full-docs` 会接收并写入：

- `--mvp`
- `--non-goals`
- `--success-metrics`
- `--key-workflows`
- `--integrations`
- `--testing-strategy`
- `--api-scope`
- `--risks`
- `--open-questions`

这样生成的文档会包含真实需求内容，而不是只留下 TODO 占位。

### 3. retrofit-existing-project

适合已有仓库。它只叠加 AI 友好的启动链和文档结构，不默认移动或重构源码。

当前支持：

- `overlay-only`：只添加项目结构层、bootstrap 层和文档层。

会生成或补充：

- `AGENTS.md`
- `CLAUDE.md`
- `AI_CONTEXT.md`
- `docs/context/retrofit-mapping.md`
- `docs/context/`
- `docs/engineering/`
- `docs/tasks/`
- `docs/testing/`
- `docs/archive/`

如果已有 `AGENTS.md` / `CLAUDE.md`，可以选择：

- `skip`：跳过，不改已有文件。
- `append`：追加新引导块。
- `overwrite`：覆盖为新内容。

## 生成脚本

skill 内置脚本：

```bash
node idea-to-project-structure/scripts/init-project-structure.mjs ...
```

常用参数：

```text
--mode new|retrofit
--root <dir>
--name <project-name>
--shape single-app|frontend-backend|monorepo-web-api-admin|mobile-api-admin|ai-service-app
--frontend react|nextjs|vue|nuxt|svelte|none
--backend fastapi|nestjs|spring-boot|express|go|none
--mobile flutter|react-native|none
--package-manager pnpm|npm|yarn|bun|maven|gradle|none
--execution-workflow superpowers|repo-native
--docs-mode loopnova|full-docs|none
--retrofit-depth overlay-only
--instruction-file-mode skip|append|overwrite
```

完整文档模式还可以传入：

```text
--mvp
--non-goals
--success-metrics
--key-workflows
--integrations
--testing-strategy
--api-scope
--risks
--open-questions
--milestones
```

## repo-native 和 superpowers

创建或 retrofit 项目时，会询问你希望生成仓库采用哪种复杂任务执行方式。

### repo-native

轻量方案。后续计划、验证和任务状态都放在仓库自己的 docs 里，不依赖外部 workflow skill。

适合：

- 小到中型项目
- 不希望流程太重的仓库
- 希望项目管理能力完全内化在仓库文档中

### superpowers

允许本机 superpowers workflow skill 参与复杂任务执行纪律，但长期文档仍然放在仓库自己的 canonical docs 里。

适合：

- 多步实现
- 跨模块改动
- 复杂调试
- 需要更强 `plan -> implement -> verify` 闭环的项目

不管选择哪种方式，都不能把通用 workflow 目录直接搬进项目。生成仓库的长期上下文应当落在 `AI_CONTEXT.md` 和 `docs/*`。

## 当前仓库结构

```text
ideatoproject/
└─ idea-to-project-structure/
   ├─ SKILL.md
   ├─ agents/
   │  └─ openai.yaml
   ├─ assets/
   │  └─ templates/
   │     ├─ docs/
   │     └─ shapes/
   ├─ references/
   │  ├─ full-docs-mode.md
   │  ├─ retrofit-mode.md
   │  └─ shape-and-stack-guidance.md
   └─ scripts/
      ├─ init-project-structure.mjs
      └─ init-project-structure.test.mjs
```

## 适合与不适合

适合：

- 从一个模糊产品想法收敛项目结构。
- 让 AI 根据需求推荐技术栈和系统形态。
- 生成 AI 友好的仓库启动链和核心文档。
- 给旧项目补一层 AI handoff 文档。

不适合：

- 直接写业务功能代码。
- 给现有项目加一个小功能。
- 输出正式、冗长、审批型 PRD。
- 做源码重构、性能优化或行为变更。

## 设计原则

- 先把项目结构想清楚，再写代码。
- 文档要服务后续 AI 接手，而不是为了好看而堆文档。
- 技术栈按需求动态选择，不绑定固定框架。
- 完整文档模式要写实，但不要伪造不确定内容。
- 老项目 retrofit 只补结构和文档层，不默认重构源码。
- `SKILL.md` 保持入口化，长说明下沉到 `references/`。

## 许可证

本仓库使用 [MIT License](./LICENSE)。
