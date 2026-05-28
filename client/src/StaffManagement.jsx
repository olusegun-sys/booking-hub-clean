import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Edit2, Trash2, Users, Search, Filter, Mail, Phone, Clock, Shield, Crown, Briefcase, MoreVertical } from 'lucide-react';
import { showSuccess, showError } from './toast';
import API_BASE from './config';

function StaffManagement({ business, onBack }) {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staff'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const roles = [
    { value: 'staff', label: 'Staff', color: '#64748b', bg: '#f1f5f9', icon: Briefcase },
    { value: 'manager', label: 'Manager', color: '#4f46e5', bg: '#eef2ff', icon: Shield },
    { value: 'owner', label: 'Owner', color: '#d97706', bg: '#fef3c7', icon: Crown }
  ];

  useEffect(() => {
    if (business && business.id) {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, roleFilter]);

  const filterStaff = () => {
    let filtered = [...staff];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.full_name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term)
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }
    
    setFilteredStaff(filtered);
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/businesses/${business.id}/staff`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await response.json();
      if (data.success) {
        setStaff(data.staff || []);
        setFilteredStaff(data.staff || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff:', err);
      showError('Failed to load staff members');
    }
    setLoading(false);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      setSaving(false);
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Valid email is required');
      setSaving(false);
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/businesses/${business.id}/staff`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setStaff([data.staff, ...staff]);
        setShowAddForm(false);
        setFormData({ email: '', password: '', full_name: '', role: 'staff' });
        showSuccess('Staff member added successfully');
      } else {
        setError(data.error || 'Failed to add staff');
        showError(data.error || 'Failed to add staff');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      showError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setStaff(staff.map(s => s.id === editingStaff.id ? data.staff : s));
        setEditingStaff(null);
        setFormData({ email: '', password: '', full_name: '', role: 'staff' });
        showSuccess('Staff member updated successfully');
      } else {
        setError(data.error || 'Failed to update staff');
        showError(data.error || 'Failed to update staff');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      showError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  const handleDeleteStaff = async (staffId) => {
    if (!confirm('Remove this staff member?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/staff/${staffId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      const data = await response.json();
      
      if (data.success) {
        setStaff(staff.filter(s => s.id !== staffId));
        showSuccess('Staff member removed');
      } else {
        showError('Failed to remove staff');
      }
    } catch (err) {
      showError('Something went wrong. Please try again.');
    }
  };

  const startEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      email: staffMember.email,
      password: '',
      full_name: staffMember.full_name,
      role: staffMember.role,
      is_active: staffMember.is_active !== false
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingStaff(null);
    setFormData({ email: '', password: '', full_name: '', role: 'staff' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleStyle = (role) => {
    const r = roles.find(r => r.value === role) || roles[0];
    return { color: r.color, bg: r.bg, icon: r.icon, label: r.label };
  };

  if (!business || !business.id) {
    return React.createElement('div', { style: { padding: '40px', textAlign: 'center' } },
      React.createElement('p', { style: { color: '#ef4444' } }, 'Error: Business data not available.'),
      React.createElement('button', { onClick: onBack, style: { marginTop: '16px', padding: '8px 16px', cursor: 'pointer' } }, 'Go Back')
    );
  }

  if (loading) {
    return React.createElement('div', { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' } },
      React.createElement('div', { className: 'loading-spinner' })
    );
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isDesktop ? '32px' : '20px'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const titleSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const backButtonStyle = {
    padding: '10px 20px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569'
  };

  const titleStyle = {
    fontSize: isDesktop ? '28px' : '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  const addButtonStyle = {
    padding: '12px 24px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600'
  };

  const searchBarStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  };

  const searchInputStyle = {
    flex: 1,
    padding: '12px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '40px',
    fontSize: '14px',
    outline: 'none',
    paddingLeft: '40px',
    background: `url('data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="10" cy="10" r="7"/><line x1="21" y1="21" x2="15" y2="15"/></svg>')}') no-repeat 16px center`
  };

  const filterSelectStyle = {
    padding: '12px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '40px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none'
  };

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '28px'
  };

  const statCardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    textAlign: 'center',
    border: '1px solid #eef2ff'
  };

  const statNumberStyle = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a'
  };

  const statLabelStyle = {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  };

  const staffGridStyle = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr',
    gap: '16px'
  };

  const staffCardStyle = {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    transition: 'all 0.2s ease'
  };

  const staffCardContentStyle = {
    padding: '20px'
  };

  const staffHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  };

  const avatarStyle = {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    flexShrink: 0
  };

  const staffInfoStyle = {
    flex: 1
  };

  const staffNameStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0
  };

  const staffEmailStyle = {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const roleBadgeStyle = (roleStyle) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    background: roleStyle.bg,
    color: roleStyle.color,
    marginTop: '8px'
  });

  const staffDetailsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px 0',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9'
  };

  const detailRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748b'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
  };

  const editButtonStyle = {
    flex: 1,
    padding: '8px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#475569'
  };

  const deleteButtonStyle = {
    flex: 1,
    padding: '8px',
    background: '#fee2e2',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    color: '#dc2626'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '60px 24px',
    background: 'white',
    borderRadius: '20px',
    border: '2px dashed #e2e8f0'
  };

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.is_active !== false).length,
    owners: staff.filter(s => s.role === 'owner').length
  };

  return React.createElement('div', { style: containerStyle },
    // Header
    React.createElement('div', { style: headerStyle },
      React.createElement('div', { style: titleSectionStyle },
        React.createElement('button', { onClick: onBack, style: backButtonStyle },
          React.createElement(ArrowLeft, { size: 16 }), ' Back'
        ),
        React.createElement('div', null,
          React.createElement('h1', { style: titleStyle }, 'Team Management'),
          React.createElement('p', { style: { fontSize: '13px', color: '#64748b', marginTop: '4px' } }, 'Manage your staff and their permissions')
        )
      ),
      React.createElement('button', { onClick: () => setShowAddForm(true), style: addButtonStyle },
        React.createElement(UserPlus, { size: 18 }), ' Invite Staff'
      )
    ),

    // Stats Row
    React.createElement('div', { style: statsStyle },
      React.createElement('div', { style: statCardStyle },
        React.createElement('div', { style: statNumberStyle }, stats.total),
        React.createElement('div', { style: statLabelStyle }, 'Total Staff')
      ),
      React.createElement('div', { style: statCardStyle },
        React.createElement('div', { style: statNumberStyle }, stats.active),
        React.createElement('div', { style: statLabelStyle }, 'Active Members')
      ),
      React.createElement('div', { style: statCardStyle },
        React.createElement('div', { style: statNumberStyle }, stats.owners),
        React.createElement('div', { style: statLabelStyle }, 'Administrators')
      )
    ),

    // Search & Filter
    React.createElement('div', { style: searchBarStyle },
      React.createElement('div', { style: { flex: 1, position: 'relative' } },
        React.createElement(Search, { size: 16, style: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' } }),
        React.createElement('input', {
          type: 'text',
          placeholder: 'Search by name or email...',
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          style: { ...searchInputStyle, width: '100%', paddingLeft: '44px' }
        })
      ),
      React.createElement('select', {
        value: roleFilter,
        onChange: (e) => setRoleFilter(e.target.value),
        style: filterSelectStyle
      },
        React.createElement('option', { value: 'all' }, 'All Roles'),
        React.createElement('option', { value: 'owner' }, 'Owner'),
        React.createElement('option', { value: 'manager' }, 'Manager'),
        React.createElement('option', { value: 'staff' }, 'Staff')
      )
    ),

    // Add/Edit Form Modal
    (showAddForm || editingStaff) && React.createElement('div', { 
      style: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
      onClick: () => { setShowAddForm(false); setEditingStaff(null); }
    },
      React.createElement('div', { 
        style: { background: 'white', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' },
        onClick: (e) => e.stopPropagation()
      },
        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' } },
          React.createElement('h2', { style: { fontSize: '22px', fontWeight: '700', margin: 0 } }, editingStaff ? 'Edit Team Member' : 'Invite Team Member'),
          React.createElement('button', { onClick: () => { setShowAddForm(false); setEditingStaff(null); }, style: { background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer' } }, React.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }), React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })))
        ),
        
        error && React.createElement('div', { style: { background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px' } }, error),

        React.createElement('form', { onSubmit: editingStaff ? handleUpdateStaff : handleAddStaff },
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, 'Full Name *'),
            React.createElement('input', {
              type: 'text',
              required: true,
              value: formData.full_name,
              onChange: (e) => setFormData({...formData, full_name: e.target.value}),
              style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }
            })
          ),
          React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, 'Email Address *'),
            React.createElement('input', {
              type: 'email',
              required: true,
              disabled: !!editingStaff,
              value: formData.email,
              onChange: (e) => setFormData({...formData, email: e.target.value}),
              style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: editingStaff ? '#f1f5f9' : 'white' }
            })
          ),
          !editingStaff && React.createElement('div', { style: { marginBottom: '16px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, 'Password *'),
            React.createElement('input', {
              type: 'password',
              required: true,
              value: formData.password,
              onChange: (e) => setFormData({...formData, password: e.target.value}),
              style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px' }
            })
          ),
          React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px', color: '#475569' } }, 'Role'),
            React.createElement('select', {
              value: formData.role,
              onChange: (e) => setFormData({...formData, role: e.target.value}),
              style: { width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: 'white' }
            },
              React.createElement('option', { value: 'staff' }, 'Staff - View only'),
              React.createElement('option', { value: 'manager' }, 'Manager - Full access'),
              React.createElement('option', { value: 'owner' }, 'Owner - Admin rights')
            )
          ),
          editingStaff && React.createElement('div', { style: { marginBottom: '20px' } },
            React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
              React.createElement('input', {
                type: 'checkbox',
                checked: formData.is_active,
                onChange: (e) => setFormData({...formData, is_active: e.target.checked}),
                style: { width: '18px', height: '18px' }
              }),
              'Active (can access the system)'
            )
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px' } },
            React.createElement('button', { 
              type: 'submit', 
              disabled: saving, 
              style: { flex: 1, padding: '12px', background: saving ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '40px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }
            }, saving ? 'Saving...' : (editingStaff ? 'Update Member' : 'Send Invite')),
            React.createElement('button', { 
              type: 'button', 
              onClick: editingStaff ? cancelEdit : () => setShowAddForm(false), 
              style: { flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '40px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
            }, 'Cancel')
          )
        )
      )
    ),

    // Staff Grid
    filteredStaff.length === 0 ?
      React.createElement('div', { style: emptyStateStyle },
        React.createElement(Users, { size: 48, color: '#cbd5e1' }),
        React.createElement('h3', { style: { fontSize: '18px', fontWeight: '600', marginTop: '16px', color: '#0f172a' } }, 'No team members yet'),
        React.createElement('p', { style: { fontSize: '14px', color: '#64748b', marginTop: '8px' } }, searchTerm || roleFilter !== 'all' ? 'Try adjusting your search or filter' : 'Invite your first team member to get started'),
        !searchTerm && roleFilter === 'all' && React.createElement('button', { 
          onClick: () => setShowAddForm(true), 
          style: { marginTop: '20px', padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }
        }, React.createElement(UserPlus, { size: 14 }), ' Invite Staff')
      ) :
      React.createElement('div', { style: staffGridStyle },
        filteredStaff.map(member => {
          const roleStyle = getRoleStyle(member.role);
          const RoleIcon = roleStyle.icon;
          return React.createElement('div', { key: member.id, style: staffCardStyle },
            React.createElement('div', { style: staffCardContentStyle },
              React.createElement('div', { style: staffHeaderStyle },
                React.createElement('div', { style: avatarStyle }, getInitials(member.full_name || member.email)),
                React.createElement('div', { style: staffInfoStyle },
                  React.createElement('h3', { style: staffNameStyle }, member.full_name || member.email.split('@')[0]),
                  React.createElement('div', { style: staffEmailStyle },
                    React.createElement(Mail, { size: 12 }), member.email
                  ),
                  React.createElement('div', { style: roleBadgeStyle(roleStyle) },
                    React.createElement(RoleIcon, { size: 12 }),
                    roleStyle.label
                  )
                )
              ),
              React.createElement('div', { style: staffDetailsStyle },
                React.createElement('div', { style: detailRowStyle },
                  React.createElement(Clock, { size: 12 }),
                  React.createElement('span', null, member.is_active !== false ? 'Active' : 'Inactive')
                ),
                member.created_at && React.createElement('div', { style: detailRowStyle },
                  React.createElement('span', null, 'Joined: ' + new Date(member.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }))
                )
              ),
              React.createElement('div', { style: actionButtonsStyle },
                React.createElement('button', { onClick: () => startEdit(member), style: editButtonStyle },
                  React.createElement(Edit2, { size: 14 }), 'Edit'
                ),
                React.createElement('button', { onClick: () => handleDeleteStaff(member.id), style: deleteButtonStyle },
                  React.createElement(Trash2, { size: 14 }), 'Remove'
                )
              )
            )
          );
        })
      )
  );
}

export default StaffManagement;