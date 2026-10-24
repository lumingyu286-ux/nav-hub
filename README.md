# 成人内容百科 入口页

一个纯静态的单页入口，四个入口条全部指向 `chengrenbaike.com`。无框架、无构建、无网络字体。

姊妹项目：[`baike-nav`](https://github.com/lumingyu286-ux/baike-nav)（索引页，深底宋体那套）。两个项目刻意走不同的视觉方向，仓库和部署都各自独立——其中一个被下架不会连累另一个。

## 文件

| 文件 | 说明 |
|---|---|
| `data.js` | **只需要改这一个文件**：站名、域名、四个入口 |
| `index.html` | 页面骨架 |
| `style.css` | 样式（浅色为主，跟随系统自动切深色） |
| `app.js` | 渲染、年龄确认 |
| `404.html` | 找不到页面时的落地页，样式内联 |
| `robots.txt` | 收录策略，见「主力站还是镜像站」 |
| `.nojekyll` | GitHub Pages 用 |
| `.gitlab-ci.yml` | GitLab Pages 用 |

## 先改 data.js

```js
const SITE = {
  name: '成人内容百科',
  tagline: '四个入口，同一个目的地',
  base: 'https://chengrenbaike.com',   // 默认域名，不带结尾斜杠
  deployedOn: '',                       // 每个平台填不一样的，方便自己分辨
};
```

入口格式是 `[名称, 路径或完整网址, 说明]`，第二列三种写法：

```js
['百科条目', '',                     '按主题查'],   // → base 首页
['两性健康', '/health',              '身体与就医'], // → base + /health
['黄果短剧', 'https://huangguoai.com','AI 短剧'],   // → 直接用这个网址
```

**现在四条第二列全是空的，所以都落到 `chengrenbaike.com` 首页。**

## 域名改动清单

`data.js` 是日常唯一要改的文件，但**换主站域名是例外**——有四处硬编码，必须一起改，否则出问题时访客会被送到旧域名：

| 位置 | 作用 |
|---|---|
| `data.js` → `SITE.base` | 正常情况下的全部入口 |
| `app.js` → `FALLBACK_BASE` | `data.js` 没加载成功时的兜底入口 |
| `index.html` → `<noscript>` 里的链接 | 浏览器禁用了 JS 时 |
| `404.html` → 「直接进主站」 | 访问到不存在的地址时 |

后三处都是「已经出问题了」才会走到的路径，恰恰是最不该指错地方的时候。

## 关于「四个入口同一个去处」

你选的是四张卡全部指向 `chengrenbaike.com`。这样做本身没问题，但页面必须让访客看得出来——否则就是拿四个不同标题骗同一次点击，正是搜索引擎判定门页的那种形态。

所以每条入口条的右侧**常驻显示目标域名**（`.slot-host`，见 `style.css` 和 `app.js` 里的注释）。四条都写着同一个域名时，访客一眼就知道自己要去哪。**别把这一行去掉。**

等主站各栏目地址确认了，把 `data.js` 第二列填上，四条就真的各去各处了。

## 部署

### GitHub Pages

1. 推到仓库，Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`、目录 `/ (root)`
2. `.nojekyll` 已就位

仓库名不是 `<用户名>.github.io` 时，站点挂在 `https://<用户名>.github.io/<仓库名>/` 下。`404.html` 里「回入口页」用的是相对路径 `./`，GitHub 项目站和 Cloudflare 根目录两边都对，不用改。404 页上的主按钮是绝对网址，不受影响。

### Cloudflare Pages

构建命令留空，输出目录 `/`。或直接 `npx wrangler pages deploy . --project-name=<项目名>`。

当前部署：<https://baikehub.pages.dev/>

### GitLab Pages

`.gitlab-ci.yml` 已写好，推到默认分支自动跑。**新增文件记得同步加进里面的 `cp` 那一行**，否则不会被发布。

## 主力站还是镜像站

别所有平台都用同一份默认配置。同一个页面原样发到多个平台、全指向同一个域名，是搜索引擎判定重复内容最典型的形态。

**当镜像用**（主站打不开时的备用路径）——选一个主力，其余都只改一处：

- 取消 `index.html` 里 `<meta name="robots" content="noindex,follow">` 那一行的注释

两个常见错误配法，都别用：

- **别再加指向主站的 `canonical`。** canonical 会把信号合并到主站，`noindex` 可能顺着一起传过去，最坏结果是把这些页面本来要引流的主站给打掉。
- **别把 `robots.txt` 改成 `Disallow: /`。** 理由见该文件里的注释。

**当引流落地页用**——那就不能是几份相同拷贝，每个平台至少换一套 `name` / `tagline` / 入口说明。

## 平台条款

按我的理解（不是法律意见，以各平台当前条款为准）：Cloudflare Pages 最宽松；GitHub 和 GitLab 的条款都禁止色情内容，属于容易被举报下架的类型；Google Sites 明确禁止且牵连整个 Google 账号。

真正该留的后路是独立域名和主力托管，不是在免费平台上多铺几份。

另外，本页文案和 meta 是照实写的，没有堆砌露骨关键词。参考站（`91crdh.carrd.co`）在正文段落里直接写了一长串关键词，那种写法既是搜索引擎的门页信号，也是让免费平台最快下架你的做法。

## 本地预览

```bash
python -m http.server 8080
```

打开 <http://127.0.0.1:8080/>。用 `file://` 直接双击打开时 `localStorage` 可能被限制，年龄确认会每次都弹。
