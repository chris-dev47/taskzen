import { useState, useCallback, useEffect, useMemo } from 'react';
import { Project, ProjectFormData, Member, MemberRole, Milestone, ActivityLog, ActivityAction } from '../types/project';
import { storage } from '../utils/storage';

export const useProjects = (userId?: string) => {
  const [projects, setProjects] = useState<Project[]>(() => storage.get<Project[]>('projects', []));
  const [members, setMembers] = useState<Member[]>(() => storage.get<Member[]>('members', []));
  const [milestones, setMilestones] = useState<Milestone[]>(() => storage.get<Milestone[]>('milestones', []));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => storage.get<ActivityLog[]>('activityLogs', []));

  useEffect(() => { storage.set('projects', projects); }, [projects]);
  useEffect(() => { storage.set('members', members); }, [members]);
  useEffect(() => { storage.set('milestones', milestones); }, [milestones]);
  useEffect(() => { storage.set('activityLogs', activityLogs); }, [activityLogs]);

  const addLog = useCallback((projectId: string, memberId: string, memberName: string, action: ActivityAction, details: string) => {
    const log: ActivityLog = {
      id: storage.generateId(), projectId, memberId, memberName, action, details,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [log, ...prev]);
  }, []);

  const getUserProjects = useCallback((uid: string) => {
    return projects.filter((p) => !p.deletedAt && (p.ownerId === uid || members.some((m) => m.projectId === p.id && m.userId === uid)));
  }, [projects, members]);

  const addProject = useCallback((data: ProjectFormData, ownerId: string, ownerName: string) => {
    const now = new Date().toISOString();
    const project: Project = {
      ...data,
      id: storage.generateId(),
      taskIds: [],
      milestoneIds: [],
      ownerId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    setProjects((prev) => [project, ...prev]);
    // Auto-add owner as admin member
    const users = storage.get<any[]>('users', []);
    const ownerUser = users.find((u) => u.id === ownerId);
    const ownerMember: Member = {
      id: storage.generateId(),
      projectId: project.id,
      userId: ownerId,
      name: ownerName,
      email: ownerUser?.email || '',
      avatar: ownerUser?.avatar || '',
      role: 'admin',
      department: '',
      position: '',
      phone: '',
      joinedAt: now,
    };
    setMembers((prev) => [...prev, ownerMember]);
    setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, memberIds: [ownerMember.id] } : p));
    addLog(project.id, ownerId, ownerName, 'created', `Projet "${data.name}" cree`);
    return project;
  }, [addLog]);

  const updateProject = useCallback((id: string, data: Partial<Project>, memberId: string, memberName: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p));
    addLog(id, memberId, memberName, 'updated', `Projet modifie`);
  }, [addLog]);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : p));
  }, []);

  const restoreProject = useCallback((id: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, deletedAt: null, updatedAt: new Date().toISOString() } : p));
  }, []);

  const deleteProjectPermanently = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setMembers((prev) => prev.filter((m) => m.projectId !== id));
    setMilestones((prev) => prev.filter((m) => m.projectId !== id));
    setActivityLogs((prev) => prev.filter((l) => l.projectId !== id));
  }, []);

  const emptyTrash = useCallback(() => {
    const trashedIds = projects.filter((p) => p.deletedAt).map((p) => p.id);
    setProjects((prev) => prev.filter((p) => !p.deletedAt));
    trashedIds.forEach((id) => {
      setMembers((prev) => prev.filter((m) => m.projectId !== id));
      setMilestones((prev) => prev.filter((m) => m.projectId !== id));
      setActivityLogs((prev) => prev.filter((l) => l.projectId !== id));
    });
  }, [projects]);

  const addMember = useCallback((projectId: string, data: Omit<Member, 'id' | 'projectId' | 'joinedAt'>, actorId: string, actorName: string) => {
    const now = new Date().toISOString();
    // Fetch user's avatar from global users list
    const users = storage.get<any[]>('users', []);
    const user = users.find((u) => u.id === data.userId);
    const avatar = user?.avatar || '';
    const member: Member = {
      ...data, id: storage.generateId(), projectId, joinedAt: now, avatar,
    };
    setMembers((prev) => [...prev, member]);
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, memberIds: [...p.memberIds, member.id], updatedAt: now } : p));
    addLog(projectId, actorId, actorName, 'member_added', `${data.name} a rejoint le projet`);
    return member;
  }, [addLog]);

  const updateMember = useCallback((memberId: string, data: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, ...data } : m));
  }, []);

  const removeMember = useCallback((projectId: string, memberId: string, actorId: string, actorName: string, memberName: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, memberIds: p.memberIds.filter((id) => id !== memberId), updatedAt: new Date().toISOString() } : p));
    addLog(projectId, actorId, actorName, 'member_removed', `${memberName} a quitte le projet`);
  }, [addLog]);

  const addMilestone = useCallback((projectId: string, data: Omit<Milestone, 'id' | 'projectId' | 'createdAt' | 'order'>, actorId: string, actorName: string) => {
    const existing = milestones.filter((m) => m.projectId === projectId);
    const milestone: Milestone = {
      ...data, id: storage.generateId(), projectId, order: existing.length, createdAt: new Date().toISOString(),
    };
    setMilestones((prev) => [...prev, milestone]);
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, milestoneIds: [...p.milestoneIds, milestone.id], updatedAt: new Date().toISOString() } : p));
    addLog(projectId, actorId, actorName, 'created', `Jalon "${data.title}" cree`);
    return milestone;
  }, [milestones, addLog]);

  const toggleMilestone = useCallback((milestoneId: string, projectId: string, actorId: string, actorName: string, title: string) => {
    let newCompleted = false;
    setMilestones((prev) => prev.map((m) => {
      if (m.id !== milestoneId) return m;
      newCompleted = !m.completed;
      return { ...m, completed: newCompleted };
    }));
    addLog(projectId, actorId, actorName, 'milestone_completed', newCompleted ? `Jalon "${title}" termine` : `Jalon "${title}" reouvert`);
  }, [addLog]);

  const deleteMilestone = useCallback((milestoneId: string, projectId: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, milestoneIds: p.milestoneIds.filter((id) => id !== milestoneId), updatedAt: new Date().toISOString() } : p));
  }, []);

  const addTaskToProject = useCallback((projectId: string, taskId: string, actorId: string, actorName: string, taskTitle: string) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, taskIds: [...p.taskIds, taskId], updatedAt: new Date().toISOString() } : p));
    addLog(projectId, actorId, actorName, 'task_added', `Tache "${taskTitle}" ajoutee au projet`);
  }, [addLog]);

  const removeTaskFromProject = useCallback((projectId: string, taskId: string, actorId: string, actorName: string) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, taskIds: p.taskIds.filter((id) => id !== taskId), updatedAt: new Date().toISOString() } : p));
    addLog(projectId, actorId, actorName, 'task_removed', `Tache retiree du projet`);
  }, [addLog]);

  const changeProjectStatus = useCallback((projectId: string, status: Project['status'], actorId: string, actorName: string) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status, updatedAt: new Date().toISOString() } : p));
    const labels: Record<string, string> = { active: 'Actif', completed: 'Termine', archived: 'Archive' };
    addLog(projectId, actorId, actorName, 'status_changed', `Statut change en "${labels[status]}"`);
  }, [addLog]);

  const getProjectMembers = useCallback((projectId: string) => members.filter((m) => m.projectId === projectId), [members]);
  const getProjectMilestones = useCallback((projectId: string) => milestones.filter((m) => m.projectId === projectId).sort((a, b) => a.order - b.order), [milestones]);
  const getProjectLogs = useCallback((projectId: string) => activityLogs.filter((l) => l.projectId === projectId), [activityLogs]);

  const activeProjects = projects.filter((p) => !p.deletedAt);
  const trashedProjects = projects.filter((p) => p.deletedAt);
  const userProjects = useMemo(() => userId ? getUserProjects(userId) : [], [userId, projects, members]);

  return {
    projects: activeProjects,
    allProjects: projects,
    trashedProjects,
    members,
    milestones,
    activityLogs,
    userProjects,
    addProject, updateProject, deleteProject, restoreProject, deleteProjectPermanently, emptyTrash,
    addMember, updateMember, removeMember,
    addMilestone, toggleMilestone, deleteMilestone,
    addTaskToProject, removeTaskFromProject,
    changeProjectStatus,
    getProjectMembers, getProjectMilestones, getProjectLogs,
    getUserProjects,
  };
};