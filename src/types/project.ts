export type ProjectStatus = 'active' | 'completed' | 'archived';
export type MemberRole = 'admin' | 'member' | 'viewer';
export type ActivityAction = 'created' | 'updated' | 'member_added' | 'member_removed' | 'task_added' | 'task_removed' | 'milestone_completed' | 'status_changed';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  icon: string;
  startDate: string;
  endDate: string;
  budget: number;
  memberIds: string[];
  taskIds: string[];
  milestoneIds: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Member {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: MemberRole;
  department: string;
  position: string;
  phone: string;
  joinedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  memberId: string;
  memberName: string;
  action: ActivityAction;
  details: string;
  createdAt: string;
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'taskIds' | 'milestoneIds'>;
