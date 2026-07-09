import { useMemo, useState } from "react";
import { Copy, GitBranch, LayoutDashboard, Rocket, Store, Table2, Wand2 } from "lucide-react";
import { marketplace, portfolio, setupSteps, specSections, workstreams, type MarketplaceApp, type Project } from "./data/productModel";
import { exportSpec, initialPricing, initialSetup, initialSpec, priceTotal, qualityScore, type PricingState, type SetupState, type SpecState } from "./lib/spec";

type View = "home" | "builder" | "portfolio" | "marketplace" | "launcher";
type Mode = "Builder" | "Launcher";
type Filter = "all" | "risk" | "launch";

const views: Record<View, string> = { home: "Builder / Launcher Dashboard", builder: "Click-Only Spec Builder", portfolio: "Portfolio And Project Workspace", marketplace: "App Marketplace", launcher: "Launcher Publish Flow" };
const nav = [
  { id: "home", label: "Home", Icon: LayoutDashboard },
  { id: "builder", label: "Spec Builder", Icon: Wand2 },
  { id: "portfolio", label: "Portfolio", Icon: Table2 },
  { id: "marketplace", label: "Marketplace", Icon: Store },
  { id: "launcher", label: "Launcher", Icon: Rocket }
] as const;
const cx = (...v: Array<string | false | undefined>) => v.filter(Boolean).join(" ");

export function App() {
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("Builder");
  const [activeProject, setActiveProject] = useState<Project>(portfolio[0]);
  const [selectedSection, setSelectedSection] = useState(specSections[0].id);
  const [selectedSetup, setSelectedSetup] = useState(setupSteps[0].id);
  const [selectedCreator, setSelectedCreator] = useState<MarketplaceApp>(marketplace[0]);
  const [filter, setFilter] = useState<Filter>("all");
  const [spec, setSpec] = useState<SpecState>(initialSpec);
  const [setup, setSetup] = useState<SetupState>(initialSetup);
  const [pricing, setPricing] = useState<PricingState>(initialPricing);
  const [copied, setCopied] = useState(false);

  const section = specSections.find((item) => item.id === selectedSection) ?? specSections[0];
  const step = setupSteps.find((item) => item.id === selectedSetup) ?? setupSteps[0];
  const quality = qualityScore(spec, activeProject);
  const price = priceTotal(pricing);
  const qualityNote = useMemo(() => quality >= 90 ? "Publish-grade spec" : quality >= 78 ? "Strong launch draft" : "Needs launch detail", [quality]);
  const filtered = workstreams.filter((item) => filter === "all" || item.tag === filter);

  async function copyExport() {
    await navigator.clipboard?.writeText(exportSpec(activeProject, spec, setup, pricing));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1100);
  }

  function updatePrice(key: keyof PricingState, delta: number) {
    setPricing((current) => ({ ...current, [key]: Math.max(0, current[key] + delta) }));
  }

  return (
    <main className="desktop-shell">
      <aside className="rail">
        <a className="brand" href="#home"><span className="brand-mark">SF</span><span><strong>SpecForge</strong><small>Launch Studio</small></span></a>
        <nav className="nav-list">
          {nav.map(({ id, label, Icon }) => <button key={id} className={cx("nav-item", view === id && "active")} type="button" onClick={() => setView(id)}><Icon size={16} />{label}</button>)}
        </nav>
        <section className="rail-status"><span>Workspace</span><strong>{activeProject.name}</strong><small>{activeProject.readiness}% launch ready</small></section>
      </aside>

      <section className="workbench">
        <header className="topbar"><div><p className="eyebrow">Click-only product specification workspace</p><h1>{views[view]}</h1></div><div className="topbar-actions"><button className="primary" type="button" onClick={copyExport}><Copy size={16} />{copied ? "Copied export" : "Export 10 sections"}</button><button type="button" onClick={() => setView("launcher")}><GitBranch size={16} />Clone app</button></div></header>
        <section className="command-ribbon"><article><span>Spec quality</span><strong>{quality}</strong><small>{qualityNote}</small></article><article><span>Current section</span><strong>{section.title}</strong><small>{section.detail}</small></article><article><span>Next action</span><strong>{view === "builder" ? "Review export" : view === "launcher" ? "Finish setup" : "Open builder"}</strong><small>Move from choice to launch-ready package.</small></article><article><span>Clone flow</span><strong>Configured</strong><small>6 setup steps mapped.</small></article></section>

        {view === "home" && <section className="view active"><div className="home-split">{(["Builder", "Launcher"] as Mode[]).map((item) => <button key={item} className={cx("mode-panel", mode === item && "selected")} type="button" onClick={() => setMode(item)}><span>{item}</span><strong>{item === "Builder" ? "Draft specs fast" : "Publish clone-ready apps"}</strong><small>{item === "Builder" ? "Click through product choices, export a complete spec, and organize project work." : "Package apps for buyers with setup, profile, pricing, and updates."}</small></button>)}</div><div className="dashboard-grid"><section className="panel wide"><PanelHeading kicker="Active spec" title={activeProject.name} action={mode} /><div className="flow-lane">{["Choose app", "Build spec", "Review table", "Clone setup", "Price", "Publish"].map((item, index) => <span key={item} className={cx("flow-step", index < 4 && "complete")}>{item}</span>)}</div></section><section className="panel"><PanelHeading kicker="Readiness" title="Launch score" /><div className="score-ring" style={{ background: `conic-gradient(var(--accent) ${activeProject.readiness}%, rgba(255,255,255,0.08) 0)` }}><strong>{activeProject.readiness}%</strong><span>ready</span></div><div className="mini-metrics"><span><strong>{Object.keys(spec).length}</strong> spec sections</span><span><strong>{portfolio.length}</strong> projects</span><span><strong>${price}</strong> advised</span></div></section></div></section>}

        {view === "builder" && <section className="view active"><div className="builder-layout"><section className="panel"><PanelHeading kicker="10-section builder" title="Click choices only" /><div className="section-list">{specSections.map((item, index) => <button key={item.id} className={cx("section-item", selectedSection === item.id && "selected")} data-value={spec[item.id]} type="button" onClick={() => setSelectedSection(item.id)}>{index + 1}. {item.title}</button>)}</div></section><section className="panel"><PanelHeading kicker={`Section ${specSections.indexOf(section) + 1}`} title={section.title} /><ChoiceGrid options={section.options} selected={spec[section.id]} onSelect={(option) => setSpec((current) => ({ ...current, [section.id]: option }))} /><div className="choice-summary"><strong>{section.deliverable}</strong><span>{section.detail}</span><small>Selected: {spec[section.id]}</small></div></section><section className="panel"><PanelHeading kicker="Export preview" title="Professional app spec" /><div className="export-preview">{specSections.map((item, index) => <article className="export-row" key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{spec[item.id]}</small><em>{item.deliverable}</em></article>)}</div></section></div></section>}

        {view === "portfolio" && <section className="view active"><div className="portfolio-layout"><section className="panel"><PanelHeading kicker="Portfolio" title="Apps in motion" /><div className="portfolio-list">{portfolio.map((project) => <button key={project.name} className={cx("portfolio-item", activeProject.name === project.name && "selected")} type="button" onClick={() => setActiveProject(project)}><strong>{project.name}</strong><span>{project.type}</span><small>{project.status} - {project.readiness}% ready</small></button>)}</div></section><section className="panel wide"><PanelHeading kicker="Project workspace" title="Detailed table view" action={<SegmentedFilter value={filter} onChange={setFilter} />} /><div className="table-wrap"><table><thead><tr><th>Workstream</th><th>Owner</th><th>Status</th><th>Due</th><th>Risk</th><th>Launch impact</th></tr></thead><tbody>{filtered.map((task) => <tr key={task.stream}><td>{task.stream}</td><td>{task.owner}</td><td><span className={`status ${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span></td><td>{task.due}</td><td>{task.risk}</td><td>{task.impact}</td></tr>)}</tbody></table></div></section></div></section>}

        {view === "marketplace" && <section className="view active"><div className="marketplace-layout"><section className="panel wide"><PanelHeading kicker="App marketplace" title="Clone-ready products" /><div className="market-grid">{marketplace.map((item) => <button key={item.app} className={cx("market-card", selectedCreator.app === item.app && "selected")} type="button" onClick={() => setSelectedCreator(item)}><span>{item.category}</span><strong>{item.app}</strong><small>{item.creator}</small><em>${item.price}</em></button>)}</div></section><section className="panel"><PanelHeading kicker="Creator profile" title={selectedCreator.creator} /><div className="creator-profile"><strong>{selectedCreator.app}</strong><p>{selectedCreator.profile}</p><small>{selectedCreator.stats}</small><div className="include-list">{selectedCreator.includes.map((item) => <span key={item}>{item}</span>)}</div><button className="primary" type="button" onClick={() => setView("launcher")}>Start guided clone</button></div></section></div></section>}

        {view === "launcher" && <section className="view active"><div className="launcher-layout"><section className="panel"><PanelHeading kicker="Post-clone setup" title="6-step onboarding" /><div className="setup-steps">{setupSteps.map((item, index) => <button key={item.id} className={cx("setup-item", selectedSetup === item.id && "selected")} data-value={setup[item.id]} type="button" onClick={() => setSelectedSetup(item.id)}>{index + 1}. {item.title}</button>)}</div></section><section className="panel wide"><PanelHeading kicker={`Step ${setupSteps.indexOf(step) + 1}`} title={step.title} /><ChoiceGrid options={step.options} selected={setup[step.id]} onSelect={(option) => setSetup((current) => ({ ...current, [step.id]: option }))} /></section><section className="panel"><PanelHeading kicker="Publish flow" title="Pricing advisor" /><div className="pricing-box"><strong>${price}</strong><small>Base {pricing.base} + complexity {pricing.complexity} + support {pricing.support} + market {pricing.market}</small></div><div className="price-controls">{(Object.keys(pricing) as Array<keyof PricingState>).map((key) => <div className="price-row" key={key}><span>{key}</span><strong>{pricing[key]}</strong><button className="stepper" type="button" onClick={() => updatePrice(key, -4)}>-</button><button className="stepper" type="button" onClick={() => updatePrice(key, 4)}>+</button></div>)}</div><div className="publish-checklist">{[["Brand", setup.brand], ["Content", setup.content], ["Feature tier", setup.features], ["Update channel", setup.updates], ["Go-live route", setup.goLive], ["Suggested price", `$${price}`]].map(([label, value]) => <div className="publish-item" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section></div></section>}
      </section>
    </main>
  );
}

function PanelHeading({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) {
  return <div className="panel-heading"><div><span>{kicker}</span><h2>{title}</h2></div>{typeof action === "string" ? <strong>{action}</strong> : action}</div>;
}

function ChoiceGrid({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (option: string) => void }) {
  return <div className="choice-grid">{options.map((option) => <button className={cx("choice-card", selected === option && "selected")} key={option} type="button" onClick={() => onSelect(option)}>{option}</button>)}</div>;
}

function SegmentedFilter({ value, onChange }: { value: Filter; onChange: (value: Filter) => void }) {
  return <div className="segmented">{(["all", "risk", "launch"] as Filter[]).map((item) => <button key={item} className={cx("segment", value === item && "active")} type="button" onClick={() => onChange(item)}>{item}</button>)}</div>;
}
