import * as t from "./actionTypes";

export type State = {
  readonly isFetching: boolean;
  readonly error: string | undefined;
  readonly guides: any | undefined;
  readonly geneIds: Array<string>;
  readonly celllines: Array<string>;
};

const INITIAL_STATE: State = {
  isFetching: false,
  error: undefined,
  guides: undefined,
  geneIds: [],
  celllines: []
};

export default (state: State = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case t.FETCH_KNOCKOUTS:
      return { ...state, isFetching: true, error: undefined };
    case t.FETCH_KNOCKOUTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        error: undefined,
        guides: action.data
      };
    case t.FETCH_KNOCKOUTS_FAILURE:
      return { ...state, isFetching: false, error: action.error };
    case t.INITIAL_LOAD:
      return { ...state, isFetching: true, error: undefined };
    case t.INITIAL_LOAD_SUCCESS:
      return {
        ...state,
        isFetching: false,
        error: undefined,
        geneIds: action.geneIds,
        celllines: action.celllines
      };
    default:
      return state;
  }
};
