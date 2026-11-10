import {
  ActionIcon,
  Flex, Image, Select, Title, Space, Grid, AppShell, Button, Text,
} from '@mantine/core';

import { useLocation, useNavigate, useParams } from 'react-router';

import { IconListCheck, IconSettings } from '@tabler/icons-react';
import { PREFIX } from '../../utils/Prefix';
import { useAuth } from '../../store/hooks/useAuth';
import { canManageUsers } from '../../utils/userPermissions';

const STUDY_SCHEMA_VERSION_REGEX = /\/study\/(v\d+\.\d+\.\d+)\//;

export function AppHeader({
  studyIds,
  selectedStudyId,
  studyHref,
  studyConfigs,
}: {
  studyIds: string[];
  selectedStudyId?: string;
  studyHref?: string;
  studyConfigs?: Record<string, { $schema: string } | null>;
}) {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const isSignedInAppUser = Boolean(user.role);
  const showSettings = !isSignedInAppUser || canManageUsers(user.role);
  const showSignIn = !user.determiningStatus && !isSignedInAppUser && !location.pathname.startsWith('/login');

  const selectorData = studyIds.map((id) => ({ value: id, label: id })).sort((a, b) => a.label.localeCompare(b.label));
  const revisitVersion = studyIds
    .map((id) => studyConfigs?.[id]?.$schema.match(STUDY_SCHEMA_VERSION_REGEX)?.[1])
    .filter((version): version is string => version !== undefined)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0];

  const inAnalysis = location.pathname.includes('analysis');

  return (
    <AppShell.Header p="md">
      <Grid mt={-7} align="center">
        <Grid.Col span={6}>
          <Flex align="center" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <Image w={40} src={`${PREFIX}revisitAssets/icon-defake.svg`} alt="DeFake Project Logo" />
            <Space w="md" />
            <Title order={4} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {inAnalysis ? 'DeFake Project Analytics Platform | Powered by ReVISit' : 'DeFake Project Studies | Powered by ReVISit'}
            </Title>
          </Flex>
        </Grid.Col>

        <Grid.Col span={6}>
          <Flex
            align="center"
            justify="flex-end"
            direction="row"
          >
            {inAnalysis && (
              <>
                <Select
                  allowDeselect={false}
                  placeholder="Select Study"
                  data={selectorData}
                  value={selectedStudyId ?? studyId}
                  onChange={(value) => navigate(`/analysis/stats/${value}`)}
                  mr={16}
                />
                <Button component="a" href={studyHref ?? `${PREFIX}${studyId}`} target="_blank" leftSection={<IconListCheck />} mr="sm">
                  Go to Study
                </Button>
              </>
            )}

            {revisitVersion && <Text c="dimmed" size="sm" mr="sm">{`reVISit ${revisitVersion}`}</Text>}

            {showSignIn && (
              <Button variant="subtle" onClick={() => navigate('/login')} mr="sm">
                Sign in
              </Button>
            )}

            {showSettings && (
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Settings"
                onClick={() => navigate('/settings')}
              >
                <IconSettings />
              </ActionIcon>
            )}
          </Flex>
        </Grid.Col>
      </Grid>
    </AppShell.Header>
  );
}
