# idea-to-project-structure

一个面向 AI 协作场景的轻量化技能项目，用于把“一个模糊点子”快速收敛成可执行的项目结构，而不是直接生成冗长 PRD。

它吸收了 `product-requirements` 的需求提问方式，以及实际AI开发工作流的上下文分层思路，但不会绑定固定技术栈，也不会强制套用某个模板。核心目标是两件事：

- 从点子快速产出合理的项目结构
- 生成对后续 AI 对话友好的仓库文档分层，降低重复理解项目的 token 成本

## 项目定位

这个项目目前包含一个核心 skill：`idea-to-project-structure`。

它适合这些场景：

- 用户只有一个产品想法，希望快速得到项目结构建议
- 用户希望技术栈和系统形态根据需求动态选择
- 用户希望生成 AI 友好的 `AGENTS.md -> AI_CONTEXT.md -> docs/*` 启动链
- 用户希望把旧项目 retrofit 成更容易被 AI 接手的仓库结构

它不适合这些场景：

- 需要完整长 PRD 的正式产品需求输出
- 只是给现有项目加一个小功能
- 已经有固定仓库结构，不需要结构设计或 AI 工作流分层

## 当前能力

### 1. 新项目结构生成

支持从点子出发，经过轻量提问后，生成适合的项目骨架。

支持的基础形态包括：

- `single-app`
- `frontend-backend`
- `monorepo-web-api-admin`
- `mobile-api-admin`
- `ai-service-app`

### 2. 完整文档模式

如果用户不只要目录结构，也希望把核心文档一次性落到仓库中，可以进入 `full-docs`（结构 + 核心文档落盘）模式。

该模式会根据需求动态填充：

- `docs/context/project-overview.md`
- `docs/context/architecture.md`
- `docs/context/tech-stack.md`
- `docs/context/development-roadmap.md`
- `docs/product/idea.md`
- `docs/engineering/api.md`
- `docs/testing/README.md`

其中 `development-roadmap.md` 和 `api.md` 是否写实，取决于项目是否真的需要路线规划或独立 API 边界；不会为了“完整”而机械填满。

### 3. 旧项目 Retrofit

支持对已有仓库叠加一层 AI 友好的 bootstrap/docs 结构，而不默认搬动源码目录。

当前支持：

- `overlay-only`（只叠加项目结构层、bootstrap 层和文档层，不动业务代码）

retrofit 时会优先生成：

- `AGENTS.md`（给 AI 的仓库入口说明）
- `CLAUDE.md`（兼容其他 AI 工具的入口说明）
- `AI_CONTEXT.md`（低 token 的项目上下文索引）
- `docs/archive/`
- `docs/context/retrofit-mapping.md`
- `docs/context/`
- `docs/engineering/`
- `docs/tasks/`
- `docs/testing/`

同时会处理已有 `AGENTS.md` / `CLAUDE.md` 的保留策略：

- `skip`（跳过，不改已有文件）
- `append`（追加，把新引导块补到原文件后面）
- `overwrite`（覆盖，用新内容替换）

并且会为历史文档、旧项目资料和过期的执行支持材料预留归档目录：

- `docs/archive/`

## 工作流概览

整体流程为下面这条主线：

1. 判断模式：
   `structure-only`（只创建项目结构） /
   `full-docs`（项目结构 + 核心文档一起生成） /
   `retrofit-existing-project`（给已有项目补 AI 友好的结构层）
2. 确认复杂任务执行方式：
   `superpowers`（复杂任务执行增强） 或
   `repo-native`（项目内生工作流，主要靠仓库自己的 docs 和 task index）
   这个选择必须询问用户；不能因为本机已经安装了 `superpowers` 就默认启用。
3. 做最小必要的需求澄清
4. 先给出项目结构建议，而不是直接落盘
5. 用户确认后，用脚本生成仓库结构和上下文文档

### 关于 superpowers
<https://github.com/obra/superpowers>

`superpowers` 可以作为本地 agent 的执行增强。它的 skill 触发逻辑由本地 superpowers / agent 环境决定。

**优点**

- 更适合多步实现、跨模块改动、复杂重构和非 trivial 调试
- 更容易把 `plan -> implement -> verify` 执行完整
- 对复杂编码任务的过程控制更强，适合需要稳定交付的场景

**代价**

- 启动成本和流程成本更高，不适合所有任务都使用
- 对发散型探索、需求讨论、结构推演这类工作，往往会削弱灵活性
- 如果仓库没有自己的文档和结构约束，容易让工作痕迹偏向通用 workflow，而不是项目自身结构

**选择 `superpowers` 时**

- superpowers skill 可以按本地环境规则正常加载
- 项目文档结构仍然由仓库自己的 `AGENTS.md -> AI_CONTEXT.md -> docs/*` 接管
- superpowers 产生的设计、计划、验证记录和任务状态必须映射回仓库 canonical 路径

**选择 `repo-native` 时**

- 即使本机已经安装 `superpowers`，生成的 `AGENTS.md`、`CLAUDE.md`、`AI_CONTEXT.md` 也会明确禁止这个仓库使用 superpowers workflow
- 适合希望保持轻量、不想让 superpowers 介入当前项目的仓库
- 项目管理能力完全内化到仓库中，形成一套原生轻量工作流，主要依赖：
  - `docs/tasks/<domain>/`
  - `docs/testing/`
  - `docs/context/*`
  - 可选 `development-roadmap.md`

如果用户选择 `superpowers`，不要规定它只能在某类任务里触发；只规定输出必须映射回当前仓库自己的 canonical 路径，不能创建通用的 `docs/superpowers/**`。

如果用户选择 `repo-native`，则相反：项目文档会明确 opt out，不使用 `using-superpowers`、`brainstorming`、`writing-plans` 等 superpowers workflow skill，避免轻量项目被额外流程拖重。

repo-native 的原生工作流是：

1. 读 `AI_CONTEXT.md`
2. 读受影响的 `docs/tasks/<module>/INDEX.md`
3. 在模块任务文件里定义范围
4. 做最小的结构感知改动
5. 用测试或手工检查验证
6. 必要时把跨模块验证证据或缺口写到 `docs/testing/`
7. 任务结束前更新受影响模块的 `INDEX.md`
8. 只有架构、技术栈、工程契约真的变化时，才更新 `docs/context/*` 或 `docs/engineering/*`

这里的设计目标是把它的执行纪律内化进仓库，而不是模仿它的文档体系。也就是说：

- `superpowers` 是可选执行增强，不是项目文档模板
- 项目自己的 `docs/context/`、`docs/engineering/`、`docs/tasks/<module>/INDEX.md` 才是主结构
- 即使启用 `superpowers`，也只吸收其复杂任务执行纪律，不复刻它的目录组织

这样即使不依赖外部 skill，也能让项目在后续 AI 会话中持续可管理。

这个工作流里最关键的低成本上下文文件不是某个总 README，而是各模块自己的：

- `docs/tasks/<module>/INDEX.md`

它们应当持续记录当前有效状态、最近完成的关键变更、下一步任务，以及仍然存在的已知问题。任务完成后必须回写受影响模块的 `INDEX.md`；如果任务跨多个模块，就回写多个模块的 `INDEX.md`。

同时，这套工作流遵循一个重要原则：**单个任务应尽量保持最小影响范围，优先限制在单模块内完成，而不是无必要地扩散到多个模块。**

## 目录结构

当前仓库结构如下：

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
      └─ init-project-structure.mjs
```

各部分职责：

- `SKILL.md`
  skill 的主说明与工作流定义
- `scripts/init-project-structure.mjs`
  负责创建新项目结构或对旧项目叠加 structure/bootstrap/docs retrofit
- `assets/templates/docs/`
  文档模板集合
- `assets/templates/shapes/manifest.json`
  结构形态定义
- `references/`
  只在需要时加载的补充说明，避免 `SKILL.md` 过大
- `agents/openai.yaml`
  agent 接入配置

## 安装方式

### 1. 克隆仓库

```bash
git clone https://github.com/Narylr350/ideatoproject.git
cd ideatoproject
```

### 2. 安装 skill

这个仓库本身是一个 skill 项目，核心 skill 目录为：

```text
idea-to-project-structure/
```

你可以用复制或软链接的方式，把它接到本地 Codex skill 目录。

新版 Codex / Superpowers 生态通常从 `~/.agents/skills/` 发现 skills；旧安装里也可能还在用 `~/.codex/skills/`。优先使用 `~/.agents/skills/`，这样和当前 superpowers 的 Codex 安装方式更一致。

#### 方式一：直接复制

把下面这个目录复制到本地 skill 目录中：

```text
idea-to-project-structure
```

目标位置通常是：

```text
C:\Users\<你的用户名>\.agents\skills\idea-to-project-structure
```

#### 方式二：使用目录链接

如果你希望仓库内改动能直接生效，推荐使用目录链接。

Windows PowerShell 示例：

```powershell
New-Item -ItemType Junction `
  -Path "$env:USERPROFILE\.agents\skills\idea-to-project-structure" `
  -Target "D:\Narylr\ideatoproject\idea-to-project-structure"
```

如果你的本地 Codex 版本仍然只扫描 `.codex\skills`，可以把上面的目标路径换成：

```text
C:\Users\<你的用户名>\.codex\skills\idea-to-project-structure
```

### 3. 重新打开新会话

安装完成后，建议开启一个新的 Codex 会话，再使用：

```text
idea-to-project-structure
```

如果你选择让项目支持 `superpowers` 工作流，还需要保证本机已安装对应 skill；如果没有，按照环境里的 skill 安装流程补齐即可。

## 使用方式

### 在 Codex 里触发

安装后重新打开 Codex。使用时可以直接在输入框里按 `/`，从 skill 列表里选择 `idea-to-project-structure`，再用自然语言描述你要的项目。

最稳的 skill 使用方式是显式点名：

- `/idea-to-project-structure ...`
- `idea-to-project-structure ...`
- `[$idea-to-project-structure](...) ...`

这个 skill 仍然鼓励把简单点子落成项目结构。区别只是：如果没有显式点名 skill，模型不应该只因为“我要做一个管理软件”这种泛描述就自动触发。最好明确说“项目结构”“仓库结构”“scaffold”“full-docs”“retrofit”或“重构这个仓库”。

如果你的 Codex 客户端支持文件/skill 链接，可以直接写完整路径：

```text
[$idea-to-project-structure](C:\Users\ZRETC\.codex\skills\idea-to-project-structure\SKILL.md) 我要一个客户管理软件，先帮我设计项目结构。
```

新版路径也可以这样写：

```text
[$idea-to-project-structure](C:\Users\ZRETC\.agents\skills\idea-to-project-structure\SKILL.md) 我要一个工单管理软件，先不要写代码，只给结构方案。
```

也可以直接在消息里点名这个 skill，例如：

```text
idea-to-project-structure 我要一个面向小团队的库存管理软件，有商品、入库、出库、库存预警和操作员后台。
```

### 默认用法：新项目结构生成

明确要求“项目结构 / 仓库结构 / scaffold / 模块边界 / 技术栈建议”，默认进入第一种能力：新项目结构生成。它会先问少量会影响结构的问题，然后给出推荐形态、技术栈、模块边界和目录结构。

```text
/idea-to-project-structure 我要一个门店会员管理软件，支持会员档案、储值、消费记录、积分、短信通知和后台管理。
```

也可以这样说：

```text
idea-to-project-structure 我要一个给自由职业者用的项目收款管理工具，帮我从想法收敛成项目结构。
```

### 第二种能力：完整文档模式

如果你不只要目录结构，还想把核心文档一起生成出来，必须明确说 `full-docs`、`完整文档`、`核心文档一起生成` 或“结构和文档一起落盘”。

```text
/idea-to-project-structure 我要做一个设备巡检管理系统，用 full-docs 模式，帮我生成项目结构和核心文档。
```

适合你已经大概确定要做什么，希望一次拿到：

- `AGENTS.md`
- `AI_CONTEXT.md`
- `docs/context/*`
- `docs/product/idea.md`
- `docs/engineering/api.md`
- `docs/tasks/*`
- `docs/testing/README.md`

### 第三种能力：旧项目 Retrofit

如果是已有仓库，不想重构代码，只想补一层 AI 友好的启动链和文档结构，必须明确说 `retrofit`、`retrofit-existing-project`、`旧项目改造`、`现有仓库`、`当前仓库`、`重构这个仓库`，或直接给出已有项目路径。

这里的“重构这个仓库”指仓库结构、bootstrap/docs、AI 接手文档层。如果你说的是代码重构、性能优化、清理源码，那不走这个模式。

```text
/idea-to-project-structure 对 D:\Projects\my-old-app 做 retrofit，只叠加 AGENTS.md、AI_CONTEXT.md 和 docs 结构，不要移动源码。
```

也可以这样说：

```text
idea-to-project-structure 帮我把当前仓库改造成更容易被 AI 接手的结构，保留原源码目录，只补 bootstrap/docs 层。
```

retrofit 默认是 `overlay-only`，也就是只加项目结构说明、bootstrap 文件、canonical docs 和映射文档，不改业务代码。

## 设计原则

- 不生成重型 PRD，除非用户明确需要
- 项目结构按需求动态选择，不绑定固定语言或框架
- AI 启动链必须明确，避免每次新对话重新扫描整个仓库
- 仓库本地结构优先于通用 workflow 默认结构
- 对复杂任务的管理方式必须可配置：`superpowers` 或 `repo-native`
- 创建或 retrofit 项目时必须询问 `superpowers` / `repo-native`，不能根据本机安装状态自动决定
- 老项目 retrofit 只处理项目结构、bootstrap 层和文档层，不包含项目代码重构
- `SKILL.md` 保持入口化，长提纲和细节说明下沉到 `references/`

## 许可证

本仓库使用 [MIT License](./LICENSE)。
