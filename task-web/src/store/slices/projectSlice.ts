import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
interface TaskStatsSnapshot {
  due_date?: string | null;
  status?: {
    is_done: boolean;
  } | null;
}

type ProjectStatKey =
  | 'total_tasks'
  | 'completed_tasks'
  | 'overdue_tasks'
  | 'total_members';

type ProjectStats = Record<ProjectStatKey, number>;

const initialStats: ProjectStats = {
  total_tasks: 0,
  completed_tasks: 0,
  overdue_tasks: 0,
  total_members: 0,
};

const startOfToday = () => {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
};

const isTaskCompleted = (task: TaskStatsSnapshot | null | undefined): boolean =>
  Boolean(task?.status?.is_done);

const isTaskOverdue = (task: TaskStatsSnapshot | null | undefined): boolean => {
  if (!task?.due_date || isTaskCompleted(task)) {
    return false;
  }

  const dueDate = new Date(task.due_date);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  return dueDate < startOfToday();
};

interface ProjectState {
  code: string;
  name: string;
  stats: ProjectStats;
}

const initialState: ProjectState = {
  code: '',
  name: '',
  stats: initialStats,
};

interface SetProjectPayload {
  code: string;
  name?: string;
}

interface SetProjectStatsPayload {
  projectCode: string;
  stats: Partial<ProjectStats>;
}

interface UpdateProjectStatPayload {
  projectCode: string;
  key: ProjectStatKey;
  amount?: number;
}

interface UpdateStatsFromTaskPayload {
  projectCode: string;
  task: TaskStatsSnapshot;
}

interface UpdateStatsFromTaskTransitionPayload {
  projectCode: string;
  previousTask: TaskStatsSnapshot | null;
  nextTask: TaskStatsSnapshot;
}

const shouldApplyToCurrentProject = (
  state: ProjectState,
  projectCode: string,
): boolean => Boolean(projectCode) && state.code === projectCode;

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProject(state, action: PayloadAction<SetProjectPayload>) {
      const nextCode = action.payload.code;

      if (state.code !== nextCode) {
        state.stats = { ...initialStats };
      }

      state.code = nextCode;

      if (action.payload.name !== undefined) {
        state.name = action.payload.name;
      }
    },
    setProjectCode(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    setProjectName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setProjectStats(state, action: PayloadAction<SetProjectStatsPayload>) {
      const { projectCode, stats } = action.payload;

      if (!shouldApplyToCurrentProject(state, projectCode)) {
        return;
      }

      state.stats = {
        ...state.stats,
        ...stats,
      };
    },
    incrementProjectStat(
      state,
      action: PayloadAction<UpdateProjectStatPayload>,
    ) {
      const { projectCode, key, amount = 1 } = action.payload;

      if (!shouldApplyToCurrentProject(state, projectCode)) {
        return;
      }

      state.stats[key] += amount;
    },
    decrementProjectStat(
      state,
      action: PayloadAction<UpdateProjectStatPayload>,
    ) {
      const { projectCode, key, amount = 1 } = action.payload;

      if (!shouldApplyToCurrentProject(state, projectCode)) {
        return;
      }

      state.stats[key] = Math.max(0, state.stats[key] - amount);
    },
    applyTaskCreatedStats(
      state,
      action: PayloadAction<UpdateStatsFromTaskPayload>,
    ) {
      const { projectCode, task } = action.payload;

      if (!shouldApplyToCurrentProject(state, projectCode)) {
        return;
      }

      state.stats.total_tasks += 1;

      if (isTaskCompleted(task)) {
        state.stats.completed_tasks += 1;
      }

      if (isTaskOverdue(task)) {
        state.stats.overdue_tasks += 1;
      }
    },
    applyTaskDeletedStats(
      state,
      action: PayloadAction<UpdateStatsFromTaskPayload>,
    ) {
      const { projectCode, task } = action.payload;

      if (!shouldApplyToCurrentProject(state, projectCode)) {
        return;
      }

      state.stats.total_tasks = Math.max(0, state.stats.total_tasks - 1);

      if (isTaskCompleted(task)) {
        state.stats.completed_tasks = Math.max(
          0,
          state.stats.completed_tasks - 1,
        );
      }

      if (isTaskOverdue(task)) {
        state.stats.overdue_tasks = Math.max(0, state.stats.overdue_tasks - 1);
      }
    },
    applyTaskTransitionStats(
      state,
      action: PayloadAction<UpdateStatsFromTaskTransitionPayload>,
    ) {
      const { projectCode, previousTask, nextTask } = action.payload;

      if (!shouldApplyToCurrentProject(state, projectCode)) {
        return;
      }

      const wasCompleted = isTaskCompleted(previousTask);
      const isCompleted = isTaskCompleted(nextTask);

      if (wasCompleted !== isCompleted) {
        if (isCompleted) {
          state.stats.completed_tasks += 1;
        } else {
          state.stats.completed_tasks = Math.max(
            0,
            state.stats.completed_tasks - 1,
          );
        }
      }

      const wasOverdue = isTaskOverdue(previousTask);
      const isOverdue = isTaskOverdue(nextTask);

      if (wasOverdue !== isOverdue) {
        if (isOverdue) {
          state.stats.overdue_tasks += 1;
        } else {
          state.stats.overdue_tasks = Math.max(
            0,
            state.stats.overdue_tasks - 1,
          );
        }
      }
    },
    clearProject() {
      return initialState;
    },
  },
});

export const {
  setProject,
  setProjectCode,
  setProjectName,
  setProjectStats,
  incrementProjectStat,
  decrementProjectStat,
  applyTaskCreatedStats,
  applyTaskDeletedStats,
  applyTaskTransitionStats,
  clearProject,
} = projectSlice.actions;

export default projectSlice.reducer;
