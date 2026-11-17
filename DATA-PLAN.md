# Data Plan

## Context provenance
- `构建一个关于银行系统的空间 分类 国内外的 想学习业务和技术方面的知识` (verbatim user request; defines the whole artifact: a learning space about banking systems, split domestic vs foreign, covering business and technology)
- Parent-agent design spec (accepted, handed off in this build): five views — 全景图 (clickable bank IT panorama), 业务篇 (six business lines, each 业务流程+系统支撑+关键规则), 技术篇 (six tech topics), 厂商与案例 (国内组/国外组 + 对照表), 术语表 (searchable). Hard rule: teaching content follows industry-standard knowledge; vendor/case facts use public-source wording only, specific numbers attributed as 厂商/媒体公开说法, unverifiable numbers written as 「未公开」, no ranking/judging in the domestic-vs-foreign comparison.
- No external context from memory applied; content planned from the verbatim request + handed-off spec + the web probes below.

## Tested sources
### 银行核心体系与业务模块（中文检索）
**Used by**: 全景图模块划分、业务篇六条业务线、技术篇账务/日切主题（build-time curated content, not runtime fetch）
**Test command**: `browser.search` query `银行核心业务系统 架构 存款 贷款 支付结算 总账 业务模块`
**Sample output**: 核心系统模块共识 — 客户信息(CIF)、存款、贷款、支付结算、总账、卡、资金、国际结算、对外接口；总账通过业务触发记账并做总分核对；账户分存款/贷款/内部账户三类；核心功能可概括为「基础账户+存贷汇+支付清算+财务核算+风控合规」。
**Processing**: distilled into panorama layers and business-line explainers in plain teaching language; no figures copied.

### Global core banking vendors（英文检索）
**Used by**: 厂商与案例·国外组、国内外对照表
**Test command**: `browser.search` query `core banking system vendors Temenos FIS Fiserv Oracle FLEXCUBE Thought Machine Mambu market`
**Sample output**: Enterprise vendors (Temenos founded 1993, FIS 1968, Fiserv 1984, Oracle FLEXCUBE) win on regulatory coverage/scale; cloud-native challengers (Mambu 2011 SaaS-only, Thought Machine 2014, 10x, Finxact) win on API-first/speed; also Finastra, TCS BaNCS, Infosys Finacle, Jack Henry in the leading set.
**Processing**: vendor cards carry 定位/代表产品/技术路线 only from this public framing; client counts stated only where the source states them as vendor-stated (e.g. Temenos 950+ core clients per vendor site, marked 厂商口径).

### 国内核心系统厂商格局（中文检索）
**Used by**: 厂商与案例·国内组
**Test command**: `browser.search` query `长亮科技 神州信息 宇信科技 中电金信 银行核心系统 厂商 分布式核心`
**Sample output**: IDC 2025《中国银行业IT解决方案市场份额》前六：中电金信、宇信科技、神州信息、南天信息、天阳科技、长亮科技；长亮科技近百个银行核心系统项目落地、东南亚 60+ 客户（年报口径）；神州信息签约华夏银行核心存款项目、多地农信核心项目（年报口径）；华为联合中电金信/神州信息/长亮/宇信等发布金融分布式新核心解决方案。
**Processing**: vendor cards use positioning + product lines; any count labeled 年报/公开报道口径.

### 国内银行分布式核心转型案例（中文检索）
**Used by**: 厂商与案例·国内组案例卡、技术篇架构演进
**Test command**: `browser.search` query `工商银行 建设银行 招商银行 分布式核心系统 云化 转型 公开报道`
**Sample output**: 工行「新一代核心银行系统项目」获 2025 年度金融科技发展奖唯一特等奖（央行公示，媒体报道）；农行 2025 年完成大型主机切换下线（年报口径）；建行在国有大行中率先完成核心业务系统全面架构转型（年报口径）；平安银行新一代分布式核心系统建设项目获金融科技发展奖二等奖、全栈国产化（公开报道口径）。
**Processing**: case cards describe 路线与公开节点 only; performance figures either omitted or explicitly attributed （如邮储峰值 TPS 见行业研报口径 — will be attributed or dropped, never stated as verified fact).

## Edit 2026-11-15: 信创加入（用户「把信创也加进来」+ 主 agent 落地口径）
- 技术篇新增《信创与国产化替代》（tech-xinchuang，排在架构演进篇之后）：信创定义与三层动因（供应链安全/监管导向/成本与演进）、去 IOE 来历（2013 阿里，行业通行史实）、替代栈全景按层列（芯片 鲲鹏/飞腾/龙芯/海光、OS 麒麟/统信、数据库 达梦/金仓/OceanBase/TDSQL/GaussDB、中间件 东方通/宝兰德/金蝶天燕、整机与云 华为/浪潮）、落地路径（办公→外围→一般业务→核心 + 双轨/灰度/回退）、适配难点（SQL 方言、性能调优、生态工具链）、与分布式核心的关系。架构演进篇末节加一句指路到本篇，本篇 intro 回指架构演进篇。
- 全景图基础设施层新增模块「信创国产化底座」（xinchuang-stack），层 note 补「信创主战场」一句。
- 中美对照「监管与改造驱动力」维度：中国侧补「信创 = 政策导向 + 供应链安全双驱动」，美国侧补「无对应国家级整栈替代工程，这本身就是根本差异」。
- 术语表新增 4 条：信创、去 IOE、双轨运行、全栈适配（学习点总数 48 → 53：全景图 36→37、技术篇 6→7、术语 30→34）。
- 口径延续既有规则：政策试点批次/时间表只写「公开报道口径」并明确无全行业统一日程；不写厂商份额与替代率数字。

## Edit 2026-11-15 (2): 全站内容加深（用户「所有的都详细，还是不够详细」+ 主 agent 深度标准）
- 全景图 37 模块：每模块新增「职责边界」与「举个例子」（一笔具体交易经过它时发生什么），role/interact/misconception 同步扩写；ModuleSheet 新增两节渲染。
- 业务篇 6 篇：流程扩到 6–7 步（每步标谁发起/经哪个系统/账务怎么动）；规则补数字口径（二类户限额、活期结息日、五级分类逾期天数参考、ACH/FDIC 等）；每篇新增贯穿实例（存款计息算例、100 万经营贷完整分录、工资代发轧差、800 元刷卡手续费分配、净值理财收益账、化整为零反洗钱案例）与「常见误区与易混点」小节；6 篇全部补中美对照（原仅支付篇有）。
- 技术篇 7 篇：每篇按「原理 → 银行真实做法 → 关键数字口径 → 出问题怎么办」重构扩写；日切篇新增一晚时序表示例，容灾篇补 RPO/RTO 档位与五关切换流程，一致性篇补冲正/状态追查/对账/差错处理闭环。
- 厂商卡（中 4 + 美 7）：新增「典型部署形态」「公开案例」两字段，定位/产品构成同步扩写；银行案例（中 5 + 美 4）detail 补改造背景与公开路径细节；中美对照新增「数据与 AI 应用」维度、intro 与各维度扩写。
- 术语表 34 条：每条新增「例子」字段（场景 + 易混词对照，如清算 vs 结算、轧账 vs 对账、RPO vs RTO）。
- 口径纪律不变：银行/厂商具体数字继续标公开口径；行业通用规则（五级分类天数、结息日、限额）标为通行标准口径并注明以现行办法/合同为准。

## Edit 2026-11-15 (3): 业务全链路（用户「一笔业务流经哪些系统、流程图跑起来」+ 主 agent 形态规格）
- 新增第六视图「业务全链路」（client/src/journeys.ts）：5 个场景——跨行转账（企业网银 30 万走 HVPS，10 步）、刷卡消费（银联转接，10 步）、贷款放款（信贷审批→核心借据→受托支付→首期扣收，11 步）、工资代发（企业网银批量包走 BEPS 轧差，10 步）、ATM 跨行取现（银联转接+冲正兜底，9 步）。
- 每步含：全景图模块 id（与 PANORAMA 同 id，点系统名打开 ModuleSheet 看模块讲解）、步骤标题、讲解（做什么/账务数据怎么动）、失败处理（冲正/退汇/挂账/拒绝）、可选账务分录（借/贷/注 + 记账主体），侧边「账务小窗」随播放进度累积显示。
- 播放引擎：播放/暂停、上一步/下一步、1×/2×/4× 速度、点任意节点跳转并从该步续播、当前节点呼吸光晕 + 自动滚入视野、已流经留痕（✓+红线）、未达置灰；尊重 prefers-reduced-motion（关动画留静态光环）。
- 每场景带对应业务篇章节跳转；步骤面板可直接把该系统模块标记「已学」（复用既有 marks 存储，学习点口径不变）。
- 口径延续：步骤与系统对应按真实业务链路；手续费率（借记卡约 0.5% 量级）、密码错误上限（3 次量级）等标通行/各行口径，不冒充单一银行现行标准。

## Edit 2026-11-15 (4): 数字人民币（用户「增加数字人民币 业务」+ 主 agent 四处联动规格，与信创同规格）
- 业务篇新增《数字人民币》专篇（biz-ecny，排在风险合规篇之后）：定位（央行法定数字货币、计入 M0、不计付利息、法偿性、试点阶段）、双层运营、钱包四类分级与限额、兑出/兑回、离线（双离线）支付、智能合约预付资金管理、可控匿名、运营机构范围、对银行系统的影响（钱包系统独立于存款账户体系、只经兑出/兑回接口与核心相连）；贯穿实例为「银行卡兑出 500 元 → 扫码付商户 128 元 → 商户兑回结算账户」全程账务；中美对照讲美国 CBDC 态度（零售型数字美元需国会授权、美联储谨慎，批发实验为主）。
- 业务全链路新增场景「数字人民币付款」（flow-ecny，8 步）：开二类钱包 → 兑出（含央行发行登记分录）→ 付款验证/可控匿名 → 扫码 → 钱包间划转（支付即结算）→ 风控监测 → 商户兑回（含回笼登记）→ 日终三方核对；步骤 moduleId 复用全景图模块（含新增 ecny-system）。
- 全景图核心层新增模块「数字人民币系统（钱包系统）」（ecny-system）：讲独立账本、与核心存款体系只有兑出/兑回两扇门、与央行系统的发行登记关系（顶部学习点计数 50 → 52：全景图 37→38、业务篇 6→7；链路场景 5→6 不计入学习点）。
- 术语表新增 4 条：数字人民币（e-CNY）、双层运营、钱包分级、可控匿名（34 → 38 条），各带例子与易混对照（vs 电子支付、vs 双轨运行、vs 账户分级、vs 完全匿名）。
- 口径延续：钱包限额、运营机构名单、试点范围只写试点公开口径并逐处标注（源头为人民银行《中国数字人民币的研发进展白皮书》及运营机构公开披露的通行转述）；明示尚处试点推广、未全面推广，不写普及时间表；美国 CBDC 表述按公开报道口径（美联储需国会授权、批发概念验证）。

## Edit 2026-11-17: 核心系统全貌（用户「银行系统 增加 银行核心系统的全貌」）
- 新增第七视图「核心系统全貌」（client/src/core.ts + App.tsx CoreView，导航排在全景图之后）：把全景图里只占一层的核心系统单独放大，内部拆六层十九模块——交易接入层（联机入口/交易码与编排/批量入口）、公共控制层（机构柜员/参数中心/授权内控）、客户与账户底座（客户主档/账户与账页结构/签约协议）、账务核心（记账引擎/存款分户账/贷款借据账/内部账与过渡科目）、业务交易服务（支付结算账务/卡账务/收费与中间业务账务）、日终与支撑层（计息引擎/日切与批处理调度/对账冲正与差错账务）；每模块沿用全景图五段式讲解（干什么/职责边界/和谁交互/举个例子/新手误解），点开复用 ModuleSheet，可标记已学。
- 同页另含四块静态讲解：一笔交易在核心内部的八步旅程（入口登记→交易码路由→公共校验→业务校验→记账引擎生成分录→同事务落账→清算衔接→应答与异步后处理，每步带失败处置）、核心的四本账（分户账/内部账/总账/表外账 + 勾稽关系）、核心边界五组对照（管什么/不管什么）、大机集中式 vs 分布式核心内部六维对照（数据组织/记账方式/扩展/日切/发布/容灾单位）；页尾跳转技术篇三篇（架构演进/日切/一致性），全景图页顶部加一条入口横幅跳本页。
- 学习点总数 52 → 71（全景图 38 + 核心全貌 19 + 业务篇 7 + 技术篇 7）；核心模块 id 以 core- 前缀独立命名，复用既有 marks 存储（kind=done），不新增表与迁移。
- 口径延续：按行业通行知识写，费率/限额/时序等数字标通行或示例口径，不冒充某一家银行现行参数；与全景图核心层八模块（CIF/账户/存款/贷款/卡/支付/总账/数字人民币钱包）分工为「全景图讲核心在全行的位置、本页讲核心内部构造」，内容不逐字重复（本页的 CIF/账户/账页讲主档治理、状态机与可用余额公式等更底层细节）。

## Edit 2026-11-17 (2): 数字人民币专篇按 2.0 重写（用户「按 2026 年 11 月的最新进展重写，补 2.0 存款货币模式、DCEPS 与 SMART 合约框架、江苏高校发薪试点和中老跨境互联」）
- 只改业务篇 biz-ecny 一章（intro/flow/systems/rules/example/pitfalls/compare 同结构重写）；全景图 ecny-system 模块、术语表 4 条、业务全链路 flow-ecny、其他章节与 marks 均未动（按用户「不改动其他章节、术语表和学习进度」）。
- 2.0 框架：2026-01-01 人行新一代计量框架实施（《行动方案》同步），现金型 1.0 → 存款货币型 2.0 三要素（存款型法定数字货币计入商业银行负债 / 双层运营升级为零售银行存款货币+批发央行结算货币、均带币串 / 账户为基础的混合模式「账户+币串+智能合约」）；实名钱包（一二三类）按活期利率计息、纳入存款保险保障——标公开报道口径，利率以各运营机构挂牌为准。来源：央视网 https://jingji.cctv.cn/2026/10/22/ARTISGlxmLyZmzLrCCCwjiaq261022.shtml 、新浪财经转载金融时报/运营管理中心口径 https://finance.sina.com.cn/blockchain/2026-10-24/doc-iniwhtfu4921222.shtml 。
- DCEPS 与 SMART：2026-10-21 金融街论坛数字人民币年会，陆磊宣布基础设施全面升级，运营管理中心发布央行端系统 DCEPS（八大核心服务、一点接入、7×24、为 CBETS 提供技术底座）与 e-CNY SMART Contract 框架（Standardized/Machine-enforced/Accessible/Rule-based/Trustworthy 五理念、五核心要素、WASM 沙箱+国密+默克尔树存证为公开报道口径）；运营机构 10→30 家、系统重要性银行全覆盖；截至 2026-09 末累计 43 亿笔/约 31 万亿元（运营管理中心公开数据）。来源：新浪财经 https://finance.sina.com.cn/jjxw/2026-10-22/doc-iniwarrp5929513.shtml 、新浪新闻详解 https://k.sina.cn/article_5953466437_162dab0450670bfmy4.html?from=tech 。
- 江苏高校发薪：江苏省财政厅统一部署，扬州大学/南通大学/江苏师范大学自 2026-11 起在职在编（含人事代理）工资经数字人民币钱包发放，要求二类及以上钱包，工资可自主兑回银行卡（各校财务通知口径，进度不一）。来源：中国教育和科研计算机网 CERNET http://www.edu.cn/xxh/focus/rd_xin_wen/202610/t20261028_2787340.shtml（综合南方日报/人民网/新华网/科技日报）。
- 中老跨境互联：2024 年两国央行签署数字支付与 CBDC 合作备忘录；2025-12 启动第一阶段、数币达 CBETS 与老挝 LAPNet 互联、中国居民 2025 年底起可在老挝收单商户扫码支付（内包外用）；2026-09-18 互联互通正式启动并扩展至经贸结算（数币达·励付 CBETS LIFT）。来源：36氪 https://www.36kr.com/p/3665966421238402 、老挝《万象时报》 https://www.vientianetimes.org.la/freefreenews/freecontent_183_Laos_y26.php 。
- 口径纪律延续：仍明示试点推广阶段、未全面推广、无时间表；钱包限额沿用试点公开口径并注「以运营机构现行规则为准」；核不到的细节不写（如各校具体发薪金额、CBETS 首批机构名单细节未采用二手数字）。

## Edit 2026-11-17 (3): 补齐 8 个重要系统（用户「8 个全补上」+ 主 agent 清单）
- 全景图：外围层新增 6 个可点模块——票据系统（bill-system，票交所 ECDS/承兑/贴现/质押）、资金司库与流动性管理（treasury-alm，ALM/FTP/头寸/LCR）、财务与管理会计（fin-mgmt-acct，成本分摊/预算/税务）、数据治理与监管数据集市（data-governance，数据标准/质量/主数据）、资产托管与登记过户（custody-csd，中债登/中证登/上清所/DVP）、国际结算与贸易金融（trade-finance，信用证/保函/供应链金融）；外部层新增 CIPS 独立模块（cips，直接/间接参与者、报文清算一体），原 cips-swift 模块改题为「SWIFT 与代理行」专讲外币路径；既有 reg-report 模块按四条线（EAST/1104/金融统计/反洗钱报送）加深重写（id 不变、marks 不受影响）。外围层 note 同步扩围。全景图模块 38 → 45。
- 业务篇新增 8 篇专篇（同结构：导读/6–7 步流程/系统支撑/关键规则/贯穿实例/误区/中美对照）：biz-regreport 监管报送、biz-cips 人民币跨境支付与 CIPS、biz-bills 票据业务、biz-treasury 资金司库与流动性管理、biz-finacct 财务与管理会计、biz-datagov 数据治理与监管数据集市、biz-custody 资产托管与登记过户、biz-tradefin 国际结算与贸易金融。业务篇 7 → 15 篇。
- 术语表新增 15 条：EAST、1104 报表、CIPS、承兑、贴现、FTP、流动性覆盖率（LCR）、管理会计、数据治理、主数据、资产托管、中央存管（登记结算）、信用证、保函、供应链金融（38 → 53 条），各带白话/专业/例子与易混对照。
- 学习点总数 71 → 86（全景图 45 + 核心全貌 19 + 业务篇 15 + 技术篇 7，TOTAL_LEARNABLE 为代码动态计算，无硬编码需改）；新模块/章节 id 独立命名，复用既有 marks 存储，不新增表与迁移；业务全链路未动。
- 口径延续：按行业通行知识与公开制度写（电票最长 1 年、LCR/NSFR ≥100%、UCP600 审单 5 个银行工作日、美国证券交收 T+1 等标公开制度口径）；CIPS 年清算量只写「数百万亿元量级（公开报道口径）」、参与者数写「以运营机构年度公开披露为准」；贴现利率、FTP 曲线等一律标示例口径；核不到的具体数字不写（如 CIPS 参与者精确家数、托管费率）。

## Long-term data behavior
- **Refresh policy**: none — curated teaching content fixed at build time; no live feed, no schedule.
- **Growth**: static content corpus (panorama modules, 6 business lines, 6 tech topics, ~12 vendor/case cards, ~30 glossary terms); user adds nothing.
- **Ordering**: panorama top-to-bottom by architecture layer; business/tech in curriculum order; glossary alphabetical-by-pinyin grouping with search on top.
- **Time semantics**: no dates rendered except source-attribution wording （公开报道/年报口径）.

## Rejected approaches
- **Tried**: runtime fetching of vendor/bank pages at open time.
  **Why rejected**: declared capabilities for this build exclude public web read at runtime, and a reference/learning page must be stable and citable; build-time curated content with attribution labels is the honest shape.
- **Tried**: photos/hero imagery.
  **Why rejected**: Imagery not needed — the subject is system architecture; the panorama is a structural diagram built from layout, and vendor cards are text reference cards. No real-world visual subjects to depict.
