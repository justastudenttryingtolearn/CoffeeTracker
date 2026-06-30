export interface Member {
  id: number;
  name: string;
  createdAt: string;
}

export interface Purchase {
  id: number;
  memberId: number;
  memberName: string;
  note: string | null;
  createdAt: string;
}

export interface StatusResponse {
  lastBuyer: Member | null;
  nextBuyer: Member | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
