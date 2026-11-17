import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import {
BUSINESS,
CN_CASES,
CN_VENDORS,
COMPARISON,
COMPARISON_INTRO,
PANORAMA,
TECH,
TERMS,
US_CASES,
US_VENDORS,
type BankCase,
type BusinessChapter,
type PanoramaModule,
type TechChapter,
type Vendor,
} from "./content";
import { JOURNEYS, type Journey } from "./journeys";
import {
  CORE_BOUNDARIES,
  CORE_FORMS,
  CORE_LEDGERS,
  CORE_PANORAMA,
  CORE_TXN_FLOW,
} from "./core";

type View = "panorama" | "core" | "journey" | "business" | "tech" | "vendors" | "glossary";

const VIEWS: { id: View; label: string }[] = [
  { id: "panorama", label: "全景图" },
  { id: "core", label: "核心系统全貌" },
  { id: "journey", label: "业务全链路" },
  { id: "business", label: "业务篇" },
  { id: "tech", label: "技术篇" },
  { id: "vendors", label: "厂商与案例" },
  { id: "glossary", label: "术语表" },
];

const MODULE_INDEX = new Map(
  PANORAMA.flatMap((layer) =>
    layer.modules.map((m) => [m.id, { module: m, layerName: layer.name }] as const),
  ),
);

const TOTAL_LEARNABLE =
  PANORAMA.reduce((n, l) => n + l.modules.length, 0) +
  CORE_PANORAMA.reduce((n, l) => n + l.modules.length, 0) +
  BUSINESS.length +
  TECH.length;

function useMarks() {
  const queryClient = useQueryClient();
  const marksQuery = useQuery({
    queryKey: ["marks"],
    queryFn: () => api.listMarks({}),
  });
  const done = useMemo(
    () =>
      new Set(
        (marksQuery.data?.marks ?? [])
          .filter((m) => m.kind === "done")
          .map((m) => m.itemId),
      ),
    [marksQuery.data],
  );
  const favs = useMemo(
    () =>
      new Set(
        (marksQuery.data?.marks ?? [])
          .filter((m) => m.kind === "fav")
          .map((m) => m.itemId),
      ),
    [marksQuery.data],
  );
  const setMark = useMutation({
    mutationFn: async (args: {
      itemId: string;
      kind: "done" | "fav";
      marked: boolean;
    }) => await api.setMark(args),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["marks"] }),
  });
  return { done, favs, setMark };
}

type Marks = ReturnType<typeof useMarks>;

function DoneToggle({
  marks,
  itemId,
  label,
}: {
  marks: Marks;
  itemId: string;
  label?: string;
}) {
  const isDone = marks.done.has(itemId);
  return (
    <button
      type="button"
      aria-label={isDone ? "取消已学标记" : "标记为已学"}
      aria-pressed={isDone}
      onClick={() =>
        marks.setMark.mutate({ itemId, kind: "done", marked: !isDone })
      }
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors ${
        isDone
          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
      }`}
    >
      <span aria-hidden>{isDone ? "✓" : "○"}</span>
      {label ?? (isDone ? "已学" : "标记已学")}
    </button>
  );
}

// ---------------------------------------------------------------------------
// 全景图
// ---------------------------------------------------------------------------

function PanoramaView({
  marks,
  onOpenModule,
  onGoCore,
}: {
  marks: Marks;
  onOpenModule: (m: PanoramaModule, layerName: string) => void;
  onGoCore: () => void;
}) {
  return (
    <div>
      <p className="text-sm leading-6 text-[var(--dim)]">
        一家银行的 IT 系统全貌，自上而下共七层。点任意模块，看它干什么、和谁交互、以及新手最容易误解的一点——从这里开始，整座银行就有了地图。
      </p>
      <button
        type="button"
        onClick={onGoCore}
        className="mt-3 flex w-full items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--surface)] px-4 py-3 text-left"
      >
        <span>
          <span className="block text-[15px] font-bold text-[var(--text)]">核心系统在这里只占一层 — 去看它的内部全貌</span>
          <span className="mt-0.5 block text-[13px] leading-5 text-[var(--dim)]">六层 · 十九个内部模块 · 一笔交易在核心内部的八步旅程 · 四本账与边界</span>
        </span>
        <span className="shrink-0 text-lg text-[var(--accent)]" aria-hidden>→</span>
      </button>
      <div className="mt-5 space-y-6">
        {PANORAMA.map((layer, li) => (
          <section key={layer.id} aria-label={layer.name}>
            <div className="flex items-baseline gap-2.5">
              <span
                className="font-display text-lg font-bold text-[var(--accent)]"
                aria-hidden
              >
                {String(li + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-lg font-bold text-[var(--text)]">
                {layer.name}
              </h2>
              <span className="text-xs tracking-wide text-[var(--dim)]">
                {layer.en}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-5 text-[var(--dim)]">
              {layer.note}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {layer.modules.map((m) => {
                const isDone = marks.done.has(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onOpenModule(m, layer.name)}
                    aria-label={`${m.name}，查看讲解${isDone ? "（已学）" : ""}`}
                    className="relative rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-left transition-colors hover:border-[var(--accent)]"
                  >
                    {isDone && (
                      <span
                        className="absolute right-2 top-2 text-xs text-[var(--accent)]"
                        aria-hidden
                      >
                        ✓
                      </span>
                    )}
                    <span className="block text-[15px] font-semibold leading-5 text-[var(--text)]">
                      {m.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[var(--dim)]">
                      {m.en}
                    </span>
                  </button>
                );
              })}
            </div>
            {li < PANORAMA.length - 1 && (
              <div className="mt-4 flex justify-center" aria-hidden>
                <span className="text-[var(--dim)]">↓</span>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function ModuleSheet({
  module,
  layerName,
  marks,
  onClose,
}: {
  module: PanoramaModule;
  layerName: string;
  marks: Marks;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${module.name}讲解`}
      onClick={onClose}
    >
      <div
        className="max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-[var(--surface)] p-5 pb-8 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--accent)]">
              {layerName}
            </p>
            <h3 className="font-display mt-1 text-xl font-bold text-[var(--text)]">
              {module.name}
            </h3>
            <p className="text-xs text-[var(--dim)]">{module.en}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭讲解"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg text-[var(--dim)]"
          >
            ×
          </button>
        </div>
        <div className="mt-4 space-y-4 text-[15px] leading-7 text-[var(--text)]">
          <section>
            <h4 className="mb-1 text-sm font-bold text-[var(--navy)] dark:text-[var(--brass)]">
              它干什么
            </h4>
            <p>{module.role}</p>
          </section>
          <section>
            <h4 className="mb-1 text-sm font-bold text-[var(--navy)] dark:text-[var(--brass)]">
              职责边界
            </h4>
            <p>{module.boundary}</p>
          </section>
          <section>
            <h4 className="mb-1 text-sm font-bold text-[var(--navy)] dark:text-[var(--brass)]">
              和谁交互
            </h4>
            <p>{module.interact}</p>
          </section>
          <section>
            <h4 className="mb-1 text-sm font-bold text-[var(--navy)] dark:text-[var(--brass)]">
              举个例子
            </h4>
            <p>{module.example}</p>
          </section>
          <section className="rounded-[var(--radius)] bg-[var(--surface-alt)] p-3.5">
            <h4 className="mb-1 text-sm font-bold text-[var(--accent)]">
              新手最容易误解
            </h4>
            <p>{module.misconception}</p>
          </section>
        </div>
        <div className="mt-5">
          <DoneToggle marks={marks} itemId={module.id} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 核心系统全貌
// ---------------------------------------------------------------------------

function CoreView({
  marks,
  onOpenModule,
  onOpenTech,
}: {
  marks: Marks;
  onOpenModule: (m: PanoramaModule, layerName: string) => void;
  onOpenTech: (c: TechChapter) => void;
}) {
  const coreModuleCount = CORE_PANORAMA.reduce((n, l) => n + l.modules.length, 0);
  const coreDone = CORE_PANORAMA.flatMap((l) => l.modules).filter((m) =>
    marks.done.has(m.id),
  ).length;
  const evolution = TECH.find((t) => t.id === "tech-evolution");
  const daycut = TECH.find((t) => t.id === "tech-daycut");
  const consistency = TECH.find((t) => t.id === "tech-consistency");
  return (
    <div>
      <p className="text-sm leading-6 text-[var(--dim)]">
        全景图里核心只占一层，这一页把它单独放大：核心不是一台机器、也不是一个模块，而是一整套分工明确的账务工厂。下面按它内部的六层拆开——点任意模块看详细讲解，再顺着一笔交易在核心内部的旅程、四本账与边界，把「银行的账到底是怎么记的」一次看全。
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-center">
          <p className="font-display text-xl font-bold text-[var(--text)]">{coreModuleCount}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-[var(--dim)]">内部模块 · 六层</p>
        </div>
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-center">
          <p className="font-display text-xl font-bold text-[var(--text)]">{CORE_TXN_FLOW.length} 步</p>
          <p className="mt-0.5 text-[11px] leading-4 text-[var(--dim)]">一笔交易在核心内部的旅程</p>
        </div>
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-center">
          <p className="font-display text-xl font-bold text-[var(--accent)]">
            {coreDone} / {coreModuleCount}
          </p>
          <p className="mt-0.5 text-[11px] leading-4 text-[var(--dim)]">本页已学模块</p>
        </div>
      </div>

      <div className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="font-display text-[16px] font-bold text-[var(--text)]">先记住三句话</h2>
        <ul className="mt-2.5 space-y-2 text-[15px] leading-7 text-[var(--text)]">
          <li className="flex gap-2"><span className="text-[var(--accent)]" aria-hidden>▪</span><span><strong>核心只管账，不管业务该不该办。</strong>审批在信贷等业务系统，核心照单记账；但单不对，核心有权拒办。</span></li>
          <li className="flex gap-2"><span className="text-[var(--accent)]" aria-hidden>▪</span><span><strong>余额只能被分录改变，不能被直接修改。</strong>所有落账收口到记账引擎一个入口，改账永远以新分录纠旧分录、只增不删。</span></li>
          <li className="flex gap-2"><span className="text-[var(--accent)]" aria-hidden>▪</span><span><strong>白天记明细，夜里算总账。</strong>联机保实时落账，日终靠计息、对账、总分核对把一天收平——日切就是核心的一天分界线。</span></li>
        </ul>
      </div>

      <h2 className="font-display mt-8 text-xl font-bold text-[var(--text)]">内部六层全景</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--dim)]">自上而下：一笔交易从接入层进来，经公共控制与底座校验，在账务核心落账，再由日终层收官。层与层之间是调用关系，不是摆放顺序。</p>
      <div className="mt-4 space-y-6">
        {CORE_PANORAMA.map((layer, li) => (
          <section key={layer.id} aria-label={layer.name}>
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-lg font-bold text-[var(--accent)]" aria-hidden>
                {String(li + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-lg font-bold text-[var(--text)]">{layer.name}</h3>
              <span className="text-xs tracking-wide text-[var(--dim)]">{layer.en}</span>
            </div>
            <p className="mt-1 text-[13px] leading-5 text-[var(--dim)]">{layer.note}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {layer.modules.map((m) => {
                const isDone = marks.done.has(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onOpenModule(m, layer.name)}
                    aria-label={`${m.name}，查看讲解${isDone ? "（已学）" : ""}`}
                    className="relative rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-left transition-colors hover:border-[var(--accent)]"
                  >
                    {isDone && (
                      <span className="absolute right-2 top-2 text-xs text-[var(--accent)]" aria-hidden>✓</span>
                    )}
                    <span className="block text-[15px] font-semibold leading-5 text-[var(--text)]">{m.name}</span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[var(--dim)]">{m.en}</span>
                  </button>
                );
              })}
            </div>
            {li < CORE_PANORAMA.length - 1 && (
              <div className="mt-4 flex justify-center" aria-hidden><span className="text-[var(--dim)]">↓</span></div>
            )}
          </section>
        ))}
      </div>

      <h2 className="font-display mt-10 text-xl font-bold text-[var(--text)]">一笔交易在核心内部的旅程</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--dim)]">以一笔转账为例：从入口登记流水到应答返回，八步缺一不可。前四步只校验不动账，第五、六步才真正落账——拒绝发生在记账之前，所以拒绝不留账务痕迹。</p>
      <ol className="mt-4 space-y-0">
        {CORE_TXN_FLOW.map((s, i) => (
          <li key={s.title} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < CORE_TXN_FLOW.length - 1 && (
              <span className="absolute left-[13px] top-8 h-[calc(100%-24px)] w-px bg-[var(--border)]" aria-hidden />
            )}
            <span className="font-display z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[13px] font-bold text-white" aria-hidden>{i + 1}</span>
            <div className="min-w-0 pt-0.5">
              <p className="text-[15px] font-semibold text-[var(--text)]">{s.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--dim)]">{s.desc}</p>
              <p className="mt-1.5 rounded-[var(--radius)] bg-[var(--surface-alt)] px-3 py-2 text-[13px] leading-5 text-[var(--text)]"><span className="font-semibold text-[var(--accent)]">这一步失败：</span>{s.failure}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="font-display mt-10 text-xl font-bold text-[var(--text)]">核心的四本账</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--dim)]">同一笔钱在四本账里有四种记法，互相勾稽：分户账加总等于总账、内部账当日要清、表外账管账面之外的责任。看懂四本账，就看懂了银行会计的骨架。</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {CORE_LEDGERS.map((l) => (
          <div key={l.name} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="font-display text-[16px] font-bold text-[var(--text)]">{l.name}</h3>
            <p className="text-[11px] text-[var(--dim)]">{l.en}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text)]">{l.desc}</p>
            <p className="mt-2 text-[13px] leading-5 text-[var(--dim)]"><span className="font-semibold text-[var(--accent)]">例子 </span>{l.example}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-[var(--radius)] bg-[var(--surface-alt)] px-4 py-3 text-sm leading-6 text-[var(--text)]">勾稽关系一句话：分户账是明细、总账是汇总，明细之和必须等于汇总（总分核对）；内部账是中转，余额不归零就说明有钱卡在半路；表外账不进报表，但核销贷款、保函、托管都靠它记着，丢一笔就是丢一份责任记录。</p>

      <h2 className="font-display mt-10 text-xl font-bold text-[var(--text)]">核心的边界：管什么，不管什么</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--dim)]">核心的强大来自收口，它的局限同样来自收口——不在它职责内的事，它一概不碰，碰了就是越界。</p>
      <div className="mt-3 space-y-2.5">
        {CORE_BOUNDARIES.map((b) => (
          <div key={b.item} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
            <p className="text-sm font-bold text-[var(--text)]">{b.item}</p>
            <p className="mt-1.5 text-sm leading-6 text-[var(--text)]"><span className="mr-1.5 font-semibold text-[var(--accent)]">核心管</span>{b.core}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text)]"><span className="mr-1.5 font-semibold text-[var(--brass)]">核心不管</span>{b.outside}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display mt-10 text-xl font-bold text-[var(--text)]">两种形态：大机核心 vs 分布式核心</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--dim)]">业务分工几乎不变，变的是内部实现：数据怎么存、账怎么落、日切怎么跑。这一组对照看的是核心内部，不是选型口号。</p>
      <div className="mt-3 space-y-3">
        {CORE_FORMS.map((d) => (
          <div key={d.item} className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
            <p className="border-b border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2.5 text-sm font-bold text-[var(--text)]">{d.item}</p>
            <div className="grid gap-0 sm:grid-cols-2">
              <p className="px-4 py-3 text-sm leading-6 text-[var(--text)] sm:border-r sm:border-[var(--border)]"><span className="mb-1 block text-xs font-bold text-[var(--accent)]">大机集中式</span>{d.mainframe}</p>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm leading-6 text-[var(--text)] sm:border-t-0"><span className="mb-1 block text-xs font-bold text-[var(--brass)]">分布式</span>{d.distributed}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display mt-10 text-xl font-bold text-[var(--text)]">接着往深处学</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--dim)]">这一页讲的是核心内部的静态全貌；核心怎么演进、一天怎么收官、分布式下账怎么对平，在技术篇里逐个展开。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {evolution && (
          <button type="button" onClick={() => onOpenTech(evolution)} className="min-h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--accent)]">技术篇 · {evolution.title} →</button>
        )}
        {daycut && (
          <button type="button" onClick={() => onOpenTech(daycut)} className="min-h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--accent)]">技术篇 · {daycut.title} →</button>
        )}
        {consistency && (
          <button type="button" onClick={() => onOpenTech(consistency)} className="min-h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--accent)]">技术篇 · {consistency.title} →</button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 业务篇 / 技术篇
// ---------------------------------------------------------------------------

function ChapterList<T extends { id: string; title: string; en: string; intro: string }>({
  chapters,
  marks,
  onOpen,
}: {
  chapters: T[];
  marks: Marks;
  onOpen: (c: T) => void;
}) {
  return (
    <div className="space-y-3">
      {chapters.map((c, i) => {
        const isDone = marks.done.has(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onOpen(c)}
            aria-label={`阅读：${c.title}${isDone ? "（已学）" : ""}`}
            className="block w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition-colors hover:border-[var(--accent)]"
          >
            <div className="flex items-baseline gap-2.5">
              <span
                className="font-display text-base font-bold text-[var(--accent)]"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-[17px] font-bold text-[var(--text)]">
                {c.title}
              </span>
              <span className="text-[11px] text-[var(--dim)]">{c.en}</span>
              {isDone && (
                <span className="ml-auto shrink-0 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent-ink)]">
                  已学
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--dim)]">
              {c.intro}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function BusinessReader({
  chapter,
  marks,
  onBack,
}: {
  chapter: BusinessChapter;
  marks: Marks;
  onBack: () => void;
}) {
  return (
    <article>
      <button
        type="button"
        onClick={onBack}
        aria-label="返回业务篇目录"
        className="mb-3 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-[var(--accent)]"
      >
        ← 业务篇目录
      </button>
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">
        {chapter.title}
      </h2>
      <p className="mt-0.5 text-xs tracking-wide text-[var(--dim)]">
        {chapter.en}
      </p>
      <p className="mt-3 text-[15px] leading-7 text-[var(--text)]">
        {chapter.intro}
      </p>

      <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
        {chapter.flowTitle}
      </h3>
      <ol className="mt-3 space-y-0">
        {chapter.flow.map((s, i) => (
          <li key={s.step} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < chapter.flow.length - 1 && (
              <span
                className="absolute left-[13px] top-8 h-[calc(100%-24px)] w-px bg-[var(--border)]"
                aria-hidden
              />
            )}
            <span
              className="font-display z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--navy)] text-[13px] font-bold text-white"
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="pt-0.5">
              <p className="text-[15px] font-semibold text-[var(--text)]">
                {s.step}
              </p>
              <p className="mt-0.5 text-sm leading-6 text-[var(--dim)]">
                {s.desc}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
        系统怎么支撑
      </h3>
      <ul className="mt-2.5 space-y-2">
        {chapter.systems.map((s) => (
          <li
            key={s.slice(0, 24)}
            className="flex gap-2 text-[15px] leading-7 text-[var(--text)]"
          >
            <span className="text-[var(--brass)]" aria-hidden>
              ▪
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ul>

      <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
        关键规则
      </h3>
      <div className="mt-3 space-y-2.5">
        {chapter.rules.map((r) => (
          <p
            key={r.slice(0, 24)}
            className="rounded-[var(--radius)] border-l-2 border-[var(--accent)] bg-[var(--surface)] px-3.5 py-2.5 text-sm leading-6 text-[var(--text)]"
          >
            {r}
          </p>
        ))}
      </div>

      {chapter.example && (
        <>
          <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
            {chapter.example.title}
          </h3>
          <p className="mt-3 rounded-[var(--radius)] bg-[var(--surface-alt)] px-4 py-3.5 text-[15px] leading-7 text-[var(--text)]">
            {chapter.example.body}
          </p>
        </>
      )}

      {chapter.pitfalls && (
        <>
          <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
            常见误区与易混点
          </h3>
          <ul className="mt-2.5 space-y-2">
            {chapter.pitfalls.map((p) => (
              <li
                key={p.slice(0, 24)}
                className="flex gap-2 text-[15px] leading-7 text-[var(--text)]"
              >
                <span className="text-[var(--accent)]" aria-hidden>
                  ▪
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {chapter.compare && (
        <>
          <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
            {chapter.compare.title}
          </h3>
          <div className="mt-3 space-y-2.5">
            {chapter.compare.rows.map((row) => (
              <div
                key={row.item}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3.5"
              >
                <p className="text-sm font-bold text-[var(--text)]">
                  {row.item}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-[var(--text)]">
                  <span className="mr-1.5 font-semibold text-[var(--accent)]">
                    中国
                  </span>
                  {row.china}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text)]">
                  <span className="mr-1.5 font-semibold text-[var(--brass)]">
                    美国
                  </span>
                  {row.us}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 border-t border-[var(--border)] pt-4">
        <DoneToggle marks={marks} itemId={chapter.id} label={marks.done.has(chapter.id) ? "本篇已学完" : "标记本篇已学完"} />
      </div>
    </article>
  );
}

function TechReader({
  chapter,
  marks,
  onBack,
}: {
  chapter: TechChapter;
  marks: Marks;
  onBack: () => void;
}) {
  return (
    <article>
      <button
        type="button"
        onClick={onBack}
        aria-label="返回技术篇目录"
        className="mb-3 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-[var(--accent)]"
      >
        ← 技术篇目录
      </button>
      <h2 className="font-display text-2xl font-bold text-[var(--text)]">
        {chapter.title}
      </h2>
      <p className="mt-0.5 text-xs tracking-wide text-[var(--dim)]">
        {chapter.en}
      </p>
      <p className="mt-3 text-[15px] leading-7 text-[var(--text)]">
        {chapter.intro}
      </p>
      {chapter.sections.map((s) => (
        <section key={s.h} className="mt-6">
          <h3 className="font-display text-[17px] font-bold text-[var(--text)]">
            {s.h}
          </h3>
          <p className="mt-1.5 text-[15px] leading-7 text-[var(--text)]">
            {s.body}
          </p>
          {s.points && (
            <ul className="mt-2 space-y-1.5">
              {s.points.map((p) => (
                <li
                  key={p.slice(0, 24)}
                  className="flex gap-2 text-sm leading-6 text-[var(--dim)]"
                >
                  <span className="text-[var(--brass)]" aria-hidden>
                    ▪
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <div className="mt-8 border-t border-[var(--border)] pt-4">
        <DoneToggle marks={marks} itemId={chapter.id} label={marks.done.has(chapter.id) ? "本篇已学完" : "标记本篇已学完"} />
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// 厂商与案例
// ---------------------------------------------------------------------------

function VendorCard({ v, accent }: { v: Vendor; accent: boolean }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <h4 className="font-display text-[17px] font-bold text-[var(--text)]">
          {v.name}
        </h4>
        <span className="text-[11px] text-[var(--dim)]">{v.en}</span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${
            accent ? "bg-[var(--accent)]" : "bg-[var(--brass)]"
          }`}
        >
          {accent ? "中国厂商" : "美国厂商"}
        </span>
      </div>
      <dl className="mt-3 space-y-2.5 text-sm leading-6">
        <div>
          <dt className="font-semibold text-[var(--text)]">定位</dt>
          <dd className="text-[var(--dim)]">{v.positioning}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text)]">代表产品</dt>
          <dd className="text-[var(--dim)]">{v.products}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text)]">技术路线</dt>
          <dd className="text-[var(--dim)]">{v.route}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text)]">客户口径</dt>
          <dd className="text-[var(--dim)]">{v.clients}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text)]">典型部署形态</dt>
          <dd className="text-[var(--dim)]">{v.deployment}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--text)]">公开案例</dt>
          <dd className="text-[var(--dim)]">{v.caseDetail}</dd>
        </div>
      </dl>
    </div>
  );
}

function CaseCard({ c }: { c: BankCase }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <h4 className="font-display text-[17px] font-bold text-[var(--text)]">
          {c.name}
        </h4>
        <span className="text-[11px] text-[var(--dim)]">{c.en}</span>
      </div>
      <p className="mt-1.5 text-[15px] font-semibold leading-6 text-[var(--text)]">
        {c.headline}
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--dim)]">{c.detail}</p>
      <p className="mt-2 text-xs text-[var(--dim)]">{c.source}</p>
    </div>
  );
}

function VendorsView() {
  const [scope, setScope] = useState<"cn" | "us">("cn");
  return (
    <div>
      <div
        className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1"
        role="tablist"
        aria-label="厂商与案例分组"
      >
        {(
          [
            { id: "cn", label: "中国组" },
            { id: "us", label: "美国组" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={scope === t.id}
            onClick={() => setScope(t.id)}
            className={`min-h-9 rounded-full px-5 text-sm font-semibold transition-colors ${
              scope === t.id
                ? "bg-[var(--navy)] text-white"
                : "text-[var(--dim)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {scope === "cn" ? (
        <>
          <h3 className="font-display mt-6 text-lg font-bold text-[var(--text)]">
            核心系统厂商
          </h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {CN_VENDORS.map((v) => (
              <VendorCard key={v.id} v={v} accent />
            ))}
          </div>
          <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
            银行自研与转型案例
          </h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {CN_CASES.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        </>
      ) : (
        <>
          <h3 className="font-display mt-6 text-lg font-bold text-[var(--text)]">
            核心与数字银行厂商
          </h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {US_VENDORS.map((v) => (
              <VendorCard key={v.id} v={v} accent={false} />
            ))}
          </div>
          <h3 className="font-display mt-7 text-lg font-bold text-[var(--text)]">
            银行技术案例
          </h3>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {US_CASES.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        </>
      )}

      <h3 className="font-display mt-9 text-lg font-bold text-[var(--text)]">
        中美对照：激进的方向不同
      </h3>
      <p className="mt-2 text-[15px] leading-7 text-[var(--text)]">
        {COMPARISON_INTRO}
      </p>
      <div className="mt-4 space-y-3">
        {COMPARISON.map((d) => (
          <div
            key={d.dimension}
            className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]"
          >
            <p className="border-b border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2.5 text-sm font-bold text-[var(--text)]">
              {d.dimension}
            </p>
            <div className="grid gap-0 sm:grid-cols-2">
              <p className="px-4 py-3 text-sm leading-6 text-[var(--text)] sm:border-r sm:border-[var(--border)]">
                <span className="mb-1 block text-xs font-bold text-[var(--accent)]">
                  中国
                </span>
                {d.china}
              </p>
              <p className="border-t border-[var(--border)] px-4 py-3 text-sm leading-6 text-[var(--text)] sm:border-t-0">
                <span className="mb-1 block text-xs font-bold text-[var(--brass)]">
                  美国
                </span>
                {d.us}
              </p>
            </div>
            <p className="border-t border-[var(--border)] px-4 py-2.5 text-[13px] leading-5 text-[var(--dim)]">
              {d.takeaway}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 术语表
// ---------------------------------------------------------------------------

function GlossaryView({ marks }: { marks: Marks }) {
  const [query, setQuery] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TERMS.filter((t) => {
      if (favOnly && !marks.favs.has(t.id)) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.en.toLowerCase().includes(q) ||
        t.plain.includes(query.trim()) ||
        t.pro.includes(query.trim())
      );
    });
  }, [query, favOnly, marks.favs]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="term-search">
          搜索术语
        </label>
        <input
          id="term-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜术语，如：日切、清算、ACH…"
          className="min-h-11 flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-[15px] text-[var(--text)] outline-none placeholder:text-[var(--dim)] focus:border-[var(--accent)]"
        />
        <button
          type="button"
          aria-pressed={favOnly}
          aria-label="只看收藏的术语"
          onClick={() => setFavOnly((v) => !v)}
          className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
            favOnly
              ? "border-[var(--brass)] bg-[var(--brass)] text-white"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
          }`}
        >
          ★ 收藏（{marks.favs.size}）
        </button>
      </div>
      <p className="mt-3 text-[13px] text-[var(--dim)]">
        共 {TERMS.length} 条 · 当前显示 {filtered.length} 条。每条先给一句白话，再给一句专业解释。
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {filtered.map((t) => {
          const isFav = marks.favs.has(t.id);
          return (
            <div
              key={t.id}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-display text-[16px] font-bold text-[var(--text)]">
                    {t.term}
                  </h4>
                  <p className="text-[11px] text-[var(--dim)]">{t.en}</p>
                </div>
                <button
                  type="button"
                  aria-label={isFav ? `取消收藏${t.term}` : `收藏${t.term}`}
                  aria-pressed={isFav}
                  onClick={() =>
                    marks.setMark.mutate({
                      itemId: t.id,
                      kind: "fav",
                      marked: !isFav,
                    })
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base ${
                    isFav
                      ? "border-[var(--brass)] bg-[var(--brass)] text-white"
                      : "border-[var(--border)] text-[var(--dim)]"
                  }`}
                >
                  ★
                </button>
              </div>
              <p className="mt-2.5 text-sm leading-6 text-[var(--text)]">
                <span className="mr-1.5 font-semibold text-[var(--accent)]">
                  白话
                </span>
                {t.plain}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--dim)]">
                <span className="mr-1.5 font-semibold text-[var(--navy)] dark:text-[var(--brass)]">
                  专业
                </span>
                {t.pro}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--dim)]">
                <span className="mr-1.5 font-semibold text-[var(--accent)]">
                  例子
                </span>
                {t.example}
              </p>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-[var(--dim)]">
          没有匹配的术语，换个关键词试试。
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 业务全链路
// ---------------------------------------------------------------------------

const SPEEDS = [
  { id: 1, label: "1×", ms: 2600 },
  { id: 2, label: "2×", ms: 1300 },
  { id: 4, label: "4×", ms: 650 },
] as const;

function JourneyView({
  marks,
  onOpenModule,
  onOpenChapter,
}: {
  marks: Marks;
  onOpenModule: (m: PanoramaModule, layerName: string) => void;
  onOpenChapter: (c: BusinessChapter) => void;
}) {
  const [journeyId, setJourneyId] = useState(JOURNEYS[0]!.id);
  const journey: Journey =
    JOURNEYS.find((j) => j.id === journeyId) ?? JOURNEYS[0]!;
  const total = journey.steps.length;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedId, setSpeedId] = useState<(typeof SPEEDS)[number]["id"]>(1);
  const speed = SPEEDS.find((s) => s.id === speedId) ?? SPEEDS[0]!;
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 播放引擎：按速度逐歩推进，走到最后一步自动停。
  useEffect(() => {
    if (!playing) return;
    if (current >= total - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setCurrent((c) => Math.min(c + 1, total - 1)), speed.ms);
    return () => clearTimeout(t);
  }, [playing, current, total, speed.ms]);

  // 当前节点滚入视野（长链路在手机上不必手动追）。
  useEffect(() => {
    nodeRefs.current[current]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [current, journeyId]);

  const selectJourney = (id: string) => {
    setJourneyId(id);
    setCurrent(0);
    setPlaying(false);
  };
  const jumpTo = (i: number) => {
    setCurrent(i);
    setPlaying(i < total - 1);
  };
  const togglePlay = () => {
    if (!playing && current >= total - 1) setCurrent(0);
    setPlaying((p) => !p);
  };

  const step = journey.steps[current]!;
  const stepModule = MODULE_INDEX.get(step.moduleId);
  const chapter = BUSINESS.find((b) => b.id === journey.chapterId);
  const ledgerSoFar = journey.steps
    .slice(0, current + 1)
    .flatMap((s, i) =>
      (s.ledger ?? []).map((line) => ({ stepNo: i + 1, line })),
    );

  return (
    <div>
      <p className="text-sm leading-6 text-[var(--dim)]">
        选一笔真实业务，按下播放，看它一步步流经哪些系统：当前节点点亮、走过的留痕、没走到的置灰。右侧面板同步讲这一步在做什么、账怎么动、失败了怎么办。
      </p>

      {/* 场景选择 */}
      <div
        className="mt-4 flex flex-wrap gap-2"
        role="tablist"
        aria-label="选择业务场景"
      >
        {JOURNEYS.map((j) => (
          <button
            key={j.id}
            type="button"
            role="tab"
            aria-selected={j.id === journeyId}
            onClick={() => selectJourney(j.id)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              j.id === journeyId
                ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
            }`}
          >
            {j.title}
            <span
              className={`ml-1.5 text-[11px] font-normal ${
                j.id === journeyId ? "text-white/70" : "text-[var(--dim)]"
              }`}
            >
              {j.steps.length} 步
            </span>
          </button>
        ))}
      </div>

      <h2 className="font-display mt-5 text-xl font-bold text-[var(--text)]">
        {journey.title}
      </h2>
      <p className="mt-0.5 text-xs tracking-wide text-[var(--dim)]">
        {journey.en}
      </p>
      <p className="mt-2 text-[15px] font-medium leading-6 text-[var(--text)]">
        {journey.tagline}
      </p>
      <p className="mt-1.5 text-sm leading-6 text-[var(--dim)]">
        {journey.intro}
      </p>
      {chapter && (
        <button
          type="button"
          onClick={() => onOpenChapter(chapter)}
          className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-medium text-[var(--accent)]"
        >
          去业务篇看《{chapter.title}》完整讲解 →
        </button>
      )}

      {/* 播放控制 */}
      <div className="sticky top-[104px] z-20 mt-4 flex flex-wrap items-center gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 shadow-sm sm:top-[108px]">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "暂停播放" : current >= total - 1 ? "重新播放" : "播放"}
          className="min-h-10 rounded-full bg-[var(--accent)] px-5 text-sm font-bold text-[var(--accent-ink)]"
        >
          {playing ? "❚❚ 暂停" : current >= total - 1 ? "↻ 重播" : "▶ 播放"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setCurrent((c) => Math.max(0, c - 1));
          }}
          disabled={current === 0}
          aria-label="上一步"
          className="min-h-10 rounded-full border border-[var(--border)] px-3.5 text-sm font-medium text-[var(--text)] disabled:opacity-40"
        >
          ← 上一步
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setCurrent((c) => Math.min(total - 1, c + 1));
          }}
          disabled={current >= total - 1}
          aria-label="下一步"
          className="min-h-10 rounded-full border border-[var(--border)] px-3.5 text-sm font-medium text-[var(--text)] disabled:opacity-40"
        >
          下一步 →
        </button>
        <div
          className="ml-auto inline-flex rounded-full border border-[var(--border)] p-0.5"
          role="group"
          aria-label="播放速度"
        >
          {SPEEDS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={speedId === s.id}
              aria-label={`播放速度 ${s.label}`}
              onClick={() => setSpeedId(s.id)}
              className={`min-h-8 rounded-full px-3 text-[13px] font-semibold ${
                speedId === s.id
                  ? "bg-[var(--navy)] text-white"
                  : "text-[var(--dim)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="w-full text-xs text-[var(--dim)] sm:w-auto" aria-live="polite">
          第 {current + 1} / {total} 步
        </span>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-alt)]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current + 1}
          aria-label="流程进度"
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* 节点链 */}
        <ol aria-label="业务流经的系统链">
          {journey.steps.map((s, i) => {
            const info = MODULE_INDEX.get(s.moduleId);
            const state =
              i < current ? "done" : i === current ? "active" : "todo";
            return (
              <li key={`${s.moduleId}-${i}`} className="relative flex gap-3 pb-3 last:pb-0">
                {i < total - 1 && (
                  <span
                    className={`absolute left-[15px] top-9 h-[calc(100%-28px)] w-0.5 ${
                      i < current ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                    }`}
                    aria-hidden
                  />
                )}
                <span
                  className={`font-display z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                    state === "active"
                      ? "journey-node-active bg-[var(--accent)] text-[var(--accent-ink)]"
                      : state === "done"
                        ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                        : "border border-[var(--border)] bg-[var(--surface)] text-[var(--dim)]"
                  }`}
                  aria-hidden
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <button
                  type="button"
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  onClick={() => jumpTo(i)}
                  aria-label={`跳到第 ${i + 1} 步：${info?.module.name ?? ""}，${s.title}`}
                  aria-current={state === "active" ? "step" : undefined}
                  className={`min-w-0 flex-1 rounded-[var(--radius)] border px-3.5 py-2.5 text-left transition-colors ${
                    state === "active"
                      ? "border-[var(--accent)] bg-[var(--surface)] shadow-sm"
                      : state === "done"
                        ? "border-[var(--border)] bg-[var(--surface)]"
                        : "border-[var(--border)] bg-[var(--surface)] opacity-55"
                  }`}
                >
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[15px] font-bold text-[var(--text)]">
                      {info?.module.name ?? s.moduleId}
                    </span>
                    <span className="text-[11px] text-[var(--dim)]">
                      {info?.layerName}
                    </span>
                    {state === "active" && (
                      <span className="ml-auto rounded-full bg-[var(--accent)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent-ink)]">
                        正在处理
                      </span>
                    )}
                    {state === "done" && (
                      <span className="ml-auto text-[11px] font-medium text-[var(--accent)]">
                        已流经
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-[var(--dim)]">
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* 步骤面板 + 账务小窗 */}
        <div className="min-w-0">
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs font-medium tracking-wide text-[var(--accent)]">
              第 {current + 1} 步 · {stepModule?.layerName}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5">
              <h3 className="font-display text-lg font-bold text-[var(--text)]">
                {step.title}
              </h3>
            </div>
            {stepModule && (
              <button
                type="button"
                onClick={() =>
                  onOpenModule(stepModule.module, stepModule.layerName)
                }
                aria-label={`查看全景图模块讲解：${stepModule.module.name}`}
                className="mt-1.5 inline-flex min-h-9 items-center gap-1 rounded-full border border-[var(--border)] px-3 text-[13px] font-medium text-[var(--accent)]"
              >
                系统：{stepModule.module.name}（{stepModule.module.en}）· 看模块讲解 →
              </button>
            )}
            <p className="mt-3 text-[15px] leading-7 text-[var(--text)]">
              {step.detail}
            </p>
            <div className="mt-3.5 rounded-[var(--radius)] bg-[var(--surface-alt)] p-3.5">
              <h4 className="text-sm font-bold text-[var(--accent)]">
                这一步失败会怎样
              </h4>
              <p className="mt-1 text-sm leading-6 text-[var(--text)]">
                {step.failure}
              </p>
            </div>
            <div className="mt-4">
              <DoneToggle
                marks={marks}
                itemId={step.moduleId}
                label={
                  marks.done.has(step.moduleId)
                    ? `「${stepModule?.module.name ?? ""}」已学`
                    : `标记「${stepModule?.module.name ?? ""}」已学`
                }
              />
            </div>
          </div>

          {/* 账务小窗 */}
          <div className="mt-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <h3 className="font-display text-[15px] font-bold text-[var(--text)]">
              账务小窗
              <span className="ml-2 text-xs font-normal text-[var(--dim)]">
                钱在哪一刻、从谁账上动了
              </span>
            </h3>
            {ledgerSoFar.length === 0 ? (
              <p className="mt-2.5 text-sm leading-6 text-[var(--dim)]">
                还没有分录产生——往前走几步，第一次动账时分录会出现在这里，并随流程逐步累积。
              </p>
            ) : (
              <ol className="mt-2.5 space-y-2">
                {ledgerSoFar.map(({ stepNo, line }, idx) => (
                  <li
                    key={`${stepNo}-${idx}`}
                    className="flex flex-wrap items-baseline gap-x-2 text-sm leading-6"
                  >
                    <span className="shrink-0 rounded bg-[var(--surface-alt)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--dim)]">
                      第{stepNo}步
                    </span>
                    {line.party && (
                      <span className="shrink-0 text-[12px] text-[var(--dim)]">
                        {line.party}
                      </span>
                    )}
                    <span
                      className={`font-bold ${
                        line.kind === "借"
                          ? "text-[var(--accent)]"
                          : line.kind === "贷"
                            ? "text-[var(--brass)]"
                            : "text-[var(--dim)]"
                      }`}
                    >
                      {line.kind}
                    </span>
                    <span className="min-w-0 text-[var(--text)]">{line.text}</span>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-3 border-t border-[var(--border)] pt-2.5 text-xs leading-5 text-[var(--dim)]">
              复式记账：有借必有贷、借贷必相等。同一笔业务在不同银行各记各的账，所以小窗里按记账主体分开标注。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export function App() {
  const [view, setView] = useState<View>("panorama");
  const [openModule, setOpenModule] = useState<{
    module: PanoramaModule;
    layerName: string;
  } | null>(null);
  const [openBusiness, setOpenBusiness] = useState<BusinessChapter | null>(null);
  const [openTech, setOpenTech] = useState<TechChapter | null>(null);
  const marks = useMarks();

  const doneCount = useMemo(
    () =>
      [...marks.done].filter(
        (id) =>
          PANORAMA.some((l) => l.modules.some((m) => m.id === id)) ||
          CORE_PANORAMA.some((l) => l.modules.some((m) => m.id === id)) ||
          BUSINESS.some((b) => b.id === id) ||
          TECH.some((t) => t.id === id),
      ).length,
    [marks.done],
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 pt-safe backdrop-blur">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-baseline justify-between gap-3 pb-1 pt-3">
            <p className="font-display text-[15px] font-bold text-[var(--text)]">
              银行系统学习地图
            </p>
            <p className="text-xs text-[var(--dim)]" aria-label="学习进度">
              已学 {doneCount} / {TOTAL_LEARNABLE}
            </p>
          </div>
          <nav
            className="-mb-px flex flex-wrap gap-0.5 pb-2"
            aria-label="视图切换"
          >
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-current={view === v.id ? "page" : undefined}
                onClick={() => setView(v.id)}
                className={`min-h-9 shrink-0 rounded-full px-2.5 text-[13px] font-medium transition-colors min-[420px]:px-3.5 min-[420px]:text-sm ${
                  view === v.id
                    ? "bg-[var(--navy)] text-white"
                    : "text-[var(--dim)] hover:text-[var(--text)]"
                }`}
              >
                {v.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-14 pt-5">
        {view === "panorama" && (
          <PanoramaView
            marks={marks}
            onOpenModule={(module, layerName) =>
              setOpenModule({ module, layerName })
            }
            onGoCore={() => setView("core")}
          />
        )}
        {view === "core" && (
          <CoreView
            marks={marks}
            onOpenModule={(module, layerName) =>
              setOpenModule({ module, layerName })
            }
            onOpenTech={(chapter) => {
              setOpenTech(chapter);
              setView("tech");
            }}
          />
        )}
        {view === "journey" && (
          <JourneyView
            marks={marks}
            onOpenModule={(module, layerName) =>
              setOpenModule({ module, layerName })
            }
            onOpenChapter={(chapter) => {
              setOpenBusiness(chapter);
              setView("business");
            }}
          />
        )}
        {view === "business" &&
          (openBusiness ? (
            <BusinessReader
              chapter={openBusiness}
              marks={marks}
              onBack={() => setOpenBusiness(null)}
            />
          ) : (
            <>
              <p className="mb-4 text-sm leading-6 text-[var(--dim)]">
                按业务线拆开讲：每条线都是同一套路——业务流程怎么走、系统怎么支撑、哪些规则不能碰。
              </p>
              <ChapterList
                chapters={BUSINESS}
                marks={marks}
                onOpen={setOpenBusiness}
              />
            </>
          ))}
        {view === "tech" &&
          (openTech ? (
            <TechReader
              chapter={openTech}
              marks={marks}
              onBack={() => setOpenTech(null)}
            />
          ) : (
            <>
              <p className="mb-4 text-sm leading-6 text-[var(--dim)]">
                按技术主题拆开讲：从核心架构的四十年演进，到日切、分布式一致性与容灾——银行系统「稳」的功夫都在这里。
              </p>
              <ChapterList
                chapters={TECH}
                marks={marks}
                onOpen={setOpenTech}
              />
            </>
          ))}
        {view === "vendors" && <VendorsView />}
        {view === "glossary" && <GlossaryView marks={marks} />}
      </main>

      {openModule && (
        <ModuleSheet
          module={openModule.module}
          layerName={openModule.layerName}
          marks={marks}
          onClose={() => setOpenModule(null)}
        />
      )}
    </div>
  );
}
