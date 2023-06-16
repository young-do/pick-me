import { create } from "zustand";

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
  selectedPosition: User["position"];
  selectedJoinedTeam: string;
  selectedRound: number;
  selectedTeamId: Team["id"];
  initByFile: (file: File) => void;
  setUsers: (users: User[]) => void;
  setTeams: (teams: Team[]) => void;
  setSelectedTeamId: (teamId: Team["id"]) => void;
  setSelectedPosition: (position: User["position"]) => void;
  setSelectedJoinedTeam: (joinedTeam: string) => void;
  setSelectedRound: (round: number) => void;
  pick: (userId: User["id"]) => void;
  unpick: (userId: User["id"]) => void;
};

export const useGame = create<UseGame>((set, get) => ({
  users: [],
  positions: [],
  maxRound: 0,
  teams: [],
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
      const sortUser = (a: User, b: User) => {
        if (a.position === b.position) {
          return a.name.localeCompare(b.name);
        }
        return a.position.localeCompare(b.position);
      };

      content.forEach((line) => {
        const [name, position, ...choices] = line.split("\t");
        const trimmedChoices = choices.map(trim);

        users.push({
          id: Math.random().toString(36).substr(2, 9),
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

      const positions = [...new Set(users.map((user) => user.position))].sort(
        (a, b) => a.localeCompare(b)
      );
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
  setUsers: (users: User[]) => {
    const positions = [...new Set(users.map((user) => user.position))].sort(
      (a, b) => a.localeCompare(b)
    );
    const maxRound = users
      .map((user) => user.choices.length)
      .reduce((a, b) => Math.max(a, b), 0);

    set({ users, positions, maxRound });
  },
  setTeams: (teams: Team[]) => {
    set({ teams });
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
}));

useGame.subscribe(console.log);
