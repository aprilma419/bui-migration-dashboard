import React, { useState, useMemo } from 'react';
import {
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  Masthead,
  MastheadMain,
  MastheadBrand,
  MastheadLogo,
  MastheadContent,
  Nav,
  NavList,
  NavItem,
  Title,
  Content,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Progress,
  Label,
  Button,
  Alert,
  Stack,
  Divider,
  ProgressStepper,
  ProgressStep,
  Gallery,
  GalleryItem,
  Level,
  LevelItem,
  Badge,
  Split,
  SplitItem,
  Flex,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import ClipboardListIcon from '@patternfly/react-icons/dist/esm/icons/clipboard-list-icon';
import MapMarkedIcon from '@patternfly/react-icons/dist/esm/icons/map-marked-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import LayerGroupIcon from '@patternfly/react-icons/dist/esm/icons/layer-group-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import TasksIcon from '@patternfly/react-icons/dist/esm/icons/tasks-icon';
import workplanImported from '../workplan.md?raw';
import rhdhLogoUrl from '../rhdh_logo.png?url';

const workplanMarkdown =
  typeof workplanImported === 'string'
    ? workplanImported
    : String(workplanImported?.default ?? '');

const navTabs = [
  {
    id: 'audit',
    label: 'Component audit',
    Icon: ClipboardListIcon,
    tooltip:
      'Component audit: A status-tracked table comparing MUI components currently in RHDH against their BUI equivalents.',
  },
  {
    id: 'mapping',
    label: 'PF6 token mapping',
    Icon: MapMarkedIcon,
    tooltip:
      'Token mapping: Visual cards showing how BUI design tokens (like background and spacing) map directly to PatternFly CSS variables.',
  },
  {
    id: 'blockers',
    label: 'Technical blockers',
    Icon: ExclamationTriangleIcon,
    tooltip:
      'Technical blockers: A highlighted list of high-priority gaps (like the DataGrid) that need upstream attention.',
  },
  {
    id: 'strategy',
    label: 'Implementation',
    Icon: LayerGroupIcon,
    tooltip:
      'Implementation strategy: Phased roadmap—upstream BUI alignment, PF6 foundation, BUI↔PF token bridge, scoped MUI coexistence, and iterative plugin migration toward RHDH 2.0.',
  },
  {
    id: 'workplan',
    label: 'Work Plan',
    Icon: TasksIcon,
    tooltip:
      'Work plan: Phases, goals, and tasks from workplan.md for structured migration tracking in this dashboard.',
  },
];

/** High-priority BUI↔PF pairings in scope for RHDH (subset of the full https://ui.backstage.io/tokens catalog). Raise as migration scope grows. */
const BUI_PF_PRIORITY_PAIR_TARGET = 62;

/** Split workplan.md into phases (file is one line; phases/tasks are delimited in text). */
function parseWorkplan(raw) {
  const trimmed = String(raw ?? '').trim();
  const chunks = trimmed.split(/(?=Phase \d+:)/);
  let intro = null;
  let phaseChunks = chunks;
  if (chunks[0] && !chunks[0].startsWith('Phase ')) {
    intro = chunks[0].trim();
    phaseChunks = chunks.slice(1);
  }
  const phases = phaseChunks.map((block) => {
    const taskSplit = block.split(/(?=Task \d+\.\d+:)/);
    const head = taskSplit[0].trim();
    const goalParts = head.split(/(?=Goal:)/);
    const phaseTitle = goalParts[0].trim();
    const goalText = goalParts.slice(1).join('').trim();
    const tasks = taskSplit.slice(1).map((t) => t.trim()).filter(Boolean);
    return { phaseTitle, goalText, tasks };
  });
  return { intro, phases };
}

const TOKEN_SWATCH_FRAME = {
  width: '2rem',
  height: '2rem',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  boxSizing: 'border-box',
};

function tokenPreviewKind(token) {
  const { pf, group } = token;
  if (group === 'Breakpoint') return 'breakpoint';
  if (group === 'Radii' || pf.includes('border--radius')) return 'radius';
  if (group === 'Focus') return 'focus';
  if (group.includes('Spacing')) return 'spacing';
  if (group === 'Border') return 'border';
  if (group === 'Typography') return pf.includes('font--weight') ? 'fontWeight' : 'fontFamily';
  if (group === 'Text' || pf.includes('text--color')) return 'foreground';
  return 'background';
}

/** Renders a 2rem preview driven by the PatternFly variable on each mapping row. */
function TokenPreviewSwatch({ token }) {
  const { pf, example } = token;
  const kind = tokenPreviewKind(token);
  const v = (name) => `var(${name})`;
  const radiusPxFallback =
    example && /^[\d.]+px$/.test(String(example).trim()) ? String(example).trim() : '4px';
  const radiusWithFallback = `var(${pf}, ${radiusPxFallback})`;

  if (kind === 'background') {
    return (
      <div
        aria-hidden
        style={{
          ...TOKEN_SWATCH_FRAME,
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          border: '1px solid var(--pf-t--global--border--color--default)',
          backgroundColor: v(pf),
        }}
      />
    );
  }

  if (kind === 'foreground') {
    return (
      <div
        aria-hidden
        style={{
          ...TOKEN_SWATCH_FRAME,
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          border: '1px solid var(--pf-t--global--border--color--default)',
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
          color: v(pf),
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: 'var(--pf-t--global--font--family--body)',
        }}
      >
        Aa
      </div>
    );
  }

  if (kind === 'border') {
    return (
      <div
        aria-hidden
        style={{
          ...TOKEN_SWATCH_FRAME,
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          border: `3px solid ${v(pf)}`,
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
        }}
      />
    );
  }

  if (kind === 'spacing') {
    return (
      <div
        aria-hidden
        style={{
          ...TOKEN_SWATCH_FRAME,
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          border: '1px dashed var(--pf-t--global--border--color--default)',
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
        }}
      >
        <div
          style={{
            width: v(pf),
            height: v(pf),
            minWidth: 1,
            minHeight: 1,
            backgroundColor: 'var(--pf-t--global--color--brand--default)',
            borderRadius: 2,
          }}
        />
      </div>
    );
  }

  if (kind === 'radius') {
    /* Single soft tile on white: subtle PF surface tone so the token’s corner radius reads without a heavy border. */
    return (
      <div
        aria-hidden
        style={{
          width: '2.25rem',
          height: '2.25rem',
          flexShrink: 0,
          boxSizing: 'border-box',
          backgroundColor: 'var(--pf-t--global--background--color--200)',
          borderRadius: radiusWithFallback,
        }}
      />
    );
  }

  if (kind === 'focus') {
    return (
      <div
        aria-hidden
        style={{
          ...TOKEN_SWATCH_FRAME,
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
          boxShadow: `0 0 0 2px ${v(pf)}`,
        }}
      />
    );
  }

  if (kind === 'fontFamily') {
    return (
      <div
        aria-hidden
        style={{
          ...TOKEN_SWATCH_FRAME,
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          border: '1px solid var(--pf-t--global--border--color--default)',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          fontFamily: v(pf),
          fontSize: '14px',
          lineHeight: 1,
        }}
      >
        Aa
      </div>
    );
  }

  if (kind === 'fontWeight') {
    return (
      <div
        aria-hidden
        style={{
          ...TOKEN_SWATCH_FRAME,
          borderRadius: 'var(--pf-t--global--border--radius--small)',
          border: '1px solid var(--pf-t--global--border--color--default)',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          fontFamily: 'var(--pf-t--global--font--family--body)',
          fontWeight: v(pf),
          fontSize: '13px',
        }}
      >
        Aa
      </div>
    );
  }

  const breakpointVars = [
    '--pf-t--global--breakpoint--250',
    '--pf-t--global--breakpoint--300',
    '--pf-t--global--breakpoint--350',
  ];

  return (
    <div
      aria-hidden
      style={{
        ...TOKEN_SWATCH_FRAME,
        flexDirection: 'column',
        gap: 3,
        padding: 3,
        alignItems: 'stretch',
        justifyContent: 'center',
        borderRadius: 'var(--pf-t--global--border--radius--small)',
        border: '1px solid var(--pf-t--global--border--color--default)',
        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
      }}
    >
      {breakpointVars.map((bp) => (
        <div
          key={bp}
          title={bp}
          style={{
            height: 5,
            width: `calc(var(${bp}) / 60)`,
            maxWidth: '100%',
            backgroundColor: 'var(--pf-t--global--color--brand--default)',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}

const BUI_COMPONENT_DOCS = 'https://ui.backstage.io/components';
/** Live Backstage instance showcasing the upstream MUI → BUI migration path. */
const BUI_MUI_DEMO_URL = 'https://demo.backstage.io/mui-to-bui';

/** PascalCase BUI component name → kebab-case path (matches https://ui.backstage.io/components/... ). */
function buiComponentToSlug(name) {
  const trimmed = name.trim();
  if (!trimmed || /^n\/?a$/i.test(trimmed)) return null;
  return trimmed
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function BuiEquivalentLinks({ text }) {
  const parts = String(text ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <Content component="small">
      {parts.map((name, i) => {
        const slug = buiComponentToSlug(name);
        const sep = i > 0 ? ', ' : null;
        if (!slug) {
          return (
            <React.Fragment key={`${name}-${i}`}>
              {sep}
              {name}
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={`${name}-${i}`}>
            {sep}
            <a href={`${BUI_COMPONENT_DOCS}/${slug}`} target="_blank" rel="noopener noreferrer">
              {name}
            </a>
          </React.Fragment>
        );
      })}
    </Content>
  );
}

const App = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [auditStatusFilter, setAuditStatusFilter] = useState('all');
  const [tokenGroupFilter, setTokenGroupFilter] = useState('all');
  const workplan = useMemo(() => parseWorkplan(workplanMarkdown), []);

  const auditData = [
    { mui: 'Button / IconButton', bui: 'Button, ButtonIcon', status: 'progress', criticality: 'High', notes: 'Align primary/secondary palettes and weights with PF6 buttons; upstream BUI defaults diverge from Red Hat brand—re-verify after token overrides.' },
    { mui: 'Table', bui: 'Table', status: 'progress', criticality: 'High', notes: 'BUI Table lacks PF6-style bulk selection, expandable rows, and dense data-grid tooling.' },
    { mui: 'TextField / Select', bui: 'TextField, Select, PasswordField', status: 'ready', criticality: 'High', notes: 'Documented form controls; map heights and borders to PF6 form tokens.' },
    { mui: 'DataGrid', bui: 'N/A', status: 'missing', criticality: 'Critical', notes: 'No BUI DataGrid; RHDH filtering, column resize, and virtualization need a strategy (Table + patterns vs third-party).' },
    { mui: 'Dialog / Modal', bui: 'Dialog', status: 'ready', criticality: 'Medium', notes: 'BUI Dialog exists (not named Modal); align overlay, spacing, and header with PF6 Modal.' },
    { mui: 'Box / Grid / Stack', bui: 'Box, Flex, Grid, Container', status: 'ready', criticality: 'High', notes: 'Layout primitives match BUI surface model; responsive prop objects align with useBreakpoint.' },
    { mui: 'Autocomplete', bui: 'SearchAutocomplete, Select', status: 'progress', criticality: 'High', notes: 'SearchAutocomplete covers search-style comboboxes; full MUI Autocomplete (free solo, multi-chip) may still gap—validate entity pickers.' },
    { mui: 'Typography', bui: 'Text', status: 'progress', criticality: 'High', notes: 'Use BUI Text for body and headings; confirm scale vs PF6 title and content typography.' },
    { mui: 'Tabs', bui: 'Tabs', status: 'ready', criticality: 'Medium', notes: 'Available in BUI; check tab list spacing and active indicator vs PF6 Tabs.' },
    { mui: 'Card / Paper', bui: 'Card', status: 'progress', criticality: 'High', notes: 'BUI Card uses neutral surface depth; PF6 cards often use border + shadow—bridge stacking vs elevation so plugins look cohesive.' },
    { mui: 'Chip / Filter', bui: 'TagGroup', status: 'progress', criticality: 'Medium', notes: 'TagGroup is the closest chip-like primitive; PF6 label/filter chip patterns may need composition.' },
    { mui: 'Accordion / ExpansionPanel', bui: 'Accordion', status: 'ready', criticality: 'Medium', notes: 'Map disclosure icons and borders to PF6 expandable sections where needed.' },
    { mui: 'Alert / Snackbar', bui: 'Alert', status: 'ready', criticality: 'Medium', notes: 'BUI Alert maps status colors; global toast/snackbar may still be app-level.' },
    { mui: 'Menu / Popover', bui: 'Menu, Popover', status: 'ready', criticality: 'High', notes: 'Overlay positioning and scroll behavior should be checked against PF6 dropdowns.' },
    { mui: 'List', bui: 'List', status: 'ready', criticality: 'Medium', notes: 'Use for nav-style lists; dense lists in catalog may need Table or custom rows.' },
    { mui: 'Checkbox / Radio / Switch', bui: 'Checkbox, RadioGroup, Switch', status: 'ready', criticality: 'Medium', notes: 'Form controls present; align touch targets and error states with PF6 forms.' },
    { mui: 'AppBar / Toolbar', bui: 'Header, PluginHeader', status: 'progress', criticality: 'High', notes: 'Backstage-specific headers; theming must coexist with PF6 Masthead patterns in shell plugins.' },
    { mui: 'Skeleton / Progress', bui: 'Skeleton', status: 'progress', criticality: 'Low', notes: 'Skeleton only; linear or circular progress may need PF6 Progress or custom tokens.' },
    { mui: 'Link', bui: 'Link, ButtonLink', status: 'ready', criticality: 'Low', notes: 'Inline links and link-styled buttons covered.' },
    { mui: 'Tooltip', bui: 'Tooltip', status: 'ready', criticality: 'Low', notes: 'Verify delay and contrast vs PF6 Tooltip.' },
    { mui: 'Search field', bui: 'SearchField', status: 'ready', criticality: 'Medium', notes: 'Dedicated search input; pair with SearchAutocomplete where catalog search matches.' },
    { mui: 'Toggle group', bui: 'ToggleButton, ToggleButtonGroup', status: 'ready', criticality: 'Low', notes: 'Use for segmented controls; PF6 toggle group spacing may differ.' },
    { mui: 'Avatar', bui: 'Avatar', status: 'ready', criticality: 'Low', notes: 'Present; size tokens should follow neutral scale.' },
  ];

  const filteredAuditData =
    auditStatusFilter === 'all'
      ? auditData
      : auditData.filter((item) => item.status === auditStatusFilter);

  const tokenMapping = [
    { group: 'Canvas / app bg', bui: '--bui-bg-app', pf: '--pf-t--global--background--color--primary--default', example: 'Page canvas' },
    { group: 'Surfaces', bui: '--bui-bg-neutral-1', pf: '--pf-t--global--background--color--secondary--default', example: 'Cards / dialogs' },
    { group: 'Surfaces', bui: '--bui-bg-neutral-2', pf: '--pf-t--global--background--color--secondary--hover', example: 'Nested surface' },
    { group: 'Text', bui: '--bui-fg-primary', pf: '--pf-t--global--text--color--regular', example: 'Body text' },
    { group: 'Text', bui: '--bui-fg-secondary', pf: '--pf-t--global--text--color--200', example: 'Muted' },
    { group: 'Text', bui: '--bui-fg-disabled', pf: '--pf-t--global--text--color--disabled', example: 'Disabled' },
    { group: 'Brand / solid', bui: '--bui-bg-solid', pf: '--pf-t--global--color--brand--default', example: 'Primary CTA' },
    { group: 'Status', bui: '--bui-bg-danger', pf: '--pf-t--global--color--status--danger--default', example: 'Danger surface' },
    { group: 'Status', bui: '--bui-bg-warning', pf: '--pf-t--global--color--status--warning--100', example: 'Warning surface' },
    { group: 'Status', bui: '--bui-bg-success', pf: '--pf-t--global--color--status--success--100', example: 'Success surface' },
    { group: 'Status', bui: '--bui-bg-info', pf: '--pf-t--global--color--status--info--100', example: 'Info surface' },
    { group: 'Border', bui: '--bui-border-1', pf: '--pf-t--global--border--color--default', example: 'Subtle divider' },
    { group: 'Border', bui: '--bui-border-2', pf: '--pf-t--global--border--color--200', example: 'Stronger rule' },
    { group: 'Spacing scale', bui: '--bui-space (base)', pf: '--pf-t--global--spacer--100', example: 'Align scales (0.25rem)' },
    { group: 'Spacing', bui: '--bui-space-4', pf: '--pf-t--global--spacer--300', example: '1rem gap' },
    { group: 'Radii', bui: '--bui-radius-2', pf: '--pf-t--global--border--radius--tiny', example: '4px' },
    { group: 'Radii', bui: '--bui-radius-3', pf: '--pf-t--global--border--radius--small', example: '6px' },
    { group: 'Focus', bui: '--bui-ring', pf: '--pf-t--global--focus-ring--color--default', example: 'Focus ring color' },
    { group: 'Typography', bui: '--bui-font-regular', pf: '--pf-t--global--font--family--body', example: 'Sans' },
    { group: 'Typography', bui: '--bui-font-monospace', pf: '--pf-t--global--font--family--mono', example: 'Mono' },
    { group: 'Typography', bui: '--bui-font-weight-bold', pf: '--pf-t--global--font--weight--body--bold', example: 'Bold' },
    { group: 'Breakpoint', bui: 'sm/md/lg (640/768/1024)', pf: '--pf-t--global--breakpoint--250/300/350', example: '40rem / 48rem / 60rem' },
  ];

  const tokenMapCoveragePct = Math.min(
    100,
    Math.round((tokenMapping.length / BUI_PF_PRIORITY_PAIR_TARGET) * 100),
  );

  const tokenMappingGroups = [...new Set(tokenMapping.map((t) => t.group))].sort((a, b) =>
    a.localeCompare(b),
  );

  const filteredTokenMapping =
    tokenGroupFilter === 'all'
      ? tokenMapping
      : tokenMapping.filter((t) => t.group === tokenGroupFilter);

  const blockers = [
    {
      title: 'PF6 visual parity vs upstream BUI defaults',
      description:
        'BUI ships with upstream “default” chrome that does not match PatternFly or Red Hat brand. Primary palette, button treatment, card radius, and density must be re-validated per component after token overrides—not a one-time pass.',
      priority: 'P0',
    },
    {
      title: 'Complex Data Filtering',
      description: 'RHDH relies on MUI DataGrid. BUI Table needs PF6-style filter chips and side-panel integration.',
      priority: 'P0',
    },
    {
      title: 'Operator / customer theming',
      description:
        'Customers need a supported way to override brand-related BUI tokens (e.g. solid/brand surfaces) without breaking upstream component behavior—document safe override surfaces and test with productized theme hooks.',
      priority: 'P1',
    },
    {
      title: 'Neutral surfaces vs PF borders & elevation',
      description:
        'BUI encodes hierarchy with stacked neutral backgrounds; PF6 often separates layers with borders and box-shadow. Define bridging rules so plugins do not fight both models or duplicate MUI-era styling work blindly.',
      priority: 'P1',
    },
    {
      title: 'Scaffolder Form Gaps',
      description: 'Custom field extensions in RHDH use MUI internals that lack PF6/BUI equivalents.',
      priority: 'P1',
    },
    {
      title: 'Theme switching & dark mode',
      description: 'PF6 and BUI both evolve CSS variables for light/dark; RHDH must keep BUI --bui-* overrides in sync so shell and plugins stay coherent.',
      priority: 'P1',
    },
    {
      title: 'RHDH plugin inventory & dual UI sunset',
      description:
        'Every RHDH-specific plugin needs a BUI migration path while upstream still allows MUI coexistence—avoid indefinite maintenance of two frameworks; align timelines with RHDH 2.0.',
      priority: 'P0',
    },
  ];

  const strategyPhases = [
    {
      step: 'Upstream alignment & audit',
      desc: 'Track Backstage’s MUI→BUI move; use this dashboard’s component audit and token matrix to list styling deltas for RHDH 2.0 while staying compatible with upstream APIs.',
      tag: 'DISCOVERY',
    },
    {
      step: 'PF6 Foundation',
      desc: 'Load PatternFly 6 base styles globally so --pf-t--global--* variables exist for both legacy MUI areas and new BUI surfaces during coexistence.',
      tag: 'INFRASTRUCTURE',
    },
    {
      step: 'BUI token & brand bridge',
      desc: 'Map BUI --bui-* tokens to PF variables via theme or root CSS. Re-engineer prior MUI/RH theme work for BUI so primary actions, cards, and radii read as PF-aligned, not upstream-default.',
      tag: 'THEMING',
    },
    {
      step: 'MUI isolation (rhdh-mui)',
      desc: 'Prefix or scope remaining MUI 5 usage so PF6 globals do not regress legacy plugins until each is migrated.',
      tag: 'ISOLATION',
    },
    {
      step: 'Iterative plugin migration',
      desc: 'Prioritize high-traffic plugins to BUI + PF6; publish per-plugin checklists. Goal: cohesive RH-branded UX with BUI visually indistinguishable from PF-influenced chrome, without forking upstream behavior.',
      tag: 'ROLLOUT',
    },
  ];

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'ready':
        return (
          <Label color="green" status="success">
            Ready
          </Label>
        );
      case 'progress':
        return (
          <Label color="orange" status="warning">
            In progress
          </Label>
        );
      case 'missing':
        return (
          <Label color="red" status="danger">
            Missing
          </Label>
        );
      default:
        return null;
    }
  };

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadBrand>
          <MastheadLogo>
            <img
              src={rhdhLogoUrl}
              alt="Red Hat Developer Hub"
              style={{ height: 36, width: 'auto', maxWidth: 'min(280px, 42vw)', objectFit: 'contain', display: 'block' }}
            />
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Split hasGutter>
          <SplitItem isFilled>
            <Stack hasGutter>
              <Title headingLevel="h1" size="2xl" style={{ whiteSpace: 'nowrap' }}>
                RHDH 2.0 migration strategy
              </Title>
              <Content component="div">
                <Label color="red" isCompact>
                  PF6 + BUI
                </Label>{' '}
                Align RHDH with upstream Backstage UI (BUI) while coexisting with MUI, and bridge BUI to PatternFly 6 so the product stays on-brand—not “upstream default” alone.
              </Content>
              <Content component="small">
                Upstream reference:{' '}
                <a href={BUI_MUI_DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Backstage demo — MUI to BUI
                </a>
              </Content>
            </Stack>
          </SplitItem>
          <SplitItem>
            <Badge screenReaderText="Build tag">pf6-beta-v1</Badge>
          </SplitItem>
        </Split>
      </MastheadContent>
    </Masthead>
  );

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <Nav aria-label="Migration views" onSelect={(_e, { itemId }) => itemId && setActiveTab(String(itemId))}>
          <NavList>
            {navTabs.map(({ id, label, Icon, tooltip }) => (
              <Tooltip
                key={id}
                content={tooltip}
                position="right"
                entryDelay={200}
                maxWidth="22rem"
                enableFlip
                flipBehavior={['right', 'left', 'top', 'bottom']}
                isContentLeftAligned
              >
                <NavItem itemId={id} isActive={activeTab === id} to="#" preventDefault icon={<Icon />}>
                  {label}
                </NavItem>
              </Tooltip>
            ))}
          </NavList>
        </Nav>
        <Divider />
        <Card isCompact style={{ marginTop: '24px' }}>
          <CardBody>
            <Stack hasGutter>
              <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                <InfoCircleIcon />
                <Title headingLevel="h2" size="md">
                  PF6 compliance
                </Title>
              </Flex>
              <Progress
                value={tokenMapCoveragePct}
                title="BUI ↔ PF6 reference mappings"
                measureLocation="outside"
                size="sm"
              />
              <Content component="small">
                {tokenMapCoveragePct}% — {tokenMapping.length} priority BUI↔PF pairs in the token mapping view (~
                {BUI_PF_PRIORITY_PAIR_TARGET} in scope). Measures documented reference rows, not shipped RHDH theme work.
              </Content>
            </Stack>
          </CardBody>
        </Card>
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page
      masthead={masthead}
      sidebar={sidebar}
      isContentFilled
      onPageResize={() => {
        /* Enables Page resize observer so width/height (breakpoint context) initialize; avoids edge cases with null dimensions. */
      }}
    >
      <PageSection isWidthLimited isCenterAligned>
        {activeTab === 'audit' && (
          <Card>
            <CardHeader
              actions={{
                actions: (
                  <Button variant="link" isInline>
                    Export report
                  </Button>
                ),
              }}
            >
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                flexWrap={{ default: 'wrap' }}
                columnGap={{ default: 'columnGapMd' }}
                rowGap={{ default: 'rowGapSm' }}
              >
                <div style={{ flex: '0 1 auto', maxWidth: 'min(22rem, 42vw)' }}>
                  <CardTitle>Component audit (MUI → BUI in PF6 context)</CardTitle>
                </div>
                <ToggleGroup aria-label="Filter rows by migration status" isCompact>
                  <ToggleGroupItem
                    text="All"
                    isSelected={auditStatusFilter === 'all'}
                    onChange={(_e, selected) => {
                      if (selected) setAuditStatusFilter('all');
                    }}
                  />
                  <ToggleGroupItem
                    text="Ready"
                    isSelected={auditStatusFilter === 'ready'}
                    onChange={(_e, selected) => {
                      if (selected) setAuditStatusFilter('ready');
                      else if (auditStatusFilter === 'ready') setAuditStatusFilter('all');
                    }}
                  />
                  <ToggleGroupItem
                    text="In progress"
                    isSelected={auditStatusFilter === 'progress'}
                    onChange={(_e, selected) => {
                      if (selected) setAuditStatusFilter('progress');
                      else if (auditStatusFilter === 'progress') setAuditStatusFilter('all');
                    }}
                  />
                  <ToggleGroupItem
                    text="Missing"
                    isSelected={auditStatusFilter === 'missing'}
                    onChange={(_e, selected) => {
                      if (selected) setAuditStatusFilter('missing');
                      else if (auditStatusFilter === 'missing') setAuditStatusFilter('all');
                    }}
                  />
                </ToggleGroup>
              </Flex>
            </CardHeader>
            <CardBody>
              <Table aria-label="MUI to BUI component audit" borders>
                <Thead>
                  <Tr>
                    <Th>MUI component</Th>
                    <Th>BUI equivalent</Th>
                    <Th>Status</Th>
                    <Th>Criticality</Th>
                    <Th>PF6 notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredAuditData.map((item) => (
                    <Tr key={item.mui}>
                      <Td dataLabel="MUI component">
                        <Content component="small">
                          <code>{item.mui}</code>
                        </Content>
                      </Td>
                      <Td dataLabel="BUI equivalent">
                        <BuiEquivalentLinks text={item.bui} />
                      </Td>
                      <Td dataLabel="Status">
                        <StatusBadge status={item.status} />
                      </Td>
                      <Td dataLabel="Criticality">{item.criticality}</Td>
                      <Td dataLabel="PF6 notes">
                        <Content component="small">{item.notes}</Content>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        )}

        {activeTab === 'mapping' && (
          <Stack hasGutter>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              flexWrap={{ default: 'wrap' }}
              columnGap={{ default: 'columnGapMd' }}
              rowGap={{ default: 'rowGapSm' }}
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
            >
              <Content component="p" style={{ margin: 0 }}>
                Filter by label (same as the red category on each card). BUI uses stacked neutral surfaces; PF6 often uses borders and elevation—treat mappings as a bridge, not identical physics.
              </Content>
              <div style={{ flex: '0 1 auto', minWidth: '12rem', maxWidth: '100%' }}>
                <FormSelect
                  value={tokenGroupFilter}
                  aria-label="Filter token mapping cards by category label"
                  onChange={(_e, value) => setTokenGroupFilter(value)}
                >
                  <FormSelectOption value="all" label="All categories" />
                  {tokenMappingGroups.map((group) => (
                    <FormSelectOption key={group} value={group} label={group} />
                  ))}
                </FormSelect>
              </div>
            </Flex>
            <Gallery hasGutter minWidths={{ default: '280px', md: '320px' }}>
            {filteredTokenMapping.map((token) => (
              <GalleryItem key={`${token.group}-${token.bui}`}>
                <Card isFullHeight>
                  <CardHeader>
                    <Level hasGutter>
                      <LevelItem>
                        <Label color="red">{token.group}</Label>
                      </LevelItem>
                      <LevelItem>
                        <TokenPreviewSwatch token={token} />
                      </LevelItem>
                    </Level>
                  </CardHeader>
                  <CardBody>
                    <Stack hasGutter>
                      <div>
                        <Content component="small">BUI token</Content>
                        <Content component="p">
                          <code>{token.bui}</code>
                        </Content>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <AngleRightIcon />
                      </div>
                      <div>
                        <Content component="small">PatternFly 6 variable</Content>
                        <Content component="p">
                          <code>{token.pf}</code>
                        </Content>
                      </div>
                    </Stack>
                  </CardBody>
                </Card>
              </GalleryItem>
            ))}
            </Gallery>
          </Stack>
        )}

        {activeTab === 'blockers' && (
          <Stack hasGutter>
            {blockers.map((blocker) => (
              <Alert
                key={blocker.title}
                variant="warning"
                isInline
                title={blocker.title}
                actionLinks={
                  <Label isCompact color="red">
                    {blocker.priority}
                  </Label>
                }
              >
                <Content component="p">{blocker.description}</Content>
              </Alert>
            ))}
          </Stack>
        )}

        {activeTab === 'strategy' && (
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="xl" style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
                RHDH 2.0 — BUI, PF6, and upstream compatibility
              </Title>
              <ProgressStepper isVertical aria-label="Migration implementation phases">
                {strategyPhases.map((phase, idx) => (
                  <ProgressStep
                    key={phase.step}
                    variant="info"
                    id={`migration-step-${idx}`}
                    titleId={`migration-step-title-${idx}`}
                    description={
                      <Stack hasGutter>
                        <Label color="red">{phase.tag}</Label>
                        <Content component="p">{phase.desc}</Content>
                      </Stack>
                    }
                  >
                    {phase.step}
                  </ProgressStep>
                ))}
              </ProgressStepper>
            </CardBody>
          </Card>
        )}

        {activeTab === 'workplan' && (
          <Card>
            <CardHeader>
              <CardTitle>RHDH 2.0 — MUI to BUI work plan</CardTitle>
            </CardHeader>
            <CardBody>
              {workplan.phases.length === 0 ? (
                <Stack hasGutter>
                  <Alert variant="warning" isInline title="Could not parse workplan into phases">
                    <Content component="p">
                      Showing raw file contents. Ensure workplan.md is next to code.jsx and restart the dev server.
                    </Content>
                  </Alert>
                  <Content
                    component="pre"
                    isEditorial
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'var(--pf-t--global--font--family--mono)',
                      fontSize: 'var(--pf-t--global--font--size--body--default)',
                    }}
                  >
                    {workplanMarkdown.trim() || '(empty file)'}
                  </Content>
                </Stack>
              ) : (
                <Stack hasGutter>
                  {workplan.intro ? (
                    <Content component="p" isEditorial>
                      {workplan.intro}
                    </Content>
                  ) : null}
                  {workplan.phases.map((phase, idx) => (
                    <Stack key={`${phase.phaseTitle}-${idx}`} hasGutter>
                      {idx > 0 ? <Divider /> : null}
                      <Title headingLevel="h3" size="lg">
                        {phase.phaseTitle}
                      </Title>
                      {phase.goalText ? (
                        <Content component="p" isEditorial>
                          {phase.goalText}
                        </Content>
                      ) : null}
                      {phase.tasks.map((task, taskIdx) => (
                        <Content
                          key={`${phase.phaseTitle}-task-${taskIdx}`}
                          component="p"
                          isEditorial
                          style={{ marginLeft: 'var(--pf-t--global--spacer--md)' }}
                        >
                          {task}
                        </Content>
                      ))}
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardBody>
          </Card>
        )}
      </PageSection>
    </Page>
  );
};

export default App;
