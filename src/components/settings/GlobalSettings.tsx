import {
  Card, Container, Text, LoadingOverlay, Box, Title, Flex, Modal, TextInput, Button, Tooltip, ActionIcon, Select, MultiSelect, Badge, Stack,
} from '@mantine/core';
import { useForm, isEmail } from '@mantine/form';
import { useEffect, useMemo, useState } from 'react';
import {
  IconAt, IconPencil, IconTrashX, IconUserPlus,
} from '@tabler/icons-react';
import { useAuth } from '../../store/hooks/useAuth';
import { useStorageEngine } from '../../storage/storageEngineHooks';
import { AppRole, StoredUser } from '../../storage/engines/types';
import { signIn } from '../../Login';
import { isCloudStorageEngine } from '../../storage/engines/utils/storageEngineHelpers';
import { SupabaseStorageEngine } from '../../storage/engines/SupabaseStorageEngine';
import { showNotification } from '../../utils/notifications';
import {
  APP_ROLE_DESCRIPTIONS,
  APP_ROLE_LABELS,
  APP_ROLES,
  isLastAdmin,
  normalizeStudyIds,
  normalizeUserRole,
} from '../../utils/userPermissions';

const ROLE_OPTIONS = APP_ROLES.map((role) => ({
  value: role,
  label: APP_ROLE_LABELS[role],
}));

function getRoleBadgeColor(role: AppRole) {
  if (role === 'admin') {
    return 'blue';
  }
  if (role === 'studyManager') {
    return 'teal';
  }
  return 'gray';
}

function getAssignedStudiesLabel(role: AppRole, assignedStudies: string[]) {
  if (role === 'admin') {
    return 'All studies';
  }
  if (assignedStudies.length > 0) {
    return assignedStudies.join(', ');
  }
  return 'No studies assigned';
}

function UserRoleBadge({ role }: { role: AppRole }) {
  return <Badge color={getRoleBadgeColor(role)} variant="light">{APP_ROLE_LABELS[role]}</Badge>;
}

export function GlobalSettings({ studyIds }: { studyIds: string[] }) {
  const { user, triggerAuth, logout } = useAuth();
  const { storageEngine } = useStorageEngine();

  const [isAuthEnabled, setAuthEnabled] = useState<boolean>(false);
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalAddOpened, setModalAddOpened] = useState<boolean>(false);
  const [modalEditOpened, setModalEditOpened] = useState<boolean>(false);
  const [modalRemoveOpened, setModalRemoveOpened] = useState<boolean>(false);
  const [modalEnableAuthOpened, setModalEnableAuthOpened] = useState<boolean>(false);
  const [modalEnableAuthErrorOpened, setModalEnableAuthErrorOpened] = useState<boolean>(false);
  const [userToRemove, setUserToRemove] = useState<string>('');
  const [userToEdit, setUserToEdit] = useState<StoredUser | null>(null);
  const [enableAuthUser, setEnableAuthUser] = useState<StoredUser | null>(null);

  const addForm = useForm({
    initialValues: {
      email: '',
      role: 'studyManager' as AppRole,
      studyIds: [] as string[],
    },
    validate: {
      email: isEmail('Invalid email'),
      studyIds: (value, values) => (values.role === 'admin' || value.length > 0 ? null : 'Select at least one study'),
    },
  });

  const editForm = useForm({
    initialValues: {
      role: 'studyManager' as AppRole,
      studyIds: [] as string[],
    },
    validate: {
      studyIds: (value, values) => (values.role === 'admin' || value.length > 0 ? null : 'Select at least one study'),
    },
  });

  const refreshUsers = async () => {
    if (storageEngine && isCloudStorageEngine(storageEngine)) {
      const users = await storageEngine.getAppUsers();
      setStoredUsers(users);
    }
  };

  useEffect(() => {
    const determineAuthenticationEnabled = async () => {
      setLoading(true);
      if (storageEngine && isCloudStorageEngine(storageEngine)) {
        const authInfo = await storageEngine?.getUserManagementData('authentication');
        setAuthEnabled(authInfo?.isEnabled || false);
        await refreshUsers();
      } else {
        setAuthEnabled(false);
      }
      setLoading(false);
    };
    determineAuthenticationEnabled();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageEngine]);

  const handleEnableAuth = async () => {
    setLoading(true);
    if (storageEngine && isCloudStorageEngine(storageEngine)) {
      // Check if we're in supabase and have a session already
      if (storageEngine.getEngine() === 'supabase') {
        const { data } = await (storageEngine as unknown as SupabaseStorageEngine).getSession();
        if (data.session && data.session.user && data.session.user.email) {
          setEnableAuthUser({
            email: data.session.user.email,
            uid: data.session.user.id,
            role: 'admin',
          });
          setModalEnableAuthOpened(true);
          setLoading(false);
          return;
        }
      }

      const newUser = await signIn(storageEngine, setLoading);
      if (newUser && newUser.email) {
        setEnableAuthUser({
          email: newUser.email,
          uid: newUser.uid,
          role: 'admin',
        });
        setModalEnableAuthOpened(true);
      } else {
        setModalEnableAuthErrorOpened(true);
      }
    }
    setLoading(false);
  };

  const confirmEnableAuth = async (rootUser: StoredUser | null) => {
    setLoading(true);
    if (storageEngine && isCloudStorageEngine(storageEngine)) {
      if (rootUser) {
        await storageEngine.changeAuth(true);
        await storageEngine.addAdminUser({ ...rootUser, role: 'admin' });
        await refreshUsers();
        setAuthEnabled(true);
        triggerAuth();
      }
    }
    setModalEnableAuthOpened(false);
    setLoading(false);
  };

  const handleAddUser = async () => {
    setLoading(true);
    if (storageEngine && isCloudStorageEngine(storageEngine)) {
      await storageEngine.addAppUser({
        email: addForm.values.email,
        uid: null,
        role: addForm.values.role,
        studyIds: addForm.values.role === 'admin' ? [] : addForm.values.studyIds,
      });
      await refreshUsers();
    }
    setLoading(false);
    setModalAddOpened(false);
    addForm.reset();
  };

  const openEditUser = (storedUser: StoredUser) => {
    const role = normalizeUserRole(storedUser);
    setUserToEdit(storedUser);
    editForm.setValues({
      role,
      studyIds: normalizeStudyIds({ ...storedUser, role }),
    });
    setModalEditOpened(true);
  };

  const handleEditUser = async () => {
    if (!userToEdit?.email || !storageEngine || !isCloudStorageEngine(storageEngine)) {
      return;
    }
    setLoading(true);
    try {
      await storageEngine.updateAppUser(userToEdit.email, {
        role: editForm.values.role,
        studyIds: editForm.values.role === 'admin' ? [] : editForm.values.studyIds,
      });
      await refreshUsers();
      setModalEditOpened(false);
      setUserToEdit(null);
    } catch (error) {
      showNotification({
        title: 'Could not update user',
        message: error instanceof Error ? error.message : 'Failed to update user permissions.',
        color: 'red',
      });
    }
    setLoading(false);
  };

  const handleRemoveUser = (inputUser: string) => {
    setModalRemoveOpened(true);
    setUserToRemove(inputUser);
  };

  const confirmRemoveUser = async () => {
    setLoading(true);
    if (storageEngine && isCloudStorageEngine(storageEngine)) {
      try {
        await storageEngine.removeAppUser(userToRemove);
        await refreshUsers();
      } catch (error) {
        showNotification({
          title: 'Could not remove user',
          message: error instanceof Error ? error.message : 'Failed to remove user.',
          color: 'red',
        });
      }
    }
    setModalRemoveOpened(false);
    setLoading(false);
  };

  const storageEngineIsCloud = useMemo(() => storageEngine && isCloudStorageEngine(storageEngine), [storageEngine]);
  const studyOptions = useMemo(() => studyIds.map((studyId) => ({ value: studyId, label: studyId })), [studyIds]);

  const renderRoleFields = (
    role: AppRole,
    onRoleChange: (nextRole: AppRole) => void,
    selectedStudyIds: string[],
    onStudyIdsChange: (nextStudyIds: string[]) => void,
  ) => (
    <Stack mt="md">
      <Select
        label="Role"
        data={ROLE_OPTIONS}
        value={role}
        onChange={(value) => {
          if (value) {
            onRoleChange(value as AppRole);
          }
        }}
        allowDeselect={false}
      />
      <Text size="sm" c="dimmed">{APP_ROLE_DESCRIPTIONS[role]}</Text>
      {role !== 'admin' && (
        <MultiSelect
          label="Assigned studies"
          placeholder="Select studies"
          data={studyOptions}
          value={selectedStudyIds}
          onChange={onStudyIdsChange}
          searchable
        />
      )}
    </Stack>
  );

  return (
    <>
      <Container>
        <Card withBorder style={{ backgroundColor: '#FAFAFA' }}>
          <Title mb={20} order={3}>Authentication</Title>
          {isAuthEnabled
            ? <Flex><Text>Authentication is enabled.</Text></Flex>
            : (
              <Flex justify="space-between">
                <Box>
                  <Text>Authentication is currently disabled.</Text>
                </Box>
                <Tooltip label="You can only enable auth when using a cloud storage engine (Firebase/Supabase)" disabled={storageEngineIsCloud}>
                  <Button
                    onClick={(event) => (!storageEngineIsCloud ? event.preventDefault() : handleEnableAuth())}
                    color="green"
                    data-disabled={!storageEngineIsCloud ? true : undefined}
                    style={{ '&[dataDisabled]': { pointerEvents: 'all' } }}
                  >
                    Enable Authentication
                  </Button>
                </Tooltip>
              </Flex>
            )}
          {isAuthEnabled
            ? (
              <Flex mt={40} direction="column">
                <Flex style={{ borderBottom: '1px solid #dedede' }} direction="row" justify="space-between" mb={15} pb={15}>
                  <Title order={6}>Users</Title>
                  <IconUserPlus style={{ cursor: 'pointer' }} onClick={() => setModalAddOpened(true)} />
                </Flex>
                {storedUsers.length > 0 ? storedUsers.map(
                  (storedUser: StoredUser) => {
                    const role = normalizeUserRole(storedUser);
                    const assignedStudies = normalizeStudyIds({ ...storedUser, role });
                    const email = storedUser.email || '';
                    const isCurrentUser = email === user.user?.email;
                    const lastAdmin = isLastAdmin(storedUsers, email);
                    return (
                      <Flex key={email} justify="space-between" mb={10} gap="md" align="center">
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Flex gap="sm" align="center">
                            <Text>{email}</Text>
                            <UserRoleBadge role={role} />
                            {isCurrentUser ? <Text c="blue" size="xs">You</Text> : null}
                          </Flex>
                          <Text size="xs" c="dimmed">
                            {getAssignedStudiesLabel(role, assignedStudies)}
                          </Text>
                        </Stack>
                        {!isCurrentUser && (
                          <Flex gap={4}>
                            <ActionIcon variant="subtle" onClick={() => openEditUser(storedUser)}>
                              <IconPencil />
                            </ActionIcon>
                            <Tooltip label="The last admin cannot be removed" disabled={!lastAdmin}>
                              <ActionIcon variant="subtle" disabled={lastAdmin} onClick={() => handleRemoveUser(email)}>
                                <IconTrashX color={lastAdmin ? 'gray' : 'red'} />
                              </ActionIcon>
                            </Tooltip>
                          </Flex>
                        )}
                      </Flex>
                    );
                  },
                ) : null}
                <Flex direction="row" justify="left">
                  <Button
                    onClick={() => logout()}
                    mt={20}
                  >
                    Log out
                  </Button>
                </Flex>
              </Flex>
            )
            : null}
        </Card>
      </Container>
      <Modal
        opened={modalAddOpened}
        onClose={() => setModalAddOpened(false)}
        title="Add User"
      >
        <Box component="form" onSubmit={(addForm.onSubmit(() => handleAddUser()))}>
          <TextInput
            leftSection={<IconAt />}
            placeholder="User Email Address"
            {...addForm.getInputProps('email')}
          />
          {renderRoleFields(
            addForm.values.role,
            (nextRole) => addForm.setFieldValue('role', nextRole),
            addForm.values.studyIds,
            (nextStudyIds) => addForm.setFieldValue('studyIds', nextStudyIds),
          )}
          {addForm.errors.studyIds && (
            <Text size="sm" c="red" mt={6}>{addForm.errors.studyIds}</Text>
          )}
          <Flex mt={30} justify="right">
            <Button mr={5} variant="subtle" color="red" onClick={() => setModalAddOpened(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </Flex>
        </Box>
      </Modal>
      <Modal
        opened={modalEditOpened}
        onClose={() => setModalEditOpened(false)}
        title={`Edit ${userToEdit?.email || 'user'}`}
      >
        <Box component="form" onSubmit={(editForm.onSubmit(() => handleEditUser()))}>
          {renderRoleFields(
            editForm.values.role,
            (nextRole) => editForm.setFieldValue('role', nextRole),
            editForm.values.studyIds,
            (nextStudyIds) => editForm.setFieldValue('studyIds', nextStudyIds),
          )}
          {editForm.errors.studyIds && (
            <Text size="sm" c="red" mt={6}>{editForm.errors.studyIds}</Text>
          )}
          <Flex mt={30} justify="right">
            <Button mr={5} variant="subtle" color="red" onClick={() => setModalEditOpened(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </Flex>
        </Box>
      </Modal>
      <Modal
        opened={modalRemoveOpened}
        size="large"
        onClose={() => setModalRemoveOpened(false)}
        title={(
          <Text fw={700}>
            Remove
            {userToRemove}
            ?
          </Text>
        )}
      >
        <Text mt={40}>
          Are you sure you want to remove
          {' '}
          <b>{userToRemove}</b>
          ?
        </Text>
        <Flex mt={40} justify="right">
          <Button mr={5} variant="subtle" color="red" onClick={() => setModalRemoveOpened(false)}>
            Cancel
          </Button>
          <Button onClick={() => confirmRemoveUser()}>
            Yes, I&apos;m sure.
          </Button>

        </Flex>
      </Modal>
      <Modal
        opened={modalEnableAuthOpened}
        size="md"
        onClose={() => setModalEnableAuthOpened(false)}
        title={(
          <Text fw={700}>
            Enable Authentication?
          </Text>
        )}
      >
        <Text mt={40}>
          User
          {' '}
          <b>{enableAuthUser?.email}</b>
          {' '}
          will be added as an administrator to this application. After enabling authentication, you&apos;ll be able to add additional users below. This action cannot be undone.
        </Text>
        <Flex mt={40} justify="right">
          <Button mr={5} variant="subtle" color="red" onClick={() => setModalEnableAuthOpened(false)}>
            Cancel
          </Button>
          <Button onClick={() => confirmEnableAuth(enableAuthUser)}>
            Yes, I&apos;m sure.
          </Button>

        </Flex>
      </Modal>

      <Modal
        opened={modalEnableAuthErrorOpened}
        size="md"
        onClose={() => setModalEnableAuthErrorOpened(false)}
        title={(
          <Text fw={700}>
            An Error Occurred.
          </Text>
        )}
      >
        <Text mt={40}>
          An error has occurred when trying to enable authentication. Please consult the
          {' '}
          <a href="https://revisit.dev/docs/data-and-deployment/firebase/enabling-authentication/" target="_blank" rel="noreferrer">documentation</a>
          {' '}
          for more information.
        </Text>
        <Flex mt={40} justify="right">
          <Button mr={5} onClick={() => setModalEnableAuthErrorOpened(false)}>
            Okay
          </Button>
        </Flex>
      </Modal>
      <LoadingOverlay visible={loading} />
    </>

  );
}
