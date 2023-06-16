import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId } from "../utils/id";

export type User = {
  id: string;
  name: string;
  position: string;
  choices: Team["id"][];
  joined_team_id?: string | null;
};
export type Team = {
  id: string;
  name: string;
};
export type UseGame = {
  users: User[];
  positions: User["position"][];
  maxRound: number;
  teams: Team[];
  started: boolean;
  selectedPosition: User["position"];
  selectedJoinedTeam: string;
  selectedRound: number;
  selectedTeamId: Team["id"];
  initByFile: (file: File) => void;
  addUser: (user: User) => void;
  removeUser: (userId: User["id"]) => void;
  setSelectedTeamId: (teamId: Team["id"]) => void;
  setSelectedPosition: (position: User["position"]) => void;
  setSelectedJoinedTeam: (joinedTeam: string) => void;
  setSelectedRound: (round: number) => void;
  start: () => void;
  next: () => void;
  pick: (userId: User["id"]) => void;
  unpick: (userId: User["id"]) => void;
  reset: () => void;
};

export const useGame = create(
  persist<UseGame>(
    (set, get) => ({
      users: [],
      positions: [],
      maxRound: 0,
      teams: [],
      started: false,
      selectedTeamId: "",
      selectedPosition: "",
      selectedJoinedTeam: "",
      selectedRound: -1,
      initByFile: (file: File) => {
        const reader = new FileReader();

        reader.onload = () => {
          const { result } = reader;
          const [, ...content] = (result as string).split("\r\n");
          const users: User[] = [];
          const choiceSet = new Set<string>();

          const trim = (str: string) => {
            return str.trim().replace(/\s+/g, " ").replace(/"/g, "");
          };

          content.forEach((line) => {
            const [name, position, ...choices] = line.split("\t");
            const trimmedChoices = choices.map(trim);

            users.push({
              id: generateId(),
              name,
              position: trim(position),
              choices: trimmedChoices,
              joined_team_id: null,
            });
            trimmedChoices.forEach((choice) => choiceSet.add(choice));
          });
          const teams: Team[] = [...choiceSet]
            .map((choice) => ({
              id: choice,
              name: choice,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          const positions = [
            ...new Set(users.map((user) => user.position)),
          ].sort((a, b) => a.localeCompare(b));
          const maxRound = users
            .map((user) => user.choices.length)
            .reduce((a, b) => Math.max(a, b), 0);

          set({
            users: users.sort(sortUser),
            positions,
            maxRound,
            teams,
          });
        };
        reader.readAsText(file);
      },
      addUser: (user: User) => {
        const { users } = get();
        users.push(user);
        set({ users: users.slice() });
      },
      removeUser: (userId: User["id"]) => {
        const { users } = get();
        set({ users: users.filter((user) => user.id !== userId) });
      },
      setSelectedTeamId: (teamId: Team["id"]) => {
        set({ selectedTeamId: teamId });
      },
      setSelectedPosition: (position: User["position"]) => {
        set({ selectedPosition: position });
      },
      setSelectedJoinedTeam: (joinedTeam: string) => {
        set({ selectedJoinedTeam: joinedTeam });
      },
      setSelectedRound: (round: number) => {
        set({ selectedRound: round });
      },
      start: () => {
        set({
          started: true,
          selectedTeamId: get().teams[0].id,
          selectedRound: 0,
          selectedJoinedTeam: "not-selected",
        });
      },
      next: () => {
        const { teams, selectedTeamId, selectedRound, maxRound } = get();
        const currIndex = teams.findIndex((team) => team.id === selectedTeamId);
        const nextIndex = currIndex + 1;

        if (nextIndex >= teams.length) {
          const nextRound = selectedRound + 1;

          if (nextRound === maxRound) {
            // 끝
            alert("끝");
          } else {
            // 다음 라운드
            set({ selectedRound: nextRound, selectedTeamId: teams[0].id });
          }
        } else {
          // 다음 팀으로
          set({ selectedTeamId: teams[nextIndex].id });
        }
      },
      pick: (userId: User["id"]) => {
        const { users, selectedTeamId } = get();
        const user = users.find((user) => user.id === userId);

        if (user) {
          user.joined_team_id = selectedTeamId;
          set({ users: users.slice() });
        }
      },
      unpick: (userId: User["id"]) => {
        const users = get().users;
        const user = users.find((user) => user.id === userId);

        if (user) {
          user.joined_team_id = null;
          set({ users: users.slice() });
        }
      },
      reset: () => {
        set({
          users: [],
          positions: [],
          maxRound: 0,
          teams: [],
          started: false,
          selectedTeamId: "",
          selectedPosition: "",
          selectedJoinedTeam: "",
          selectedRound: -1,
        });
      },
    }),
    {
      name: "useGame",
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

useGame.subscribe(console.log);

const sortUser = (a: User, b: User) => {
  if (a.position === b.position) {
    return a.name.localeCompare(b.name);
  }
  return a.position.localeCompare(b.position);
};
