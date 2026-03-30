import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ProjectState {
  code: string;
  name: string;
}

const initialState: ProjectState = {
  code: '',
  name: '',
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjectCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    setProjectName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    clearProject() {
      return initialState;
    },
  },
});

export const { setProjectCode, setProjectName, clearProject } =
  projectSlice.actions;

export default projectSlice.reducer;
