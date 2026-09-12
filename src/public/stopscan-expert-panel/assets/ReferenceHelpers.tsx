import { useEffect, useState } from 'react';
import {
  Box, Button, Divider, Group, Modal, Stack, Text,
} from '@mantine/core';
import {
  IconBook2,
  IconSearch,
  IconShieldExclamation,
} from '@tabler/icons-react';
import { REFERENCE_CARDS, STOPSCAN_OVERVIEW } from './content';
import { StopscanCoverage, StopscanElements, StopscanOutcomeModel } from './StopscanModelSummary';

type ModalId = 'stopscan' | 'sift' | 'detector';

type ReferenceHelpersProps = {
  onLog: (type: 'modal_open' | 'modal_close', id: string) => void;
  onReady?: () => void;
  compact?: boolean;
};

export function ReferenceHelpers({ onLog, onReady, compact = false }: ReferenceHelpersProps) {
  const [opened, setOpened] = useState<ModalId | null>(null);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const openModal = (id: ModalId) => {
    setOpened(id);
    onLog('modal_open', id);
  };

  const closeModal = () => {
    if (opened) {
      onLog('modal_close', opened);
    }
    setOpened(null);
  };

  return (
    <>
      <Box
        mb="md"
        p={compact ? 'sm' : 'md'}
        style={{
          background: 'linear-gradient(135deg, #f7fafc 0%, #eef5f8 100%)',
          border: '1px solid #d7e2ea',
          borderRadius: 10,
        }}
      >
        <Text size="sm" c="dimmed" mb={8}>
          For your reference
        </Text>
        <Group gap="xs" wrap="wrap">
          <Button
            variant="light"
            color="teal"
            size="xs"
            leftSection={<IconBook2 size={14} />}
            onClick={() => openModal('stopscan')}
          >
            STOP&SCAN summary
          </Button>
          <Button
            variant="light"
            color="blue"
            size="xs"
            leftSection={<IconSearch size={14} />}
            onClick={() => openModal('sift')}
          >
            SIFT summary
          </Button>
          <Button
            variant="light"
            color="orange"
            size="xs"
            leftSection={<IconShieldExclamation size={14} />}
            onClick={() => openModal('detector')}
          >
            Detection and provenance tools
          </Button>
        </Group>
      </Box>

      <Modal
        opened={opened === 'stopscan'}
        onClose={closeModal}
        title="STOP&SCAN"
        size="lg"
        centered
      >
        <Stack gap="md">
          <Text size="sm">{STOPSCAN_OVERVIEW.intro}</Text>
          <StopscanElements compact />
          <Divider />
          <StopscanOutcomeModel />
          <StopscanCoverage />
        </Stack>
      </Modal>

      <Modal
        opened={opened === 'sift'}
        onClose={closeModal}
        title={REFERENCE_CARDS.sift.title}
        size="lg"
        centered
      >
        <Text size="sm">{REFERENCE_CARDS.sift.body}</Text>
      </Modal>

      <Modal
        opened={opened === 'detector'}
        onClose={closeModal}
        title={REFERENCE_CARDS.detector.title}
        size="lg"
        centered
      >
        <Text size="sm">{REFERENCE_CARDS.detector.body}</Text>
      </Modal>
    </>
  );
}
