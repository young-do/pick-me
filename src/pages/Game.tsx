import { useMemo, useState } from "react";
import { Team, User, useGame } from "../store/useGame";
import {
  Box,
  Button,
  HStack,
  Select,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Input,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  ModalFooter,
} from "@chakra-ui/react";
import { generateId } from "../utils/id";
import { FlipCard } from "../components/FlipCard";

// 각 라운드마다 팀이 돌아가면서 유저를 0~n명 선택할 수 있다.
export const GamePage = () => {
  const {
    users,
    positions,
    teams,
    maxRound,
    started,
    selectedPosition,
    selectedJoinedTeam,
    selectedRound,
    selectedTeamId,
    setSelectedPosition,
    setSelectedJoinedTeam,
    setSelectedRound,
    setSelectedTeamId,
    pick,
    unpick,
  } = useGame();

  const filteredUsers = useMemo(
    () =>
      users
        .filter((user) => {
          if (selectedPosition === "") return true;
          return user.position.includes(selectedPosition);
        })
        .filter((user) => {
          if (selectedJoinedTeam === "selected")
            return user.joined_team_id !== null;
          if (selectedJoinedTeam === "not-selected")
            return user.joined_team_id === null;
          return true;
        })
        .filter((user) => {
          if (selectedRound === -1) return true;
          return user.choices[selectedRound] === selectedTeamId;
        }),
    [selectedJoinedTeam, selectedPosition, selectedRound, selectedTeamId, users]
  );

  const teamMembers = useMemo(() => {
    return users.filter((user) => user.joined_team_id === selectedTeamId);
  }, [selectedTeamId, users]);

  const allMemberByTeam = useMemo(() => {
    const allMemberByTeam: Record<Team["id"], User[]> = {};
    teams.forEach((team) => {
      allMemberByTeam[team.id] = users.filter(
        (user) => user.joined_team_id === team.id
      );
    });
    allMemberByTeam["아직 속하지 않은 사람들"] = users.filter(
      (user) => user.joined_team_id === null
    );

    return Object.entries(allMemberByTeam);
  }, [teams, users]);

  return (
    <>
      <Flex flexDirection={"column"} width={"100vw"} minHeight={"100vh"}>
        <SetupBox />

        <HStack flex="1" alignItems={"flex-start"}>
          <Box flex="1" padding={2}>
            <HStack>
              <Select
                value={selectedPosition}
                isDisabled={!started}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                <option value={""}>모든 포지션</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </Select>
              <Select
                value={selectedJoinedTeam}
                isDisabled={!started}
                onChange={(e) => setSelectedJoinedTeam(e.target.value)}
              >
                <option value={""}>모든 사람</option>
                <option value={"selected"}>선택된 사람</option>
                <option value={"not-selected"}>선택되지 않은 사람</option>
              </Select>
              <Select
                value={selectedRound}
                isDisabled={!started}
                onChange={(e) => setSelectedRound(+e.target.value)}
              >
                <option value={-1}>모든 지망</option>
                {Array.from({ length: maxRound }).map((_, i) => (
                  <option key={i} value={i}>
                    {i + 1}번째 지망
                  </option>
                ))}
              </Select>
            </HStack>

            <Heading size="md" margin="16px 0">
              유저 목록
            </Heading>

            <HStack flexWrap={"wrap"}>
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  teamId={selectedTeamId}
                  onPick={() => pick(user.id)}
                  onUnpick={() => unpick(user.id)}
                />
              ))}
            </HStack>
          </Box>

          <Box width={"320px"} padding={2}>
            <Select
              value={selectedTeamId}
              isDisabled={!started}
              onChange={(e) => setSelectedTeamId(e.target.value)}
            >
              <option value={""}>팀 선택</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
            <Heading size="md" margin="16px 0">
              선택한 팀원
            </Heading>
            <HStack flexWrap={"wrap"}>
              {teamMembers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  teamId={selectedTeamId}
                  onPick={() => pick(user.id)}
                  onUnpick={() => unpick(user.id)}
                />
              ))}
            </HStack>
          </Box>
        </HStack>
      </Flex>

      <Box padding={2}>
        <Heading size="md">팀 빌딩 현황</Heading>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th minW={300}>팀 이름</Th>
              <Th>멤버 이름</Th>
              <Th minW={120}>
                인원 수<br />
                {`(총 ${users.length}명)`}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {allMemberByTeam.map(([teamName, users]) => (
              <Tr key={teamName}>
                <Td>{teamName}</Td>
                <Td>
                  {users
                    .map(
                      (user) =>
                        `${user.name}/${user.position}/${
                          user.choices.findIndex((c) => c === teamName) + 1
                        }순위`
                    )
                    .join(", ")}
                </Td>
                <Td>{users.length}명</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

type UserCardProps = {
  user: User;
  teamId?: Team["id"];
  onPick?: () => void;
  onUnpick?: () => void;
};

const UserCard = ({ user, teamId, onPick, onUnpick }: UserCardProps) => {
  const picked = user.joined_team_id === teamId;

  return (
    <FlipCard
      front={
        <>
          <Text fontSize="md">{user.name}</Text>
          <Text fontSize="sm">{user.position}</Text>
          <Button
            size="sm"
            isDisabled={!teamId}
            onClick={picked ? onUnpick : onPick}
          >
            {picked ? "unpick" : "pick"}
          </Button>
        </>
      }
      back={<div>뒷면입니다 😘</div>}
    />
  );
};

const SetupBox = () => {
  const { users, started, initByFile, start, next, reset } = useGame();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const notInitialized = users.length === 0;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      initByFile(file);
    }
  };
  const handleReset = () => {
    confirm("정말로 초기화 하시겠습니까?") && reset();
  };

  return (
    <HStack padding="8px">
      <Button
        isDisabled={notInitialized}
        colorScheme={"red"}
        onClick={handleReset}
      >
        초기화
      </Button>
      <Input type="file" accept=".tsv" onChange={handleFile} />
      <Button isDisabled={notInitialized} onClick={onOpen}>
        새 유저 추가
      </Button>
      <Button isDisabled={notInitialized} onClick={started ? next : start}>
        {started ? "다음" : "시작하기"}
      </Button>
      <AddUserModal isOpen={isOpen} onClose={onClose} />
    </HStack>
  );
};

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const defaultInputs: Omit<User, "id"> = {
  name: "",
  position: "",
  choices: [],
  joined_team_id: null,
};

const AddUserModal = ({ isOpen, onClose }: AddUserModalProps) => {
  const { positions, teams, addUser } = useGame();
  const [inputs, setInputs] = useState<Omit<User, "id">>(defaultInputs);
  const { name, position, choices, joined_team_id } = inputs;
  const canBeAdded = name !== "" && position !== "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };
  const add = () => {
    if (!canBeAdded) return;

    const user: User = {
      id: generateId(),
      name,
      position,
      choices,
      joined_team_id,
    };
    addUser(user);
    setInputs(defaultInputs);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>새 유저 추가</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems={"flex-start"}>
            <Input
              value={name}
              name="name"
              onChange={handleChange}
              autoComplete="off"
              placeholder="이름 입력"
            />

            <Select
              value={position ?? ""}
              name="position"
              onChange={handleChange}
            >
              <option value={""}>포지션 선택</option>
              {positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </Select>

            <Select
              value={joined_team_id ?? ""}
              name="joined_team_id"
              onChange={handleChange}
            >
              <option value={""}>팀 선택</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>

            <Text textAlign={"left"}>* 희망하는 팀 입력은 불가합니다.</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button isDisabled={!canBeAdded} colorScheme="blue" onClick={add}>
            추가하기
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
