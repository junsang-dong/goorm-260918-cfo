import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  PieChart,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Analysis, Group, Report, Validation } from "./types";
import "./styles.css";
const money = (v: number) => "₩" + Math.round(v).toLocaleString("ko-KR");
const pct = (v: number) => (v * 100).toFixed(2) + "%";
const compact = (v: number) => (v / 1e8).toFixed(2) + "억";
const tabs = [
  "대시보드",
  "데이터 검증",
  "제품별 수익성",
  "고객별 수익성",
  "할인 시뮬레이터",
  "경영 보고서",
];
async function api<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(
    "/api" + path,
    body instanceof FormData
      ? { method: "POST", body }
      : body
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : undefined,
  );
  const j = await r.json();
  if (!r.ok)
    throw new Error(
      typeof j.detail === "string" ? j.detail : "입력값을 확인해 주세요.",
    );
  return j;
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function App() {
  const [tab, setTab] = useState(0),
    [data, setData] = useState<Analysis | null>(null),
    [fileId, setFileId] = useState("demo"),
    [period, setPeriod] = useState(""),
    [region, setRegion] = useState(""),
    [family, setFamily] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [uploadOpen, setUploadOpen] = useState(false),
    [validation, setValidation] = useState<Validation | null>(null),
    [report, setReport] = useState<Report | null>(null),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("risk"),
    [selected, setSelected] = useState<Group | null>(null);
  const [uploaded, setUploaded] = useState<{
      file_id: string;
      file_name: string;
      sheets: string[];
      counts: Record<string, number>;
    } | null>(null),
    [salesSheet, setSalesSheet] = useState("매출_정상"),
    [costSheet, setCostSheet] = useState("원가_정상");
  const [history, setHistory] = useState<NonNullable<typeof uploaded>[]>([]);
  useEffect(() => {
    api<NonNullable<typeof uploaded>[]>("/files")
      .then(setHistory)
      .catch(() => {});
  }, [fileId]);
  function chooseFile(id: string) {
    const f = history.find((f) => f.file_id === id) || null;
    setUploaded(f);
    setFileId(id);
    setSalesSheet(f?.sheets.find((s) => s.startsWith("매출")) || "매출_정상");
    setCostSheet(f?.sheets.find((s) => s.startsWith("원가")) || "원가_정상");
    setValidation(null);
    setPeriod("");
    setRegion("");
    setFamily("");
    setSelected(null);
  }
  const input = useRef<HTMLInputElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const selection = {
    file_id: fileId,
    period,
    region,
    family,
    sales_sheet: salesSheet,
    cost_sheet: costSheet,
  };
  useEffect(() => {
    let live = true;
    setBusy(true);
    api<Analysis>("/profit/analyze", selection)
      .then((d) => {
        if (live) {
          setData(d);
          setReport(null);
          setError("");
        }
      })
      .catch((e) => {
        if (live) {
          setData(null);
          setError(e.message);
        }
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
  }, [fileId, period, region, family, salesSheet, costSheet]);
  useEffect(() => {
    if (uploadOpen) dialog.current?.showModal();
    else dialog.current?.close();
  }, [uploadOpen]);
  async function runValidation() {
    setBusy(true);
    try {
      const result = await api<Validation>("/validation/run", selection);
      setValidation(result);
      setTab(1);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await api<NonNullable<typeof uploaded>>(
        "/files/upload",
        fd,
      );
      setUploaded(result);
      setValidation(null);
      setSalesSheet(
        result.sheets.find((s) => s.startsWith("매출")) || "매출_정상",
      );
      setCostSheet(
        result.sheets.find((s) => s.startsWith("원가")) || "원가_정상",
      );
      setPeriod("");
      setRegion("");
      setFamily("");
      setFileId(result.file_id);
      setTab(1);
      setUploadOpen(false);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  async function makeReport() {
    if (!data) return;
    setBusy(true);
    try {
      setReport(
        await api<Report>("/ai/report", { analysis_id: data.analysis_id }),
      );
      setTab(5);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const customers =
    data?.by_customer
      .filter((c) =>
        (c.customer_name + " " + c.id)
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
      .sort((a, b) =>
        sort === "revenue"
          ? b.revenue - a.revenue
          : a.adjusted_margin - b.adjusted_margin,
      ) || [];
  const top = data?.by_product.reduce<Group | undefined>(
    (best, p) => (!best || p.adjusted_margin > best.adjusted_margin ? p : best),
    undefined,
  );
  const low = data?.by_customer.reduce<Group | undefined>(
    (best, c) => (!best || c.adjusted_margin < best.adjusted_margin ? c : best),
    undefined,
  );
  const cardTitle = (icon: React.ReactNode, title: string, sub?: string) => (
    <div className="panel-heading">
      <div>
        <h2>
          {icon}
          {title}
        </h2>
        {sub && <p>{sub}</p>}
      </div>
    </div>
  );
  function customerTable() {
    return (
      <section className="panel full">
        <div className="panel-heading">
          <div>
            <h2>
              <Activity size={19} />
              고객 수익성 레이더
            </h2>
            <p>
              고객별 할인과 부대비용이 실제 이익에 미치는 영향을 확인하세요.
            </p>
          </div>
          <div className="controls">
            <div className="search">
              <Search size={15} />
              <input
                aria-label="고객 검색"
                placeholder="고객명 또는 ID 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="고객 정렬"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="risk">이익률 낮은 순</option>
              <option value="revenue">매출 높은 순</option>
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>고객ID</th>
                <th>고객사명</th>
                <th>지역</th>
                <th>총 매출</th>
                <th>평균 할인율</th>
                <th>배송비</th>
                <th>조정이익</th>
                <th>조정이익률</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="code">{c.id}</td>
                  <td>
                    <strong>{c.customer_name}</strong>
                  </td>
                  <td>{c.region}</td>
                  <td>{money(c.revenue)}</td>
                  <td>{pct(c.avg_discount)}</td>
                  <td>{money(c.shipping)}</td>
                  <td>{money(c.adjusted_profit)}</td>
                  <td>
                    <span
                      className={
                        "badge " +
                        (c.adjusted_margin < 0.2
                          ? "red"
                          : c.adjusted_margin < 0.25
                            ? "amber"
                            : "green")
                      }
                    >
                      {pct(c.adjusted_margin)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="text-button"
                      onClick={() => setSelected(c)}
                    >
                      원장 조회 <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!customers.length && (
            <p className="empty">검색 조건에 맞는 고객이 없습니다.</p>
          )}
        </div>
        <div className="table-footer">
          총 {customers.length}개 고객사 · 평균 할인율은 거래별 단순 평균입니다.
        </div>
      </section>
    );
  }
  function products() {
    return (
      <section className="panel">
        {cardTitle(
          <PieChart size={20} />,
          "제품별 실적 & 이익 기여도",
          "제품별 매출, 원가와 조정이익을 같은 기준으로 비교합니다.",
        )}
        <div className="product-list">
          {data?.by_product.map((p, i) => (
            <article className="product" key={p.id}>
              <div className="product-title">
                <div>
                  <span className={"product-code color-" + i}>{p.id}</span>
                  <strong>{p.product_name}</strong>
                </div>
                <span
                  className={
                    "badge " + (p.adjusted_margin >= 0.25 ? "green" : "amber")
                  }
                >
                  {p.adjusted_margin >= 0.25 ? "양호" : "검토"}{" "}
                  {pct(p.adjusted_margin)}
                </span>
              </div>
              <div className="product-metrics">
                {[
                  ["매출액", money(p.revenue)],
                  ["추정원가", money(p.cogs)],
                  ["조정이익", money(p.adjusted_profit)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <small>{k}</small>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <div className="track">
                <div
                  style={{
                    width: `${data.revenue ? (p.revenue / data.revenue) * 100 : 0}%`,
                    background: ["#00288e", "#3267e3", "#059669"][i % 3],
                  }}
                />
              </div>
              <p>
                전체 매출의 {pct(data?.revenue ? p.revenue / data.revenue : 0)}{" "}
                · {p.count}건의 거래
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }
  return (
    <>
      <header>
        <div className="brand">
          <div className="brand-icon">
            <TrendingUp size={24} />
          </div>
          <div>
            <b>
              Profit Insight <span>AI</span>
            </b>
            <small>BLUE CLOUD ROBOTICS</small>
          </div>
          <span className="edition">CFO WORKSPACE</span>
        </div>
        <div className="header-actions">
          <span className="badge neutral">로컬 워크스페이스</span>
          <button onClick={() => setUploadOpen(true)}>
            <Upload size={16} />
            Excel 업로드
          </button>
          <div className="avatar">박</div>
          <div className="profile">
            <b>박민재 CFO</b>
            <small>재무 의사결정 워크스페이스</small>
          </div>
        </div>
      </header>
      <nav aria-label="주요 메뉴">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={tab === i ? "active" : ""}
            onClick={() => {
              setTab(i);
              setSelected(null);
            }}
          >
            {t}
          </button>
        ))}
        <span className="nav-note">
          <ShieldCheck size={14} />
          수식 기반 수익성 분석
        </span>
      </nav>
      <main>
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              FINANCIAL INTELLIGENCE / {String(tab + 1).padStart(2, "0")}
            </div>
            <h1>
              {
                [
                  "경영 수익성 대시보드",
                  "데이터 검증 센터",
                  "제품별 수익성 분석",
                  "고객별 수익성 분석",
                  "할인 & 마진 시뮬레이터",
                  "CFO 경영 보고서",
                ][tab]
              }
            </h1>
            <p>숫자의 근거를 확인하고, 더 나은 수익성 의사결정을 내리세요.</p>
          </div>
          <div className="controls">
            <button disabled={busy || !data} onClick={runValidation}>
              <RefreshCw size={15} />
              데이터 재검증
            </button>
            <button
              className="primary"
              disabled={busy || !data?.count}
              onClick={makeReport}
            >
              <Sparkles size={16} />
              보고서 초안 생성
            </button>
          </div>
        </div>
        <div className="filter-bar">
          <div className="controls">
            <span className="filter-label">
              <SlidersHorizontal size={15} />
              분석 범위
            </span>
            <select
              aria-label="분석 기간"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="">전체 기간</option>
              {Array.from(
                new Set(data?.months.map((m) => m.slice(0, 4)) || ["2025"]),
              ).map((y) => (
                <option key={y} value={y}>
                  {y}년 전체
                </option>
              ))}
              {data?.months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              aria-label="지역 필터"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">모든 지역</option>
              {Array.from(
                new Set(data?.customers.map((c) => String(c["지역"])) || []),
              ).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select
              aria-label="제품군 필터"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
            >
              <option value="">모든 제품군</option>
              {Array.from(
                new Set(data?.products.map((p) => String(p["제품군"])) || []),
              ).map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <select
            aria-label="데이터 파일 선택"
            value={fileId}
            onChange={(e) => chooseFile(e.target.value)}
          >
            <option value="demo">데모 데이터</option>
            {history.map((f) => (
              <option key={f.file_id} value={f.file_id}>
                {f.file_name}
              </option>
            ))}
          </select>
          <span className="source">
            <span className={"dot " + (fileId === "demo" ? "demo" : "")} />
            {fileId === "demo"
              ? "데모 데이터 · 2025"
              : uploaded?.file_name || "업로드 데이터"}
          </span>
        </div>
        {error && (
          <div role="alert" className="alert error">
            <Info size={18} />
            {error}
            <button aria-label="오류 닫기" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {busy && (
          <div className="loading" role="status">
            <Loader2 className="spin" size={17} /> 데이터를 처리하고 있습니다.
          </div>
        )}
        {tab === 1 ? (
          <>
            <section className="panel upload-panel">
              {cardTitle(
                <FileCheck2 />,
                "분석 전, 데이터부터 정확하게",
                "매출·원가·제품마스터·고객마스터를 포함한 Excel 파일을 사용하세요.",
              )}
              <div
                className="upload-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void upload(e.dataTransfer.files[0]);
                }}
              >
                <FileSpreadsheet size={36} />
                <h3>Excel 파일을 여기에 놓아주세요</h3>
                <p>.xlsx · 최대 10MB · 시트별 최대 50,000행</p>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => input.current?.click()}
                >
                  파일 선택
                </button>
                <a href="/api/files/template" download>
                  데모 Excel 다운로드 <Download size={14} />
                </a>
              </div>
              <div className="sheet-grid">
                {(
                  uploaded?.sheets || [
                    "매출_정상",
                    "원가_정상",
                    "제품마스터",
                    "고객마스터",
                  ]
                ).map((s) => (
                  <div key={s}>
                    <FileSpreadsheet size={17} />
                    <b>{s}</b>
                    <small>
                      {uploaded ? `${uploaded.counts[s]}행` : "데모 시트"}
                    </small>
                  </div>
                ))}
              </div>
              <div className="controls sheet-select">
                <label>
                  매출 시트{" "}
                  <select
                    value={salesSheet}
                    onChange={(e) => {
                      setSalesSheet(e.target.value);
                      setValidation(null);
                    }}
                  >
                    {(uploaded?.sheets || ["매출_정상"]).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  원가 시트{" "}
                  <select
                    value={costSheet}
                    onChange={(e) => {
                      setCostSheet(e.target.value);
                      setValidation(null);
                    }}
                  >
                    {(uploaded?.sheets || ["원가_정상"]).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={runValidation}
                >
                  <ShieldCheck size={16} />
                  검증 실행
                </button>
              </div>
            </section>
            {validation && (
              <section className="panel">
                <div
                  className={
                    "validation-result " +
                    (validation.error_count ? "bad" : "good")
                  }
                >
                  <ShieldCheck />
                  <div>
                    <h2>
                      {validation.error_count
                        ? `검증 오류 ${validation.error_count}건`
                        : "데이터 검증 완료"}
                    </h2>
                    <p>
                      {validation.error_count
                        ? "원본 파일에서 아래 항목을 수정한 뒤 다시 업로드하세요."
                        : "필수값, 날짜, 마스터, 중복 거래 및 원가·매출 계산 검증을 통과했습니다."}
                    </p>
                  </div>
                  {!validation.error_count && (
                    <button onClick={() => setTab(0)}>
                      대시보드 보기 <ArrowRight size={16} />
                    </button>
                  )}
                </div>
                {!!validation.error_count && (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>시트 / 행</th>
                          <th>항목</th>
                          <th>현재 값</th>
                          <th>권장 수정</th>
                          <th>심각도</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validation.errors.map((e, i) => (
                          <tr key={i}>
                            <td>
                              {e.sheet} / {e.row}
                            </td>
                            <td>{e.field}</td>
                            <td>{e.current_value}</td>
                            <td>{e.message}</td>
                            <td>
                              <span className="badge red">{e.severity}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        ) : !data ? (
          <section className="panel empty">
            검증된 데이터를 업로드하면 분석 결과를 확인할 수 있습니다.
            <button onClick={() => setTab(1)}>데이터 검증으로 이동</button>
          </section>
        ) : tab === 4 ? (
          <Simulator data={data} selection={selection} onError={setError} />
        ) : tab === 5 ? (
          <section className="panel report-panel">
            <div className="panel-heading">
              <div>
                <span className="badge neutral">
                  집계 기반 규칙형 초안 · 외부 AI 미연결
                </span>
                <h2>
                  <FileText />
                  경영진 보고를 위한 수익성 브리프
                </h2>
              </div>
              {report && (
                <div className="controls">
                  <button
                    onClick={() =>
                      download(
                        "CFO-보고서.md",
                        `# ${report.title}\n\n${report.is_demo ? "데모 데이터 기반\n\n" : ""}${report.executive_summary}\n\n## 주요 발견\n${report.key_findings.join("\n\n")}\n\n## 검토 사항\n${report.risk_points.join("\n\n")}\n\n## 실행 과제\n${report.recommended_actions.join("\n\n")}`,
                      )
                    }
                  >
                    <Download size={15} />
                    문서 저장
                  </button>
                  <button onClick={() => window.print()}>인쇄 / PDF</button>
                </div>
              )}
            </div>
            {report ? (
              <div className="report-body">
                <small>
                  {report.is_demo ? "데모 데이터" : "업로드 데이터"} ·{" "}
                  {new Date(report.generated_at).toLocaleString("ko-KR")}
                </small>
                <h1>{report.title}</h1>
                <h3>핵심 요약</h3>
                <p>{report.executive_summary}</p>
                {[
                  ["주요 발견", report.key_findings],
                  ["수익성 검토 사항", report.risk_points],
                  ["CFO 실행 과제", report.recommended_actions],
                ].map(([title, items]) => (
                  <section key={String(title)}>
                    <h3>{title}</h3>
                    <ul>
                      {(items as string[]).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <div className="empty">
                <FileText size={40} />
                <h3>검증된 숫자로 시작하는 보고서</h3>
                <p>
                  현재 분석 범위의 집계 수치와 검토 사항을 문서로 정리합니다.
                </p>
                <button
                  className="primary"
                  disabled={busy || !data.count}
                  onClick={makeReport}
                >
                  보고서 초안 생성
                </button>
              </div>
            )}
          </section>
        ) : (
          <>
            <div className="status-strip">
              <CheckCircle2 size={17} />
              <span>
                <strong>
                  {data.is_demo
                    ? "데모 데이터 분석"
                    : "업로드 데이터 검증 완료"}
                </strong>{" "}
                · {data.count}건의 거래를 집계했습니다. 배송비·사양변경비를
                차감한 관리회계상 조정이익 기준입니다.
              </span>
              <span className="unit">단위: KRW (원)</span>
            </div>
            <div className="kpi-grid">
              {[
                {
                  label: "총 매출액",
                  en: "REVENUE",
                  value: money(data.revenue),
                  note: `거래 ${data.count}건의 계산 매출 합계`,
                  icon: <BarChart3 />,
                },
                {
                  label: "추정 매출원가",
                  en: "ESTIMATED COGS",
                  value: money(data.cogs),
                  note: "매출월별 표준단위원가 × 판매 수량",
                  icon: <FileSpreadsheet />,
                },
                {
                  label: "총 조정이익",
                  en: "ADJUSTED PROFIT",
                  value: money(data.adjusted_profit),
                  note: `매출총이익 ${compact(data.gross_profit)} − 부대비용`,
                  icon: <TrendingUp />,
                  green: true,
                },
                {
                  label: "조정이익률",
                  en: "ADJUSTED MARGIN",
                  value: pct(data.adjusted_margin),
                  note: `평균 할인율 ${pct(data.avg_discount)}`,
                  icon: <PieChart />,
                },
              ].map((k) => (
                <section className="kpi" key={k.en}>
                  <div className="kpi-label">
                    {k.label}
                    {k.icon}
                  </div>
                  <small>{k.en}</small>
                  <div className={"kpi-value " + (k.green ? "green-text" : "")}>
                    {k.value}
                  </div>
                  <div className="kpi-note">{k.note}</div>
                </section>
              ))}
            </div>
            {!data.count ? (
              <div className="panel empty">
                <Search size={32} />
                <h3>선택한 조건에 거래가 없습니다.</h3>
                <p>기간이나 필터를 변경해 주세요.</p>
              </div>
            ) : tab === 2 ? (
              products()
            ) : tab === 3 ? (
              customerTable()
            ) : (
              <>
                <div className="dashboard-grid">
                  <div className="stack">
                    {products()}
                    <section className="panel">
                      {cardTitle(
                        <TrendingUp size={20} />,
                        "월별 매출 및 조정이익률",
                        "기간별 실적 변화 · 매출(억원), 이익률(%)",
                      )}
                      <div className="chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={data.by_month.map((m) => ({
                              ...m,
                              label: m.id.slice(5) + "월",
                              억: m.revenue / 1e8,
                              이익률: m.adjusted_margin * 100,
                            }))}
                            margin={{ top: 15, right: 4, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#e2e8f0"
                            />
                            <XAxis
                              dataKey="label"
                              tick={{ fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              yAxisId="left"
                              tick={{ fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              unit="%"
                              tick={{ fontSize: 11 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              formatter={(v: number, name: string) => [
                                v.toFixed(2) + (name === "매출" ? "억" : "%"),
                                name,
                              ]}
                            />
                            <Bar
                              yAxisId="left"
                              dataKey="억"
                              name="매출"
                              fill="#2149b4"
                              radius={[3, 3, 0, 0]}
                              maxBarSize={30}
                            />
                            <Line
                              yAxisId="right"
                              dataKey="이익률"
                              name="조정이익률"
                              stroke="#059669"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="chart-legend">
                        <span>
                          <i />
                          매출액
                        </span>
                        <span>
                          <i className="emerald" />
                          조정이익률
                        </span>
                      </div>
                    </section>
                  </div>
                  <div className="stack">
                    <section className="panel insights">
                      {cardTitle(
                        <Sparkles size={20} />,
                        "Profit Insight Executive Summary",
                      )}
                      <div className="insight-meta">
                        <span className="badge blue">집계 기반 인사이트</span>
                        <span>외부 AI 미연결</span>
                      </div>
                      <div className="insight-section">
                        <h3>
                          ● 핵심 요약 <span>EXECUTIVE SUMMARY</span>
                        </h3>
                        <p>
                          선택한 기간 총 매출은{" "}
                          <strong>{compact(data.revenue)} 원</strong>,
                          조정이익은{" "}
                          <strong>{compact(data.adjusted_profit)} 원</strong>
                          입니다. 배송비와 사양변경비를 반영한 조정이익률은{" "}
                          <strong>{pct(data.adjusted_margin)}</strong>입니다.
                        </p>
                      </div>
                      <div className="insight-section">
                        <h3 className="green-text">
                          ● 주요 발견 <span>KEY FINDINGS</span>
                        </h3>
                        <p className="tint-green">
                          <strong>{top?.product_name}</strong>의 조정이익률이{" "}
                          <strong>{pct(top?.adjusted_margin || 0)}</strong>로
                          제품 중 가장 높습니다.
                        </p>
                        <p>
                          전체 거래의 배송비{" "}
                          <strong>{money(data.shipping)}</strong>, 사양변경비{" "}
                          <strong>{money(data.custom)}</strong>가 이익에서
                          차감되었습니다.
                        </p>
                      </div>
                      <div className="insight-section">
                        <h3 className="amber-text">
                          ● 우선 검토 <span>REVIEW POINTS</span>
                        </h3>
                        <p className="tint-amber">
                          <strong>{low?.customer_name}</strong>의 조정이익률은{" "}
                          <strong>{pct(low?.adjusted_margin || 0)}</strong>
                          입니다. 추가 할인 전 수량 및 배송비 조건을 함께
                          검토하세요.
                        </p>
                      </div>
                      <div className="insight-section">
                        <h3>
                          ● CFO 실행 과제 <span>ACTION PLAN</span>
                        </h3>
                        <ol>
                          <li>
                            낮은 이익률 고객의 원장에서 할인·비용을 확인합니다.
                          </li>
                          <li>신규 견적의 할인율별 예상 이익을 비교합니다.</li>
                          <li>
                            검토한 집계 수치로 경영진 보고 초안을 생성합니다.
                          </li>
                        </ol>
                      </div>
                      <button
                        className="insight-action"
                        disabled={busy}
                        onClick={makeReport}
                      >
                        전체 보고서 초안 생성 <ArrowRight size={16} />
                      </button>
                    </section>
                    <section className="panel quick-sim">
                      {cardTitle(
                        <SlidersHorizontal size={20} />,
                        "할인 조건, 이익에 미치는 영향",
                      )}
                      <p>
                        제품과 고객을 선택하고 수량·할인율·원가 변동을
                        비교하세요.
                      </p>
                      <div className="formula">
                        조정이익 = 수량 × (할인 후 단가 − 단위원가)
                        <br />− 배송비 − 사양변경비
                      </div>
                      <button onClick={() => setTab(4)}>
                        시뮬레이터 열기 <ArrowRight size={16} />
                      </button>
                    </section>
                  </div>
                </div>
                {customerTable()}
              </>
            )}
            {selected && (
              <section className="panel ledger">
                <div className="panel-heading">
                  <h2>{selected.customer_name} 거래 원장</h2>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="원장 닫기"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>거래ID</th>
                        <th>월</th>
                        <th>제품</th>
                        <th>계산 매출</th>
                        <th>추정원가</th>
                        <th>배송비</th>
                        <th>사양변경비</th>
                        <th>조정이익</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions
                        .filter(
                          (t) => t.customer_name === selected.customer_name,
                        )
                        .map((t) => (
                          <tr key={t.transaction_id}>
                            <td>{t.transaction_id}</td>
                            <td>{t.month}</td>
                            <td>{t.product_code}</td>
                            <td>{money(t.revenue)}</td>
                            <td>{money(t.cogs)}</td>
                            <td>{money(t.shipping)}</td>
                            <td>{money(t.custom)}</td>
                            <td>{money(t.adjusted_profit)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
        <div className="method-note">
          <Info size={14} />
          <span>
            조정이익은 회계상 순이익이 아닙니다. 공통
            판관비·연구개발비·이자비용·법인세는 제외합니다.
          </span>
        </div>
      </main>
      <footer>
        <span>© Blue Cloud Robotics · Profit Insight AI</span>
        <span>
          LOCAL MVP <i /> 계산 근거가 명확한 의사결정
        </span>
      </footer>
      <input
        ref={input}
        type="file"
        accept=".xlsx"
        hidden
        onChange={(e) => void upload(e.target.files?.[0])}
      />
      <dialog ref={dialog} onCancel={() => setUploadOpen(false)}>
        <div className="panel-heading">
          <h2>
            <Upload size={20} />
            Excel 데이터 업로드
          </h2>
          <button aria-label="업로드 닫기" onClick={() => setUploadOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <p>
          매출, 원가, 제품마스터, 고객마스터 시트가 포함된 파일을 선택하세요.
        </p>
        <div className="upload-zone">
          <FileSpreadsheet size={40} />
          <h3>수익성 분석을 시작하세요</h3>
          <p>.xlsx · 최대 10MB</p>
          <button
            className="primary"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            Excel 파일 선택
          </button>
          <a href="/api/files/template" download>
            데모 Excel 다운로드
          </a>
          {error && (
            <p role="alert" className="red-text">
              {error}
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
function Simulator({
  data,
  selection,
  onError,
}: {
  data: Analysis;
  selection: Record<string, string>;
  onError: (s: string) => void;
}) {
  const [product, setProduct] = useState(String(data.products[0]["제품코드"])),
    [customer, setCustomer] = useState(String(data.customers[0]["고객ID"])),
    [month, setMonth] = useState(data.months.at(-1) || ""),
    [quantity, setQuantity] = useState("30"),
    [discount, setDiscount] = useState("10"),
    [shipping, setShipping] = useState("260000"),
    [custom, setCustom] = useState("0"),
    [change, setChange] = useState("0"),
    [results, setResults] = useState<
      | {
          discount_rate: number;
          revenue: number;
          cogs: number;
          gross_profit: number;
          adjusted_profit: number;
          adjusted_margin: number;
        }[]
      | null
    >(null),
    [pending, setPending] = useState(false);
  async function run(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const r = await api<{ results: NonNullable<typeof results> }>(
        "/simulation/discount",
        {
          ...selection,
          product_code: product,
          customer_id: customer,
          cost_month: month,
          quantity: Number(quantity),
          discount_rates: Array.from(
            new Set([0, 0.05, Number(discount) / 100]),
          ).sort((a, b) => a - b),
          shipping_cost: Number(shipping),
          custom_cost: Number(custom),
          cost_change: Number(change) / 100,
        },
      );
      setResults(r.results);
      onError("");
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  useEffect(() => {
    setResults(null);
  }, [product, customer, month, quantity, discount, shipping, custom, change]);
  return (
    <div className="sim-grid">
      <section className="panel">
        <div className="panel-heading">
          <h2>
            <SlidersHorizontal size={20} />
            견적 조건
          </h2>
          <span className="badge blue">WHAT-IF</span>
        </div>
        <form onSubmit={run}>
          <label>
            제품
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              {data.products.map((p) => (
                <option
                  key={String(p["제품코드"])}
                  value={String(p["제품코드"])}
                >
                  {p["제품코드"]} · {p["제품명"]}
                </option>
              ))}
            </select>
          </label>
          <label>
            고객
            <select
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              {data.customers.map((c) => (
                <option key={String(c["고객ID"])} value={String(c["고객ID"])}>
                  {c["고객명"]}
                </option>
              ))}
            </select>
          </label>
          <label>
            원가 기준월
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {data.months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            {[
              ["판매 수량", quantity, setQuantity, 1, undefined],
              ["비교 할인율 (%)", discount, setDiscount, 0, 99.99],
              ["배송비 (원)", shipping, setShipping, 0, undefined],
              ["사양변경비 (원)", custom, setCustom, 0, undefined],
              ["원가 변동률 (%)", change, setChange, -99, 1000],
            ].map(([label, value, set, min, max]) => (
              <label key={String(label)}>
                {String(label)}
                <input
                  required
                  type="number"
                  step="any"
                  min={min as number}
                  max={max as number | undefined}
                  value={value as string}
                  onChange={(e) => (set as (s: string) => void)(e.target.value)}
                />
              </label>
            ))}
          </div>
          <button className="primary" disabled={pending}>
            {pending ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <Activity size={16} />
            )}
            시뮬레이션 실행
          </button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>
            <TrendingUp size={20} />
            할인율별 예상 수익성
          </h2>
        </div>
        {results ? (
          <>
            <div className="sim-results">
              {results.map((r) => (
                <article
                  key={r.discount_rate}
                  className={r.adjusted_margin < 0.2 ? "risk" : ""}
                >
                  <span>할인율 {pct(r.discount_rate)}</span>
                  <h2>{pct(r.adjusted_margin)}</h2>
                  <small>예상 조정이익률</small>
                  <strong>{money(r.adjusted_profit)}</strong>
                  <small>예상 조정이익</small>
                </article>
              ))}
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>할인율</th>
                    <th>예상 매출</th>
                    <th>예상 원가</th>
                    <th>매출총이익</th>
                    <th>조정이익</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.discount_rate}>
                      <td>{pct(r.discount_rate)}</td>
                      <td>{money(r.revenue)}</td>
                      <td>{money(r.cogs)}</td>
                      <td>{money(r.gross_profit)}</td>
                      <td>{money(r.adjusted_profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sim-note">
              <Info size={18} />
              조정이익률 20% 미만은 검토 대상으로 표시합니다. 실제 수주 기준은
              CFO가 결정해야 합니다.
            </div>
          </>
        ) : (
          <div className="empty">
            <SlidersHorizontal size={40} />
            <h3>할인의 영향, 숫자로 확인하세요</h3>
            <p>견적 조건을 입력하면 정가, 5% 할인, 지정 할인율을 비교합니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
