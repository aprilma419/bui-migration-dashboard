import React, { useState, useMemo } from 'react';
import {
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  Masthead,
  MastheadMain,
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
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import ClipboardListIcon from '@patternfly/react-icons/dist/esm/icons/clipboard-list-icon';
import MapMarkedIcon from '@patternfly/react-icons/dist/esm/icons/map-marked-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import LayerGroupIcon from '@patternfly/react-icons/dist/esm/icons/layer-group-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import TasksIcon from '@patternfly/react-icons/dist/esm/icons/tasks-icon';
import workplanImported from './workplan.md?raw';

const workplanMarkdown =
  typeof workplanImported === 'string'
    ? workplanImported
    : String(workplanImported?.default ?? '');

const navTabs = [
  { id: 'audit', label: 'Component audit', Icon: ClipboardListIcon },
  { id: 'mapping', label: 'PF6 token mapping', Icon: MapMarkedIcon },
  { id: 'blockers', label: 'Technical blockers', Icon: ExclamationTriangleIcon },
  { id: 'strategy', label: 'Implementation', Icon: LayerGroupIcon },
  { id: 'workplan', label: 'Work Plan', Icon: TasksIcon },
];

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

const App = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const workplan = useMemo(() => parseWorkplan(workplanMarkdown), []);

  const auditData = [
    { mui: 'Button', bui: 'Button', status: 'ready', criticality: 'High', notes: 'BUI Button is stable and aligns with PF6 core styles.' },
    { mui: 'Table', bui: 'Table', status: 'progress', criticality: 'High', notes: 'BUI Table lacks PF6-specific bulk selection and composable cell features.' },
    { mui: 'TextField / Select', bui: 'Form Controls', status: 'ready', criticality: 'High', notes: 'Standard inputs ready; must map to PF6 form-control variables.' },
    { mui: 'DataGrid', bui: 'N/A', status: 'missing', criticality: 'Critical', notes: 'Significant gap for PF6-style data management views.' },
    { mui: 'Dialog / Modal', bui: 'Modal', status: 'ready', criticality: 'Medium', notes: 'BUI Modal is functional; needs PF6 backdrop variable overrides.' },
    { mui: 'Box / Grid', bui: 'Layout / Box', status: 'ready', criticality: 'High', notes: 'PF6 layout system is highly compatible with BUI Box.' },
    { mui: 'Autocomplete', bui: 'Search / Select', status: 'missing', criticality: 'High', notes: 'Required for entity picking; PF6 Select behavior preferred.' },
  ];

  const tokenMapping = [
    { group: 'Colors', bui: 'color.background.canvas', pf: '--pf-v6-global--BackgroundColor--100', example: '#FFFFFF' },
    { group: 'Colors', bui: 'color.text.primary', pf: '--pf-v6-global--Color--100', example: '#151515' },
    { group: 'Spacing', bui: 'spacing.md (8px)', pf: '--pf-v6-global--spacer--md', example: '8px' },
    { group: 'Radii', bui: 'border.radius.sm', pf: '--pf-v6-global--BorderRadius--sm', example: '3px' },
    { group: 'Elevation', bui: 'shadow.card', pf: '--pf-v6-global--BoxShadow--sm', example: '0 2px 4px...' },
    { group: 'Brand', bui: 'color.background.brand', pf: '--pf-v6-global--primary-color--100', example: '#0066CC' },
  ];

  const blockers = [
    { title: 'PF6 Component Alignment', description: 'BUI components must be verified against PF6 visual changes, particularly increased whitespace and updated border-radius logic.', priority: 'P0' },
    { title: 'Complex Data Filtering', description: 'RHDH relies on MUI DataGrid. BUI Table needs PF6-style filter chips and side-panel integration.', priority: 'P0' },
    { title: 'Scaffolder Form Gaps', description: 'Custom field extensions in RHDH use MUI internals that lack PF6/BUI equivalents.', priority: 'P1' },
    { title: 'Theme Switching (PF6)', description: 'PF6 uses updated CSS variables for dark mode; BUI dynamic tokens must sync with these new variables.', priority: 'P1' },
  ];

  const strategyPhases = [
    {
      step: 'PF6 Foundation',
      desc: 'Ensure PatternFly 6 base stylesheets are loaded globally to provide the CSS variable scope for both MUI and BUI.',
      tag: 'INFRASTRUCTURE',
    },
    {
      step: 'BUI Token Override',
      desc: 'Map BUI design tokens directly to --pf-v6 variables using a custom CSS module or JS object in the BUI Provider.',
      tag: 'THEMING',
    },
    {
      step: 'MUI Prefixing (rhdh-mui)',
      desc: 'Maintain MUI 5 components with a prefix to prevent PF6 global styles from causing regressions in legacy layouts.',
      tag: 'ISOLATION',
    },
    {
      step: 'Iterative Migration',
      desc: 'Migrate high-traffic pages to BUI + PF6 first, while keeping utility plugins in MUI to minimize development overhead.',
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

  const swatchIsSpacing = (token) =>
    token.group === 'Spacing' && token.example.endsWith('px') && !token.example.startsWith('#');

  const masthead = (
    <Masthead>
      {/* Main must be a direct child of Masthead for the grid; keep empty so primary content uses the flexible column. */}
      <MastheadMain />
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
                Transitioning from MUI to Backstage UI with PatternFly 6
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
            {navTabs.map(({ id, label, Icon }) => (
              <NavItem key={id} itemId={id} isActive={activeTab === id} to="#" preventDefault icon={<Icon />}>
                {label}
              </NavItem>
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
                value={35}
                title="BUI tokens mapped to PF6"
                measureLocation="outside"
                size="sm"
              />
              <Content component="small">35% of BUI tokens successfully mapped to PF6 global variables.</Content>
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
              <CardTitle>Component audit (MUI → BUI in PF6 context)</CardTitle>
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
                  {auditData.map((item) => (
                    <Tr key={item.mui}>
                      <Td dataLabel="MUI component">
                        <Content component="small">
                          <code>{item.mui}</code>
                        </Content>
                      </Td>
                      <Td dataLabel="BUI equivalent">{item.bui}</Td>
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
          <Gallery hasGutter minWidths={{ default: '280px', md: '320px' }}>
            {tokenMapping.map((token) => (
              <GalleryItem key={token.bui}>
                <Card isFullHeight>
                  <CardHeader>
                    <Level hasGutter>
                      <LevelItem>
                        <Label color="red">{token.group}</Label>
                      </LevelItem>
                      <LevelItem>
                        <div
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: 'var(--pf-t--global--border--radius--small, 4px)',
                            border: '1px solid var(--pf-t--global--border--color--default, #c7c7c7)',
                            backgroundColor: token.example.startsWith('#') ? token.example : 'var(--pf-t--global--background--color--secondary--default, #f5f5f5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {swatchIsSpacing(token) ? (
                            <span
                              style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                background: 'var(--pf-t--global--icon--color--subtle, #6a6e73)',
                                borderRadius: 2,
                              }}
                            />
                          ) : null}
                        </div>
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
                PF6 transition architecture
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
