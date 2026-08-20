import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderGit2, Plus, Pencil, Trash2, Loader, CheckCircle, X,
  ExternalLink, Github, Search, Tag, Eye, EyeOff
} from 'lucide-react';

const EMPTY_FORM = {
  title: '',
  description: '',
  technologies: '',
  imageUrl: '',
  liveUrl: '',
  githubUrl: '',
  isActive: true,
};

const Projects = () => {
  const { api } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState(null);

  /* ── Fetch ── */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', { params: { search, limit: 100 } });
      setProjects(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err.message);
    } finally {
      setLoading(false);
    }
  }, [search, api]);

  useEffect(() => {
    const t = setTimeout(fetchProjects, 300);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  /* ── Open modal ── */
  const openCreate = () => {
    setEditingProject(null);
    setForm(EMPTY_FORM);
    setSaveError('');
    setSaveSuccess(false);
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setForm({
      title: project.title || '',
      description: project.description || '',
      technologies: (project.technologies || []).join(', '),
      imageUrl: project.imageUrl || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      isActive: project.isActive !== false,
    });
    setSaveError('');
    setSaveSuccess(false);
    setShowModal(true);
  };

  /* ── Save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setSaveError('Title and description are required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const payload = { ...form };
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        fetchProjects();
      }, 1200);
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setDeletingId(null);
      fetchProjects();
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  };

  /* ── Toggle active ── */
  const handleToggleActive = async (project) => {
    try {
      await api.put(`/projects/${project._id}`, { isActive: !project.isActive });
      fetchProjects();
    } catch (err) {
      console.error('Toggle failed:', err.message);
    }
  };

  return (
    <div className="flex-1 space-y-8 py-8 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Background accent */}
      <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-dark)] flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-indigo-500" />
            Projects <span className="gradient-text">Listing</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage projects displayed on the public Courses page.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2 text-sm px-4 py-2 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {/* Search */}
      <div className="search-bar w-full max-w-md">
        <Search className="search-icon h-4 w-4" />
        <input
          type="text"
          placeholder="Search projects by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader className="h-8 w-8 animate-spin text-indigo-500" />
          <span className="text-xs text-[var(--text-muted)]">Loading projects…</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8">
          <FolderGit2 className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[var(--text-dark)]">No projects yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Click "Add Project" to create the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project._id}
              className={`card-custom p-5 flex flex-col gap-3 ${!project.isActive ? 'opacity-50' : ''}`}
            >
              {/* Title + status */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--text-dark)] leading-tight">{project.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  project.isActive
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {project.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
                {project.description}
              </p>

              {/* Tech tags */}
              {project.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">
                      <Tag className="h-2.5 w-2.5" />
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3 text-[11px] text-[var(--text-muted)]">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-500 transition-colors">
                    <ExternalLink className="h-3 w-3" /> Live
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[var(--text-dark)] transition-colors">
                    <Github className="h-3 w-3" /> GitHub
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
                <button
                  onClick={() => openEdit(project)}
                  className="flex-1 btn-secondary text-xs py-1.5 justify-center gap-1"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => handleToggleActive(project)}
                  title={project.isActive ? 'Hide from public' : 'Show on public'}
                  className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:border-indigo-400 transition-colors"
                >
                  {project.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {deletingId === project._id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="text-[10px] bg-rose-500 text-white px-2 py-1 rounded-lg font-bold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-[10px] border border-[var(--border-color)] px-2 py-1 rounded-lg text-[var(--text-muted)]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(project._id)}
                    className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-lg p-6 space-y-5 relative text-left">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--primary-subtle)]"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="border-b border-[var(--border-color)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-dark)] uppercase">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h3>
            </div>

            {saveSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-[var(--text-dark)]">
                  Project {editingProject ? 'updated' : 'created'} successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {saveError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
                    {saveError}
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Hospital Management System"
                    className="form-input-custom"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of the project…"
                    className="form-input-custom resize-none"
                  />
                </div>

                {/* Technologies */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Technologies <span className="normal-case text-[var(--text-muted)]">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={form.technologies}
                    onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className="form-input-custom"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Image URL <span className="normal-case">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://…"
                    className="form-input-custom"
                  />
                </div>

                {/* Live + GitHub side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Live URL
                    </label>
                    <input
                      type="url"
                      value={form.liveUrl}
                      onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                      placeholder="https://…"
                      className="form-input-custom"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={form.githubUrl}
                      onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                      placeholder="https://github.com/…"
                      className="form-input-custom"
                    />
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {form.isActive ? 'Visible on public page' : 'Hidden from public page'}
                  </span>
                </label>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary justify-center py-2.5 text-xs"
                  >
                    {saving ? <Loader className="h-4 w-4 animate-spin" /> : editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
