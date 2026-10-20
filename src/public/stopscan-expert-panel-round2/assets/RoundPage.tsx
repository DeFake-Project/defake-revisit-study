import {
  Accordion, Anchor, Badge, Box, List, Stack, Table, Text, Title,
} from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { tookPartInRoundOne } from './answers';
import {
  Icon, IconName, IconTile, StepIcon, StudyHeading,
} from './chrome';
import {
  LevelRow, LevelTone, RoundPageContent, TableSpec, UserPiece, pageById,
  ROUND_ONE_THANK_YOU,
} from './pages';
import { referenceById } from './references';
import { PageTheme, SS, pageTheme } from './theme';

export type RoundPageParams = {
  pageId: string;
};

const PAGE_MARK: Record<string, IconName> = {
  intro: 'users',
  run: 'route',
};

function RichText({ text, size = 'sm' }: { text: string; size?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text size={size} style={{ maxWidth: '68ch' }}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={`${part}-${index}`} span fw={700}>{part.slice(2, -2)}</Text>;
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </Text>
  );
}

function ReferenceList({ ids }: { ids: string[] }) {
  if (ids.length === 0) {
    return null;
  }
  return (
    <Stack gap={6} mt="sm" pt="sm" style={{ borderTop: '1px dashed var(--mantine-color-gray-3)' }}>
      <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.06em' }}>References</Text>
      <List size="sm" spacing={6}>
        {ids.map((id) => {
          const reference = referenceById(id);
          return (
            <List.Item key={id}>
              <Text span size="sm" c="dimmed">{reference.citation}</Text>
              {reference.doi ? (
                <>
                  {' '}
                  <Anchor href={`https://doi.org/${reference.doi}`} target="_blank" rel="noopener noreferrer" size="sm">
                    {`doi ${reference.doi}`}
                  </Anchor>
                </>
              ) : null}
            </List.Item>
          );
        })}
      </List>
    </Stack>
  );
}

function LevelList({ rows, theme }: { rows: LevelRow[]; theme: PageTheme }) {
  const fill: Record<LevelTone, string> = {
    light: '33%',
    moderate: '66%',
    deep: '100%',
    every: '0%',
  };
  const background: Record<LevelTone, string> = {
    light: `color-mix(in srgb, ${theme.accent} 10%, white)`,
    moderate: `color-mix(in srgb, ${theme.accent} 22%, white)`,
    deep: `color-mix(in srgb, ${theme.accent} 38%, white)`,
    every: 'transparent',
  };

  return (
    <Stack gap={6}>
      {rows.map((row) => (
        <Box
          key={`${row.name}-${row.text}`}
          px="sm"
          py={8}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(140px, 160px) 1fr',
            gap: 10,
            alignItems: 'baseline',
            borderRadius: 12,
            background: background[row.tone],
          }}
        >
          <Text size="xs" fw={600} tt="uppercase" c={SS.ink} style={{ letterSpacing: '0.04em' }}>
            {row.tone !== 'every' ? (
              <Box
                component="span"
                mr={8}
                style={{
                  display: 'inline-block',
                  width: 22,
                  height: 8,
                  borderRadius: 2,
                  verticalAlign: 'middle',
                  background: `linear-gradient(90deg, ${theme.accent} ${fill[row.tone]}, rgba(31,22,53,0.15) ${fill[row.tone]})`,
                }}
              />
            ) : null}
            {row.name}
          </Text>
          <Text size="sm" c={SS.ink}>{row.text}</Text>
        </Box>
      ))}
    </Stack>
  );
}

function UserPieces({ pieces, theme }: { pieces: UserPiece[]; theme: PageTheme }) {
  return (
    <Stack gap="sm">
      {pieces.map((piece, index) => {
        const key = `${piece.kind}-${index}`;
        if (piece.kind === 'paragraph') {
          return <RichText key={key} text={piece.text} size="md" />;
        }
        if (piece.kind === 'questions') {
          return (
            <List key={key} spacing={4}>
              {piece.items.map((item) => <List.Item key={item}><Text fw={600}>{item}</Text></List.Item>)}
            </List>
          );
        }
        if (piece.kind === 'rule') {
          return (
            <Box
              key={key}
              px="md"
              py="sm"
              style={{
                background: SS.white,
                border: `2px solid ${theme.accent}`,
                borderRadius: 12,
              }}
            >
              <Text fw={700} size="md" c={SS.ink}>{piece.text}</Text>
            </Box>
          );
        }
        if (piece.kind === 'steps') {
          return (
            <List key={key} type="ordered" spacing={6}>
              {piece.items.map((item) => (
                <List.Item key={item}><RichText text={item} size="md" /></List.Item>
              ))}
            </List>
          );
        }
        return <LevelList key={key} rows={piece.rows} theme={theme} />;
      })}
    </Stack>
  );
}

function DataTable({ table }: { table: TableSpec }) {
  const minWidth = Math.max(720, table.columns.length * 180);
  const cellStyle = {
    wordBreak: 'normal' as const,
    overflowWrap: 'normal' as const,
    hyphens: 'none' as const,
  };

  return (
    <Stack gap={6}>
      {table.caption ? <Text size="sm" c="dimmed">{table.caption}</Text> : null}
      <Table.ScrollContainer minWidth={minWidth}>
        <Table withTableBorder withColumnBorders verticalSpacing="xs" horizontalSpacing="xs" fz="sm">
          <Table.Thead>
            <Table.Tr>
              {table.columns.map((column) => <Table.Th key={column} style={cellStyle}>{column}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {table.rows.map((row) => (
              <Table.Tr key={row.join('|')}>
                {row.map((cell, index) => (
                  index === 0
                    ? <Table.Th key={`${cell}-0`} scope="row" style={cellStyle}>{cell}</Table.Th>
                    : <Table.Td key={`${cell}-${index}`} style={cellStyle}>{cell}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

function panelControl(label: string, summary: string, icon: IconName) {
  return (
    <Accordion.Control>
      <Box component="span" mr={8} style={{ color: SS.primary, verticalAlign: 'middle' }}>
        <Icon name={icon} size={16} />
      </Box>
      <Text span fw={600}>{label}</Text>
      <Text span c="dimmed" size="sm" ml="sm">{summary}</Text>
    </Accordion.Control>
  );
}

function PageBody({
  page,
  showRoundOneThankYou,
}: {
  page: RoundPageContent;
  showRoundOneThankYou: boolean;
}) {
  const theme = pageTheme(page.id);
  const upper = [page.why ? 'why' : null, page.how ? 'how' : null].filter((value): value is string => value !== null);
  const lower = [page.teaching ? 'teaching' : null, page.research ? 'research' : null].filter((value): value is string => value !== null);

  return (
    <Stack gap="md">
      <Box style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {theme.icon
          ? <StepIcon name={theme.icon} tile={theme.tile} />
          : <IconTile tile={theme.tile}><Icon name={PAGE_MARK[page.id] || 'book'} /></IconTile>}
        <div>
          <Text size="xs" tt="uppercase" fw={700} c={SS.primary} style={{ letterSpacing: '0.05em' }}>{page.eyebrow}</Text>
          <Title order={2} mt={4} style={{ fontFamily: 'Outfit, sans-serif' }}>
            {page.big ? <Text span inherit c={theme.accent} mr="sm">{page.big}</Text> : null}
            {page.title}
          </Title>
        </div>
      </Box>
      {showRoundOneThankYou ? <Text fw={700}>{ROUND_ONE_THANK_YOU}</Text> : null}
      {page.lead ? <Text size="lg" style={{ maxWidth: '62ch' }}>{page.lead}</Text> : null}
      {page.paragraphs?.map((paragraph) => <RichText key={paragraph} text={paragraph} size="md" />)}
      {upper.length > 0 ? (
        <Accordion multiple variant="separated" radius="md">
          {page.why ? (
            <Accordion.Item value="why">
              {panelControl('Why this changed', page.why.summary, 'message')}
              <Accordion.Panel>
                <Stack gap="sm">
                  {page.why.paragraphs.map((paragraph) => <RichText key={paragraph} text={paragraph} />)}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
          {page.how ? (
            <Accordion.Item value="how">
              {panelControl('How we justify the change', page.how.summary, 'book')}
              <Accordion.Panel>
                <Stack gap="sm">
                  {page.how.paragraphs.map((paragraph) => <RichText key={paragraph} text={paragraph} />)}
                  <ReferenceList ids={page.how.references} />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
        </Accordion>
      ) : null}
      {page.userbox ? (
        <Box p="md" style={{ background: theme.wash, borderRadius: 24, border: `1px solid ${SS.hairline}` }}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="sm" style={{ letterSpacing: '0.06em' }}>
            {page.userbox.caption}
          </Text>
          <UserPieces pieces={page.userbox.pieces} theme={theme} />
        </Box>
      ) : null}
      {page.example ? (
        <Text size="sm" pl="sm" style={{ borderLeft: `3px solid ${theme.accent}`, maxWidth: '68ch' }}>
          <Text span fw={600}>Example. </Text>
          {page.example}
        </Text>
      ) : null}
      {lower.length > 0 ? (
        <Accordion
          multiple
          variant="separated"
          radius="md"
          defaultValue={page.teaching?.startOpen ? ['teaching'] : []}
        >
          {page.teaching ? (
            <Accordion.Item value="teaching">
              {panelControl('For learning and teaching', page.teaching.summary, 'list')}
              <Accordion.Panel>
                <Stack gap="md">
                  {page.teaching.tables.map((table) => <DataTable key={table.caption || table.columns.join('|')} table={table} />)}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
          {page.research ? (
            <Accordion.Item value="research">
              {panelControl('Research still needed', `${page.research.items.length} open questions`, 'search')}
              <Accordion.Panel>
                <List spacing={6}>
                  {page.research.items.map((item) => <List.Item key={item}><Text size="sm">{item}</Text></List.Item>)}
                </List>
                {page.research.references ? <ReferenceList ids={page.research.references} /> : null}
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
        </Accordion>
      ) : null}
      {page.closingParagraphs?.map((paragraph) => <RichText key={paragraph} text={paragraph} size="md" />)}
    </Stack>
  );
}

export default function RoundPage({ parameters, answers }: StimulusParams<RoundPageParams>) {
  if (parameters.pageId === 'kept') {
    return (
      <Box className="ss-page" maw={780} mx="auto" p="md">
        <StudyHeading eyebrow="Study update" title="This step has moved" icon="check" />
        <Text mt="md">
          The optional final comment is now at the bottom of The final scaffold. If the old optional question appears below, you may leave it blank and select Next.
        </Text>
      </Box>
    );
  }

  const page = pageById(parameters.pageId);
  if (!page) {
    return <Text c="red">{`Unknown page ${parameters.pageId}`}</Text>;
  }

  const roundOneStatus = tookPartInRoundOne(answers);
  const showNewParticipantNote = page.id === 'intro' && roundOneStatus === false;
  const showRoundOneThankYou = page.id === 'intro' && roundOneStatus === true;

  return (
    <Box className="ss-page" maw={780} mx="auto" p="md">
      <Stack gap="md">
        {showNewParticipantNote ? (
          <Box p="sm" style={{ background: '#fff4e0', borderRadius: 24, border: `1px solid ${SS.hairline}` }}>
            <Badge mb={6} style={{ background: SS.fuel, color: SS.fuelInk }}>First time in this study</Badge>
            <Text size="sm">
              You did not complete Round 1. The summary below describes what the Round 1 panel told us. We will report your answers separately from theirs.
            </Text>
          </Box>
        ) : null}
        <PageBody page={page} showRoundOneThankYou={showRoundOneThankYou} />
      </Stack>
    </Box>
  );
}
