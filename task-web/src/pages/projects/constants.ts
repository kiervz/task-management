export const STATUS_OPTIONS = [
  { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const FACETED_FILTERS = [
  { columnId: 'status', title: 'Status', options: STATUS_OPTIONS },
  { columnId: 'priority', title: 'Priority', options: PRIORITY_OPTIONS },
];
