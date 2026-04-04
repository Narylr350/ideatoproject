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

如果用户不只要目录结构，也希望把核心文档一次性落到仓库中，可以进入 `full-docs` 模式。

该模式会根据需求动态填充：

- `docs/context/project-overview.md`
- `docs/context/architecture.md`
- `docs/context/tech-stack.md`
- `docs/context/development-roadmap.md`
- `docs/product/idea.md`
- `docs/engineering/api.md`

其中 `development-roadmap.md` 和 `api.md` 是否写实，取决于项目是否真的需要路线规划或独立 API 边界；不会为了“完整”而机械填满。

### 3. 旧项目 Retrofit

支持对已有仓库叠加一层 AI 友好的 bootstrap/docs 结构，而不默认搬动源码目录。

当前支持：

- `overlay-only`

retrofit 时会优先生成：

- `AGENTS.md`
- `CLAUDE.md`
- `AI_CONTEXT.md`
- `docs/archive/`
- `docs/context/retrofit-mapping.md`
- `docs/context/`
- `docs/engineering/`
- `docs/tasks/`
- `docs/testing/`

同时会处理已有 `AGENTS.md` / `CLAUDE.md` 的保留策略：

- `skip`
- `append`
- `overwrite`

并且会为历史文档、旧项目资料和过期的执行支持材料预留归档目录：

- `docs/archive/`

## 工作流概览

整体流程为下面这条主线：

1. 判断模式：`structure-only` / `full-docs` / `retrofit-existing-project`
2. 确认复杂任务执行方式：`superpowers` 或 `repo-native`
3. 做最小必要的需求澄清
4. 先给出项目结构建议，而不是直接落盘
5. 用户确认后，用脚本生成仓库结构和上下文文档

### 关于 superpowers

`superpowers` 对复杂代码任务是增强项，但并不适合所有阶段。

这个项目不会默认强推 `using-superpowers`。

**优点**

- 更适合多步实现、跨模块改动、复杂重构和非 trivial 调试
- 更容易把 `plan -> implement -> verify` 执行完整
- 对复杂编码任务的过程控制更强，适合需要稳定交付的场景

**代价**

- 启动成本和流程成本更高，不适合所有任务都使用
- 对发散型探索、需求讨论、结构推演这类工作，往往会削弱灵活性
- 如果仓库没有自己的文档和结构约束，容易让工作痕迹偏向通用 workflow，而不是项目自身结构

**什么时候选 `superpowers`**

- 任务已经进入明确执行阶段
- 需要跨多个文件、模块或系统协同修改
- 需要严格的验证闭环，而不是只讨论方案

**什么时候选 `repo-native`**

- 当前仍处于想法收敛、需求讨论、结构设计阶段
- 任务比较轻，没必要引入额外执行流程
- 希望项目管理能力完全内化到仓库中，主要依赖：
  - `docs/tasks/<domain>/`
  - `docs/testing/`
  - `docs/context/*`
  - 可选 `development-roadmap.md`

如果用户选择 `superpowers`，复杂编码任务可以使用 `using-superpowers`，但输出仍然必须映射回当前仓库的 canonical 路径，不能创建通用的 `docs/superpowers/**`。

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
git clone <your-repo-url>
cd ideatoproject
```

### 2. 安装 skill

这个仓库本身是一个 skill 项目，核心 skill 目录为：

```text
idea-to-project-structure/
```

你可以用复制或软链接的方式，把它接到本地 Codex skill 目录。

#### 方式一：直接复制

把下面这个目录复制到本地 skill 目录中：

```text
idea-to-project-structure
```

目标位置通常是：

```text
C:\Users\<你的用户名>\.codex\skills\idea-to-project-structure
```

#### 方式二：使用目录链接

如果你希望仓库内改动能直接生效，推荐使用目录链接。

Windows PowerShell 示例：

```powershell
New-Item -ItemType Junction `
  -Path "$env:USERPROFILE\.codex\skills\idea-to-project-structure" `
  -Target "D:\Narylr\ideatoproject\idea-to-project-structure"
```

### 3. 重新打开新会话

安装完成后，建议开启一个新的 Codex 会话，再使用：

```text
idea-to-project-structure
```

如果你选择让项目支持 `superpowers` 工作流，还需要保证本机已安装对应 skill；如果没有，按照环境里的 skill 安装流程补齐即可。

## 设计原则

- 不生成重型 PRD，除非用户明确需要
- 项目结构按需求动态选择，不绑定固定语言或框架
- AI 启动链必须明确，避免每次新对话重新扫描整个仓库
- 仓库本地结构优先于通用 workflow 默认结构
- 对复杂任务的管理方式必须可配置：`superpowers` 或 `repo-native`
- 老项目 retrofit 只处理项目结构、bootstrap 层和文档层，不包含项目代码重构
- `SKILL.md` 保持入口化，长提纲和细节说明下沉到 `references/`

## 许可证

本仓库使用 [MIT License](./LICENSE)。
