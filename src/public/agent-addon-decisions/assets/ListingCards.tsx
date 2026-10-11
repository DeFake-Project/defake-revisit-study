import { Badge, Box, Stack, Text, Title } from '@mantine/core';
import { ReactNode } from 'react';
import { StimulusParams } from '../../../store/types';

type ListingParameters = {
  listing: 'inbox-bounded' | 'inbox-broad' | 'docs';
  docOrder?: 'original-first' | 'plus-first';
};

function Card({
  name, publisher, meta, body, verified, asks,
}: {
  name: string;
  publisher: string;
  meta: string;
  body: string;
  verified?: boolean;
  asks?: string[];
}) {
  return (
    <Box p="md" style={{ border: '1px solid var(--mantine-color-gray-4)', borderRadius: 8 }}>
      <Title order={3}>{name}</Title>
      <Text size="sm" c="dimmed">
        {publisher}
        {verified ? ' · Verified' : ''}
      </Text>
      <Text size="sm" mt={4}>{meta}</Text>
      <Text mt="sm">{body}</Text>
      {asks && (
        <>
          <Text fw={600} mt="sm">What it asks for</Text>
          <Stack gap={4} mt={4}>
            {asks.map((line) => <Text key={line} size="sm">{line}</Text>)}
          </Stack>
        </>
      )}
      <Badge mt="md" variant="light" color="gray">Example listing — nothing here can be installed</Badge>
    </Box>
  );
}

const boundedAsks = [
  'Read the subject and body of messages in your inbox',
  'Add events to the calendar named "Work"',
  'InboxLane cannot delete messages or events',
  'This connection expires after 30 days. You can end it any time in Settings → Connections',
  'Message text is processed and discarded. Nothing is stored on Vantor servers',
  'InboxLane will ask you before sending any message or invitation',
];

export default function ListingCards({ parameters }: StimulusParams<ListingParameters>) {
  if (parameters.listing === 'inbox-bounded' || parameters.listing === 'inbox-broad') {
    return (
      <Stack gap="md">
        <Text>Imagine you want an AI assistant to help you find things in your email and set up meetings, and you come across this.</Text>
        <Card
          name="InboxLane"
          publisher="Vantor Labs · Email & Calendar · v2.1"
          meta="12,400 installs · ★ 4.4"
          body={'Search your mail in plain language and let the assistant set up meetings for you. Ask for what you need — "find the contract Dana sent in March", "put a 30-minute review with the design team on Thursday" — and InboxLane handles the rest.'}
          asks={parameters.listing === 'inbox-bounded' ? boundedAsks : ['Access your mailbox and calendar so InboxLane can help you']}
        />
      </Stack>
    );
  }

  const original = (
    <Card
      key="docpolish"
      name="DocPolish"
      publisher="Cedarline Tools"
      verified
      meta="41,000 installs · ★ 4.5 (1,900 ratings) · Updated 2 days ago"
      body="Convert, merge, split and clean up documents. Handles PDFs, Word files, slides and scanned pages, and keeps your original formatting intact."
    />
  );
  const plus = (
    <Card
      key="plus"
      name="DocPolish Plus"
      publisher="Cedarline-Tools"
      meta="780 installs · ★ 4.9 (11 ratings) · Updated 5 months ago"
      body="Convert, merge, split and clean up documents, Pro. Handles PDFs, Word files, slides and scanned pages, and keeps your original formatting intact."
    />
  );
  const cards: ReactNode[] = parameters.docOrder === 'plus-first' ? [plus, original] : [original, plus];

  return (
    <Stack gap="md">
      <Text>Now imagine you need an add-on that cleans up and converts documents, and you search a marketplace for one. These are the first two results.</Text>
      <Box className="doc-pair">{cards}</Box>
    </Stack>
  );
}
