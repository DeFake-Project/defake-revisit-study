import { Box, Text, Title } from '@mantine/core';
import { ReactNode } from 'react';
import { PREFIX } from '../../../utils/Prefix';
import { SS, StepIconName } from './theme';

export type IconName =
  | 'list'
  | 'users'
  | 'clock'
  | 'shield'
  | 'book'
  | 'clipboard'
  | 'badge'
  | 'spark'
  | 'route'
  | 'message'
  | 'search'
  | 'check';

const ICON_PATHS: Record<IconName, ReactNode> = {
  list: (
    <>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />,
  book: (
    <>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </>
  ),
  clipboard: (
    <>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  badge: (
    <>
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  spark: <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />,
  route: (
    <>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

export function IconTile({
  children,
  tile,
  size = 52,
}: {
  children: ReactNode;
  tile: string;
  size?: number;
}) {
  return (
    <Box
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        background: tile,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
      }}
    >
      {children}
    </Box>
  );
}

export function StepIcon({ name, tile }: { name: StepIconName; tile: string }) {
  return (
    <IconTile tile={tile}>
      <img
        src={`${PREFIX}stopscan-expert-panel-round2/assets/icons/${name}.png`}
        alt=""
        width={34}
        height={34}
        style={{
          background: SS.white,
          borderRadius: 8,
          objectFit: 'contain',
        }}
      />
    </IconTile>
  );
}

const PAGE_ICONS: Record<string, IconName> = {
  intro: 'users',
  run: 'route',
  about: 'users',
  original: 'book',
  acknowledgment: 'badge',
  review: 'clipboard',
};

export function StudyHeading({
  eyebrow,
  title,
  icon,
  tile = SS.primary,
  step,
}: {
  eyebrow?: string;
  title: string;
  icon?: IconName;
  tile?: string;
  step?: StepIconName;
}) {
  const glyph = step
    ? <StepIcon name={step} tile={tile} />
    : <IconTile tile={tile}><Icon name={icon || PAGE_ICONS.intro} /></IconTile>;

  return (
    <Box style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      {glyph}
      <div>
        {eyebrow ? (
          <Text size="xs" tt="uppercase" fw={700} c={SS.primary} style={{ letterSpacing: '0.05em' }}>{eyebrow}</Text>
        ) : null}
        <Title order={2} mt={eyebrow ? 4 : 0} c={SS.ink} style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</Title>
      </div>
    </Box>
  );
}
