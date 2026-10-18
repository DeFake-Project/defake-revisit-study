import {
  Accordion, Anchor, Badge, Box, List, Stack, Table, Text, Title,
} from '@mantine/core';
import { StimulusParams } from '../../../store/types';
import { tookPartInRoundOne } from './answers';
import {
  LevelRow, LevelTone, RoundPageContent, TableSpec, UserPiece, pageById,
} from './pages';
import { referenceById } from './references';

export type RoundPageParams = {
  pageId: string;
};

const TONE = {
  default: {
    big: '#27509b',
    box: '#e6edf9',
    light: '#dfe9f7',
    moderate: '#c3d5f0',
    deep: '#9fbbe6',
    bar: '#27509b',
  },
  stop: {
    big: '#b4561c',
    box: '#fbeee4',
    light: '#f8e4d4',
    moderate: '#f3d3ba',
    deep: '#ebc09a',
    bar: '#b4561c',
  },
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

function LevelList({ rows, tone }: { rows: LevelRow[]; tone: 'default' | 'stop' }) {
  const colors = TONE[tone];
  const fill: Record<LevelTone, string> = {
    light: '33%',
    moderate: '66%',
    deep: '100%',
    every: '0%',
  };
  const background: Record<LevelTone, string> = {
    light: colors.light,
    moderate: colors.moderate,
    deep: colors.deep,
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
            borderRadius: 6,
            background: background[row.tone],
          }}
        >
          <Text size="xs" fw={600} tt="uppercase" style={{ letterSpacing: '0.04em' }}>
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
                  background: `linear-gradient(90deg, ${colors.bar} ${fill[row.tone]}, #d9dee7 ${fill[row.tone]})`,
                }}
              />
            ) : null}
            {row.name}
          </Text>
          <Text size="sm">{row.text}</Text>
        </Box>
      ))}
    </Stack>
  );
}

function UserPieces({ pieces, tone }: { pieces: UserPiece[]; tone: 'default' | 'stop' }) {
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
          return <Text key={key} c="dimmed" size="sm">{piece.text}</Text>;
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
        return <LevelList key={key} rows={piece.rows} tone={tone} />;
      })}
    </Stack>
  );
}

function DataTable({ table }: { table: TableSpec }) {
  return (
    <Stack gap={6}>
      {table.caption ? <Text size="sm" c="dimmed">{table.caption}</Text> : null}
      <Table.ScrollContainer minWidth={560}>
        <Table withTableBorder withColumnBorders verticalSpacing="xs" horizontalSpacing="xs" fz="sm">
          <Table.Thead>
            <Table.Tr>
              {table.columns.map((column) => <Table.Th key={column}>{column}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {table.rows.map((row) => (
              <Table.Tr key={row.join('|')}>
                {row.map((cell, index) => (
                  index === 0
                    ? <Table.Th key={`${cell}-0`} scope="row">{cell}</Table.Th>
                    : <Table.Td key={`${cell}-${index}`}>{cell}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

function panelControl(label: string, summary: string) {
  return (
    <Accordion.Control>
      <Text span fw={600}>{label}</Text>
      <Text span c="dimmed" size="sm" ml="sm">{summary}</Text>
    </Accordion.Control>
  );
}

function PageBody({ page }: { page: RoundPageContent }) {
  const colors = TONE[page.tone];
  const upper = [page.why ? 'why' : null, page.how ? 'how' : null].filter((value): value is string => value !== null);
  const lower = [page.teaching ? 'teaching' : null, page.research ? 'research' : null].filter((value): value is string => value !== null);

  return (
    <Stack gap="md">
      <div>
        <Text size="xs" tt="uppercase" fw={600} c="dimmed" style={{ letterSpacing: '0.08em' }}>{page.eyebrow}</Text>
        <Title order={2} mt={4}>
          {page.big ? <Text span inherit c={colors.big} mr="sm">{page.big}</Text> : null}
          {page.title}
        </Title>
      </div>
      {page.lead ? <Text size="lg" style={{ maxWidth: '62ch' }}>{page.lead}</Text> : null}
      {page.paragraphs?.map((paragraph) => <RichText key={paragraph} text={paragraph} size="md" />)}
      {upper.length > 0 ? (
        <Accordion multiple variant="separated" radius="md">
          {page.why ? (
            <Accordion.Item value="why">
              {panelControl('Why this changed', page.why.summary)}
              <Accordion.Panel>
                <Stack gap="sm">
                  {page.why.paragraphs.map((paragraph) => <RichText key={paragraph} text={paragraph} />)}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
          {page.how ? (
            <Accordion.Item value="how">
              {panelControl('How we justify the change', page.how.summary)}
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
        <Box p="md" style={{ background: colors.box, borderRadius: 8 }}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb="sm" style={{ letterSpacing: '0.06em' }}>
            {page.userbox.caption}
          </Text>
          <UserPieces pieces={page.userbox.pieces} tone={page.tone} />
        </Box>
      ) : null}
      {page.example ? (
        <Text size="sm" pl="sm" style={{ borderLeft: '3px solid var(--mantine-color-gray-4)', maxWidth: '68ch' }}>
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
              {panelControl('For learning and teaching', page.teaching.summary)}
              <Accordion.Panel>
                <Stack gap="md">
                  {page.teaching.tables.map((table) => <DataTable key={table.caption || table.columns.join('|')} table={table} />)}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ) : null}
          {page.research ? (
            <Accordion.Item value="research">
              {panelControl('Research still needed', `${page.research.items.length} open questions`)}
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
    </Stack>
  );
}

export default function RoundPage({ parameters, answers }: StimulusParams<RoundPageParams>) {
  const page = pageById(parameters.pageId);
  if (!page) {
    return <Text c="red">{`Unknown page ${parameters.pageId}`}</Text>;
  }

  const showNewParticipantNote = page.id === 'intro' && tookPartInRoundOne(answers) === false;

  return (
    <Box maw={780} mx="auto" p="md">
      <Stack gap="md">
        {showNewParticipantNote ? (
          <Box p="sm" style={{ background: '#fff7d6', borderRadius: 8 }}>
            <Badge variant="light" color="yellow" mb={6}>First time in this study</Badge>
            <Text size="sm">
              You did not take part in Round 1. The summary below is what that panel told us, written as if speaking to them. Your answers in this round are reported separately from theirs.
            </Text>
          </Box>
        ) : null}
        <PageBody page={page} />
      </Stack>
    </Box>
  );
}
