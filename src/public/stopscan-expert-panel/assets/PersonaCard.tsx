import { Avatar, Box, Group, Text } from '@mantine/core';
import {
  CharacterPersona,
  SOCIAL_MEDIA_LABEL,
  TECH_SAVVINESS_LABEL,
  TraitLevel,
} from './content';

function avatarSrc(filename: string) {
  const base = import.meta.env.BASE_URL ?? '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}stopscan-expert-panel/assets/personas/${filename}`;
}

function TraitRow({
  label,
  level,
  gloss,
}: {
  label: string;
  level: TraitLevel;
  gloss: string;
}) {
  return (
    <Group gap={8} wrap="nowrap" justify="space-between">
      <Text size="xs" c="dimmed" lh={1.2}>{label}</Text>
      <Group gap={6} wrap="nowrap">
        <Group gap={3} wrap="nowrap">
          {([1, 2, 3] as TraitLevel[]).map((dot) => (
            <Box
              key={dot}
              w={7}
              h={7}
              style={{
                borderRadius: 99,
                background: dot <= level ? '#0f766e' : '#d7e2ea',
              }}
            />
          ))}
        </Group>
        <Text size="xs" fw={600} lh={1.2} style={{ minWidth: '5.6rem' }}>{gloss}</Text>
      </Group>
    </Group>
  );
}

export function PersonaCard({ character }: { character: CharacterPersona }) {
  return (
    <Group
      gap="sm"
      wrap="nowrap"
      px="sm"
      py={8}
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        background: '#fff',
        maxWidth: 360,
      }}
    >
      <Avatar
        src={avatarSrc(character.avatar)}
        alt={character.name}
        size={52}
        radius="xl"
        style={{ flexShrink: 0 }}
      />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text fw={700} size="sm" lh={1.2} mb={4}>{character.name}</Text>
        <StackTraits
          techSavviness={character.techSavviness}
          socialMedia={character.socialMedia}
        />
      </Box>
    </Group>
  );
}

function StackTraits({
  techSavviness,
  socialMedia,
}: {
  techSavviness: TraitLevel;
  socialMedia: TraitLevel;
}) {
  return (
    <Box>
      <TraitRow
        label="Tech savviness"
        level={techSavviness}
        gloss={TECH_SAVVINESS_LABEL[techSavviness]}
      />
      <TraitRow
        label="Social media"
        level={socialMedia}
        gloss={SOCIAL_MEDIA_LABEL[socialMedia]}
      />
    </Box>
  );
}
