import { useMemo, useState } from "react";
import { Boxes, CheckCircle2, ClipboardList, Copy, FileText, GitBranch, LayoutDashboard, MonitorSmartphone, Rocket, ShieldCheck, SlidersHorizontal, Store, Table2, Wand2, Workflow } from "lucide-react";
import { launchPhases, marketplace, portfolio, setupSteps, specSections, studioMetrics, workstreams, type MarketplaceApp, type Project } from "./data/productModel";
import { completionScore, exportSpec, initialPricing, initialSetup, initialSpec, nextBestAction, priceTotal, qualityScore, type PricingState, type SetupState, type SpecState } from "./lib/spec";

type View = "home" | "builder" | "portfolio" | "marketplace" | "launcher" | "export";
type Mode = "Builder" | "Launcher";
type Filter = "all" | "risk" | "launch" | "systems";

const views: Record<View, string> = {
  home: "Executive Product Studio",
  builder: "Click-Only Spec Composer",
  portfolio: "Portfolio Operations",
  marketplace: "Clone Marketplace",
  launcher: "Launcher Publish Flow",
  export: "Launch Package Export"
};

const nav = [
  { id: "home", label: "Studio", Icon: LayoutDashboard },
  { id: "builder", label: "Builder", Icon: Wand2 },
  { id: "portfolio", label: "Portfolio", Icon: Table2 },
  { id: "marketplace", label: "Marketplace", Icon: Store },
  { id: "launcher", label: "Launcher", Icon: Rocket },
  { id: "export", label: "Export", Icon: FileText }
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
  const completion = completionScore(spec, setup);
  const quality = qualityScore(spec, activeProject, setup);
  const price = priceTotal(pricing);
  const exportText = useMemo(() => exportSpec(activeProject, spec, setup, pricing), [activeProject, pricing, setup, spec]);
  const qualityNote = useMemo(() => quality >= 92 ? "Ready for buyer-facing launch" : quality >= 78 ? "Strong launch draft" : "Needs more package detail", [quality]);
  const filtered = workstreams.filter((item) => filter === "all" || item.tag === filter);
  const action = nextBestAction(quality, view);

  async function copyExport() {
    await navigator.clipboard?.writeText(exportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function updatePrice(key: keyof PricingState, delta: number) {
    setPricing((current) => ({ ...current, [key]: Math.max(0, current[key] + delta) }));
  }

  return (
    <main className="desktop-shell">
      <aside className="rail">
        <a className="brand" href="#home" onClick={() => setView("home")}>
          <span className="brand-mark">SF</span>
          <span><strong>SpecForge</strong><small>Launch Studio</small></span>
        </a>
        <nav className="nav-list">
          {nav.map(({ id, label, Icon }) => <button key={id} className={cx("nav-item", view === id && "active")} type="button" onClick={() => setView(id)}><Icon size={16} />{label}</button>)}
        </nav>
        <section className="rail-status">
          <span>Active package</span>
          <strong>{activeProject.name}</strong>
          <small>{activeProject.owner} · {activeProject.market}</small>
          <div className="rail-meter"><i style={{ width: `${quality}%` }} /></div>
          <small>{quality}% studio quality</small>
        </section>
      </aside>

      <section className="workbench">
        <header className="topbar">
          <div>
            <p className="eyebrow">Professional desktop workspace for product builders</p>
            <h1>{views[view]}</h1>
            <span className="subtitle">Design a sellable app spec, organize launch work, clone marketplace products, and export a team-ready build package.</span>
          </div>
          <div className="topbar-actions">
            <button className="primary" type="button" onClick={copyExport}><Copy size={16} />{copied ? "Copied" : "Copy export"}</button>
            <button type="button" onClick={() => setView("launcher")}><GitBranch size={16} />Clone flow</button>
            <button type="button" onClick={() => setView("export")}><ClipboardList size={16} />Review package</button>
          </div>
        </header>

        <section className="command-ribbon">
          <article><span>Studio quality</span><strong>{quality}%</strong><small>{qualityNote}</small></article>
          <article><span>Completion</span><strong>{completion}%</strong><small>Spec and launcher setup combined.</small></article>
          <article><span>Current focus</span><strong>{section.title}</strong><small>{section.detail}</small></article>
          <article><span>Next action</span><strong>{action}</strong><small>Designed for click-only execution.</small></article>
        </section>

        {view === "home" && (
          <section className="view active studio-home">
            <div className="hero-panel">
              <div>
                <p className="eyebrow">Builder / Launcher split</p>
                <h2>Turn app ideas into launchable product packages without typing specs from scratch.</h2>
                <p>SpecForge is the operating surface: choices become structured requirements, requirements become exports, exports become cloned products, and cloned products become publishable launcher assets.</p>
              </div>
              <div className="mode-stack">
                {(["Builder", "Launcher"] as Mode[]).map((item) => <button key={item} className={cx("mode-panel", mode === item && "selected")} type="button" onClick={() => setMode(item)}><span>{item}</span><strong>{item === "Builder" ? "Draft professional specs" : "Package apps for sale"}</strong><small>{item === "Builder" ? "Click through product decisions and export a clean 10-section build brief." : "Clone, configure, price, and publish apps with guided setup."}</small></button>)}
              </div>
            </div>
            <div className="studio-grid">
              {studioMetrics.map((metric) => <article className={cx("metric-card", metric.tone)} key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></article>)}
            </div>
            <section className="panel wide">
              <PanelHeading kicker="Execution map" title="From choice to launch package" action={<button type="button" onClick={() => setView("builder")}>Open builder</button>} />
              <div className="phase-track">{launchPhases.map((phase) => <article className="phase-card" key={phase.phase}><span>{phase.status}</span><strong>{phase.phase}</strong><small>{phase.owner}</small><p>{phase.output}</p></article>)}</div>
            </section>
          </section>
        )}

        {view === "builder" && (
          <section className="view active builder-layout">
            <section className="panel">
              <PanelHeading kicker="10-section builder" title="Spec outline" />
              <div className="section-list">{specSections.map((item, index) => <button key={item.id} className={cx("section-item", selectedSection === item.id && "selected")} data-value={spec[item.id]} type="button" onClick={() => setSelectedSection(item.id)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</button>)}</div>
            </section>
            <section className="panel builder-main">
              <PanelHeading kicker={`Section ${specSections.indexOf(section) + 1}`} title={section.title} action={<strong>{section.artifact}</strong>} />
              <p className="section-detail">{section.detail}</p>
              <ChoiceGrid options={section.options} selected={spec[section.id]} onSelect={(option) => setSpec((current) => ({ ...current, [section.id]: option }))} />
              <div className="choice-summary"><ShieldCheck size={18} /><strong>{section.deliverable}</strong><span>{section.artifact}</span><small>Selected: {spec[section.id]}</small></div>
            </section>
            <section className="panel">
              <PanelHeading kicker="Live package" title="Export preview" action={<button type="button" onClick={() => setView("export")}>Open</button>} />
              <div className="export-preview">{specSections.map((item, index) => <article className="export-row" key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{spec[item.id]}</small><em>{item.artifact}</em></article>)}</div>
            </section>
          </section>
        )}

        {view === "portfolio" && (
          <section className="view active portfolio-layout">
            <section className="panel">
              <PanelHeading kicker="Portfolio" title="Apps in motion" />
              <div className="portfolio-list">{portfolio.map((project) => <button key={project.name} className={cx("portfolio-item", activeProject.name === project.name && "selected")} type="button" onClick={() => setActiveProject(project)}><strong>{project.name}</strong><span>{project.type}</span><small>{project.status} · {project.readiness}% ready</small></button>)}</div>
            </section>
            <section className="panel wide">
              <PanelHeading kicker="Project workspace" title="Detailed table view" action={<SegmentedFilter value={filter} onChange={setFilter} />} />
              <div className="table-wrap"><table><thead><tr><th>Workstream</th><th>Owner</th><th>Status</th><th>Due</th><th>Risk</th><th>Launch impact</th></tr></thead><tbody>{filtered.map((task) => <tr key={task.stream}><td>{task.stream}</td><td>{task.owner}</td><td><span className={`status ${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span></td><td>{task.due}</td><td>{task.risk}</td><td>{task.impact}</td></tr>)}</tbody></table></div>
            </section>
          </section>
        )}

        {view === "marketplace" && (
          <section className="view active marketplace-layout">
            <section className="panel wide">
              <PanelHeading kicker="App marketplace" title="Clone-ready products" action={<MonitorSmartphone size={18} />} />
              <div className="market-grid">{marketplace.map((item) => <button key={item.app} className={cx("market-card", selectedCreator.app === item.app && "selected")} type="button" onClick={() => setSelectedCreator(item)}><span>{item.category}</span><strong>{item.app}</strong><small>{item.creator} · {item.cloneTime} setup</small><em>${item.price}</em></button>)}</div>
            </section>
            <section className="panel creator-panel">
              <PanelHeading kicker="Creator profile" title={selectedCreator.creator} />
              <div className="creator-profile"><strong>{selectedCreator.app}</strong><p>{selectedCreator.profile}</p><small>{selectedCreator.stats}</small><div className="include-list">{selectedCreator.includes.map((item) => <span key={item}>{item}</span>)}</div><button className="primary" type="button" onClick={() => setView("launcher")}>Start guided clone</button></div>
            </section>
          </section>
        )}

        {view === "launcher" && (
          <section className="view active launcher-layout">
            <section className="panel">
              <PanelHeading kicker="Post-clone setup" title="6-step onboarding" />
              <div className="setup-steps">{setupSteps.map((item, index) => <button key={item.id} className={cx("setup-item", selectedSetup === item.id && "selected")} data-value={setup[item.id]} type="button" onClick={() => setSelectedSetup(item.id)}><span>{index + 1}</span>{item.title}</button>)}</div>
            </section>
            <section className="panel wide">
              <PanelHeading kicker={`Step ${setupSteps.indexOf(step) + 1}`} title={step.title} action={<CheckCircle2 size={18} />} />
              <p className="section-detail">{step.outcome}</p>
              <ChoiceGrid options={step.options} selected={setup[step.id]} onSelect={(option) => setSetup((current) => ({ ...current, [step.id]: option }))} />
              <div className="publish-checklist compact">{setupSteps.map((item) => <div className="publish-item" key={item.id}><span>{item.title}</span><strong>{setup[item.id]}</strong></div>)}</div>
            </section>
            <section className="panel">
              <PanelHeading kicker="Publish flow" title="Pricing advisor" action={<SlidersHorizontal size={18} />} />
              <div className="pricing-box"><strong>${price}</strong><small>base {pricing.base} + complexity {pricing.complexity} + support {pricing.support} + market {pricing.market}</small></div>
              <div className="price-controls">{(Object.keys(pricing) as Array<keyof PricingState>).map((key) => <div className="price-row" key={key}><span>{key}</span><strong>{pricing[key]}</strong><button className="stepper" type="button" onClick={() => updatePrice(key, -4)}>-</button><button className="stepper" type="button" onClick={() => updatePrice(key, 4)}>+</button></div>)}</div>
            </section>
          </section>
        )}

        {view === "export" && (
          <section className="view active export-layout">
            <section className="panel export-panel">
              <PanelHeading kicker="Launch package" title="10-section professional export" action={<button className="primary" type="button" onClick={copyExport}><Copy size={16} />Copy package</button>} />
              <pre>{exportText}</pre>
            </section>
            <section className="panel">
              <PanelHeading kicker="Handoff checklist" title="Ready for build" />
              <div className="handoff-list">
                {["Product surface defined", "10 spec sections selected", "6 launcher steps mapped", "Pricing advisor calculated", "Portfolio workstreams visible", "Marketplace clone path ready"].map((item) => <span key={item}><CheckCircle2 size={16} />{item}</span>)}
              </div>
            </section>
          </section>
        )}
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
  return <div className="segmented">{(["all", "launch", "risk", "systems"] as Filter[]).map((item) => <button key={item} className={cx("segment", value === item && "active")} type="button" onClick={() => onChange(item)}>{item}</button>)}</div>;
}
