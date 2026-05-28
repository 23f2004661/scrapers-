import React from 'react';
import { 
  BarChart3, Code2, Tags, HelpCircle, 
  Lightbulb, BookOpen, GitBranch, Award
} from 'lucide-react';

export default function StatsPanel({ allOrgs = [] }) {
  if (!allOrgs || allOrgs.length === 0) return null;

  // 1. Calculate general stats
  const totalOrgs = allOrgs.length;
  
  // Tech tags counts
  const techCounts = {};
  const topicCounts = {};
  const categoryCounts = {};
  const licenseCounts = {};
  
  let hasIdeasLink = 0;
  let hasContributorGuide = 0;
  let hasSourceCode = 0;

  allOrgs.forEach(org => {
    // Tech tags
    if (org.tech_tags) {
      org.tech_tags.forEach(t => {
        const normalized = t.trim().toLowerCase();
        if (normalized) {
          // Keep original casing for display if possible, or capitalize
          const display = t.trim();
          techCounts[display] = (techCounts[display] || 0) + 1;
        }
      });
    }

    // Topic tags
    if (org.topic_tags) {
      org.topic_tags.forEach(t => {
        const display = t.trim();
        topicCounts[display] = (topicCounts[display] || 0) + 1;
      });
    }

    // Categories
    if (org.categories) {
      org.categories.forEach(c => {
        categoryCounts[c] = (categoryCounts[c] || 0) + 1;
      });
    }

    // Licenses
    if (org.license) {
      licenseCounts[org.license] = (licenseCounts[org.license] || 0) + 1;
    }

    // Resource readiness
    if (org.ideas_link) hasIdeasLink++;
    if (org.contributor_guidance_url) hasContributorGuide++;
    if (org.source_code) hasSourceCode++;
  });

  // Get Top 8 Tech Tags
  const topTech = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Get Top 6 Category Tags
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Get Top 6 Topics
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Get Top 4 Licenses
  const topLicenses = Object.entries(licenseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="stats-dashboard">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <BarChart3 size={20} className="resource-icon" /> GSoC 2026 Ecosystem Insights
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Analyzing developer ecosystem, programming stacks, and categories across all {totalOrgs} participating organizations.
      </p>

      {/* Grid of Key Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-title">Total Organizations</span>
          <span className="stat-card-value">{totalOrgs}</span>
          <Award className="stat-card-icon" />
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Has Ideas List</span>
          <span className="stat-card-value">{hasIdeasLink}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {((hasIdeasLink / totalOrgs) * 100).toFixed(0)}% of total
          </span>
          <Lightbulb className="stat-card-icon" />
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Has Contributor Guide</span>
          <span className="stat-card-value">{hasContributorGuide}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {((hasContributorGuide / totalOrgs) * 100).toFixed(0)}% of total
          </span>
          <BookOpen className="stat-card-icon" />
        </div>
        <div className="stat-card">
          <span className="stat-card-title">Open Repositories</span>
          <span className="stat-card-value">{hasSourceCode}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {((hasSourceCode / totalOrgs) * 100).toFixed(0)}% of total
          </span>
          <GitBranch className="stat-card-icon" />
        </div>
      </div>

      {/* Row with distribution bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
        {/* Popular Languages Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Code2 size={16} style={{ color: 'var(--color-primary)' }} /> Popular Programming Stacks
          </h3>
          <div className="list-rank">
            {topTech.map(([tech, count], index) => {
              const percentage = (count / totalOrgs) * 100;
              return (
                <div key={tech} className="rank-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                    <span className="rank-item-label">
                      <span className="rank-badge">{index + 1}</span>
                      {tech}
                    </span>
                    <span className="rank-count">{count} orgs ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories & Topics Columns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Categories */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <Tags size={16} style={{ color: 'var(--color-accent)' }} /> Top Categories
            </h3>
            <div className="list-rank">
              {topCategories.map(([cat, count], index) => {
                const percentage = (count / totalOrgs) * 100;
                return (
                  <div key={cat} className="rank-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                      <span className="rank-item-label" style={{ fontSize: '0.8rem' }}>
                        <span className="rank-badge" style={{ backgroundColor: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}>{index + 1}</span>
                        {cat}
                      </span>
                      <span className="rank-count" style={{ fontSize: '0.8rem' }}>{count} orgs</span>
                    </div>
                    <div className="progress-bar-bg" style={{ height: '4px' }}>
                      <div className="progress-bar-fill" style={{ width: `${percentage}%`, backgroundColor: 'var(--color-accent)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Licenses */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <Award size={16} style={{ color: 'var(--color-success)' }} /> Common Licenses
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {topLicenses.map(([license, count]) => (
                <div key={license} style={{ 
                  flex: '1 1 calc(50% - 0.5rem)', 
                  backgroundColor: 'var(--bg-input)', 
                  border: '1px solid var(--border-color)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <span style={{ fontWeight: 600 }}>{license}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{count} orgs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
