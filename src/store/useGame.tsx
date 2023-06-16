import { create } from "zustand";

type User = {
  id: string;
  name: string;
  position: string;
  choices: Team["id"][];
  joined_team_id?: string | null;
};
type Team = {
  id: string;
  name: string;
};

type UseGame = {
  users: User[];
  teams: Team[];
  round: number;
  setUsers: (users: User[]) => void;
};

export const useGame = create((set, get) => ({
  users: [] as User[],
  teams: [] as Team[],
  round: 1,
  setUsers: (users: User[]) => {
    set({ users });
  },
  setTeams: (teams: Team[]) => {
    set({ teams });
  },
  setRound: (round: number) => {
    set({ round });
  },
  pick: (teamId: Team["id"], userIds: User["id"][]) => {
    const teams = get().team;
    //
    // set({ users })
  },
  unpick: (teamId: Team["id"], userIds: User["id"][]) => {
    //
    // set({ users })
  },
}));
