import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, X, Sparkles, Filter, Grid, List, 
  BarChart3, Bookmark, RefreshCw, SlidersHorizontal, Trash2, HelpCircle 
} from 'lucide-react';
import OrgCard from './components/OrgCard';
import OrgDetails from './components/OrgDetails';
import StatsPanel from './components/StatsPanel';

const SUGGESTED_INTERESTS = [
  'Python', 'JavaScript', 'C++', 'Go', 'Rust', 
  'React', 'Machine Learning', 'AI', 'GIS', 
  'Databases', 'Robotics', 'Compilers', 'Security', 'Android'
];

export default function App() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeInterests, setActiveInterests] = useState([]);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  
  // Display & UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'stats'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'name-asc', 'name-desc', 'tech-count'
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState([]);

  // Load organizations data
  useEffect(() => {
    fetch('/data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load GSoC organization data. Make sure data.json is in the public directory.');
        }
        return res.json();
      })
      .then(data => {
        setOrgs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gsoc-bookmarks');
    if (saved) {
      try {
        setBookmarkedSlugs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save bookmarks to localStorage
  const handleBookmarkToggle = (slug) => {
    setBookmarkedSlugs(prev => {
      const updated = prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug];
      localStorage.setItem('gsoc-bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set();
    orgs.forEach(org => {
      if (org.categories) {
        org.categories.forEach(cat => set.add(cat));
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [orgs]);

  // Handle adding an interest tag
  const handleAddInterest = (e) => {
    e.preventDefault();
    const tag = newInterestInput.trim();
    if (tag && !activeInterests.some(t => t.toLowerCase() === tag.toLowerCase())) {
      setActiveInterests(prev => [...prev, tag]);
    }
    setNewInterestInput('');
  };

  // Toggle suggested/clicked tags
  const handleToggleInterest = (tag) => {
    const normalized = tag.toLowerCase();
    setActiveInterests(prev => {
      const exists = prev.some(t => t.toLowerCase() === normalized);
      if (exists) {
        return prev.filter(t => t.toLowerCase() !== normalized);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleRemoveInterest = (tagToRemove) => {
    setActiveInterests(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleClearAllInterests = () => {
    setActiveInterests([]);
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setActiveInterests([]);
    setShowBookmarksOnly(false);
    setSortBy('default');
  };

  // Tag click from Details panel: adds it as active interest and sets view to Grid/List
  const handleTagClickFromDetails = (tag, type) => {
    const normalized = tag.toLowerCase();
    setActiveInterests(prev => {
      if (prev.some(t => t.toLowerCase() === normalized)) return prev;
      return [...prev, tag];
    });
    // Set view back to list/grid if we are in stats view
    if (viewMode === 'stats') {
      setViewMode('grid');
    }
  };

  // Compute match score and matching tags list for each org
  const orgsWithScores = useMemo(() => {
    if (activeInterests.length === 0) {
      return orgs.map(org => ({ 
        ...org, 
        matchScore: 0, 
        matchingTags: [],
        matchingInterests: []
      }));
    }

    return orgs.map(org => {
      const orgTags = [
        ...(org.tech_tags || []),
        ...(org.topic_tags || []),
        ...(org.categories || [])
      ].map(t => t.toLowerCase());

      // Find which active interests matched this organization (in tags OR name OR tagline OR description)
      const matchingInterests = activeInterests.filter(interest => {
        const query = interest.toLowerCase();
        
        // Match in tags
        const inTags = orgTags.some(ot => ot === query || ot.includes(query));
        if (inTags) return true;
        
        // Match in text fields
        const inName = org.name.toLowerCase().includes(query);
        const inTagline = org.tagline && org.tagline.toLowerCase().includes(query);
        const inDesc = org.description && org.description.toLowerCase().includes(query);
        
        return inName || inTagline || inDesc;
      });

      const matchScore = Math.round((matchingInterests.length / activeInterests.length) * 100);

      // Find specific tags that matched the interests (for tag-badge highlighting)
      const matchingTags = orgTags.filter(tag => 
        activeInterests.some(interest => tag.includes(interest.toLowerCase()))
      );

      return {
        ...org,
        matchScore,
        matchingInterests: matchingInterests.map(m => m.toLowerCase()),
        matchingTags
      };
    });
  }, [orgs, activeInterests]);


  // Filter organizations
  const filteredOrgs = useMemo(() => {
    return orgsWithScores.filter(org => {
      // Bookmarks filter
      if (showBookmarksOnly && !bookmarkedSlugs.includes(org.slug)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        if (!org.categories || !org.categories.includes(selectedCategory)) {
          return false;
        }
      }

      // Search query filter (matches name, tagline, description, tech_tags, topic_tags)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const inName = org.name.toLowerCase().includes(query);
        const inTagline = org.tagline && org.tagline.toLowerCase().includes(query);
        const inDesc = org.description && org.description.toLowerCase().includes(query);
        const inTech = org.tech_tags && org.tech_tags.some(t => t.toLowerCase().includes(query));
        const inTopics = org.topic_tags && org.topic_tags.some(t => t.toLowerCase().includes(query));
        const inLicense = org.license && org.license.toLowerCase().includes(query);

        if (!inName && !inTagline && !inDesc && !inTech && !inTopics && !inLicense) {
          return false;
        }
      }

      return true;
    });
  }, [orgsWithScores, showBookmarksOnly, bookmarkedSlugs, selectedCategory, searchTerm]);

  // Sort organizations
  const sortedOrgs = useMemo(() => {
    const list = [...filteredOrgs];
    
    // Sort logic
    list.sort((a, b) => {
      // Sort by Match Score first if user has active interests and sort matches is preferred
      if (sortBy === 'default' && activeInterests.length > 0) {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore; // Highest match first
        }
      }

      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'tech-count':
          return (b.tech_tags?.length || 0) - (a.tech_tags?.length || 0);
        case 'topic-count':
          return (b.topic_tags?.length || 0) - (a.topic_tags?.length || 0);
        default:
          // Default sorts alphabetically if no active interests or scores are equal
          return a.name.localeCompare(b.name);
      }
    });

    return list;
  }, [filteredOrgs, sortBy, activeInterests]);

  // Compute similar organizations for the active selected details card
  const similarOrgs = useMemo(() => {
    if (!selectedOrg) return [];

    return orgs
      .filter(o => o.slug !== selectedOrg.slug)
      .map(o => {
        // Calculate similarity based on category intersection and technology intersection
        let score = 0;
        
        // Category match
        if (selectedOrg.categories && o.categories) {
          const commonCat = selectedOrg.categories.filter(c => o.categories.includes(c));
          score += commonCat.length * 10;
        }
        
        // Technology match
        if (selectedOrg.tech_tags && o.tech_tags) {
          const commonTech = selectedOrg.tech_tags.filter(t => o.tech_tags.includes(t));
          score += commonTech.length * 3;
        }

        return { org: o, similarity: score };
      })
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 4)
      .map(item => item.org);
  }, [selectedOrg, orgs]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="gsoc-badge">
            <Sparkles size={14} /> Google Summer of Code 2026
          </div>
          <h1 className="app-title">GSoC Org Matcher</h1>
          <p className="app-subtitle">
            Find the perfect open-source organizations for GSoC based on your skills, stack, and interests.
          </p>
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{orgs.length}</span>
              <span className="stat-label">Total Orgs</span>
            </div>
            <div className="stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)', paddingInline: '2rem' }}>
              <span className="stat-value">{categoriesList.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{bookmarkedSlugs.length}</span>
              <span className="stat-label">My Bookmarks</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          {/* Active Search & Primary Filters */}
          <div className="filter-card">
            <div className="filter-title">
              <Filter size={18} className="resource-icon" /> Filters
            </div>

            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="search-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Name, tech, topics..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select 
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
              <input 
                type="checkbox" 
                id="bookmark-toggle" 
                checked={showBookmarksOnly} 
                onChange={(e) => setShowBookmarksOnly(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              <label htmlFor="bookmark-toggle" style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: showBookmarksOnly ? 'var(--color-accent)' : 'var(--text-secondary)' }}>
                <Bookmark size={14} fill={showBookmarksOnly ? "var(--color-accent)" : "none"} /> Bookmarks Only ({bookmarkedSlugs.length})
              </label>
            </div>
          </div>

          {/* User Interest / Skills Matcher */}
          <div className="filter-card" style={{ borderColor: activeInterests.length > 0 ? 'var(--color-primary-border)' : 'var(--border-color)' }}>
            <div className="filter-title" style={{ color: activeInterests.length > 0 ? 'var(--color-primary)' : 'var(--text-primary)' }}>
              <Sparkles size={18} className="resource-icon" /> My Interests Matcher
            </div>
            
            <p className="interests-desc">
              Add your tech skills or favorite topics to calculate a Match Score and rank matching organizations automatically!
            </p>

            <form onSubmit={handleAddInterest} className="interest-tag-input-wrapper">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Type C++, Python, Web..." 
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                style={{ paddingBlock: '0.5rem' }}
              />
              <button type="submit" className="btn btn-icon-only" title="Add interest">
                <Plus size={16} />
              </button>
            </form>

            {activeInterests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="filter-label" style={{ margin: 0 }}>Active Skills ({activeInterests.length})</span>
                  <button 
                    onClick={handleClearAllInterests}
                    style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.1rem' }}
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
                <div className="interest-chips">
                  {activeInterests.map(interest => (
                    <span key={interest} className="interest-chip">
                      {interest}
                      <button onClick={() => handleRemoveInterest(interest)} aria-label={`Remove ${interest}`}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0', fontStyle: 'italic' }}>
                No active interests listed
              </div>
            )}

            <div style={{ marginTop: '1.25rem' }}>
              <label className="filter-label" style={{ fontSize: '0.7rem' }}>Quick Suggested Techs</label>
              <div className="quick-tags-container">
                {SUGGESTED_INTERESTS.map(tech => {
                  const isActive = activeInterests.some(t => t.toLowerCase() === tech.toLowerCase());
                  return (
                    <button
                      key={tech}
                      type="button"
                      className={`quick-tag-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handleToggleInterest(tech)}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reset Filters Option */}
          {(searchTerm || selectedCategory !== 'All' || activeInterests.length > 0 || showBookmarksOnly) && (
            <button 
              className="btn btn-secondary" 
              onClick={handleClearAllFilters}
              style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '0.5rem', fontWeight: 600 }}
            >
              <RefreshCw size={14} /> Reset All Filters
            </button>
          )}
        </aside>

        {/* Main Content Area */}
        <section className="content-area">
          {/* Top Toolbar */}
          <div className="toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="view-selector">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid size={16} /> Grid
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={16} /> List
                </button>
                <button 
                  className={`view-btn ${viewMode === 'stats' ? 'active' : ''}`}
                  onClick={() => setViewMode('stats')}
                  title="Ecosystem Stats"
                >
                  <BarChart3 size={16} /> Stats
                </button>
              </div>
              
              {viewMode !== 'stats' && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Found <strong>{sortedOrgs.length}</strong> organizations
                </span>
              )}
            </div>

            {viewMode !== 'stats' && (
              <div className="sort-wrapper">
                <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
                <span>Sort by:</span>
                <select 
                  className="filter-select" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto', padding: '0.25rem 2rem 0.25rem 0.75rem', fontSize: '0.85rem', height: '32px' }}
                >
                  <option value="default">{activeInterests.length > 0 ? 'Best Interest Match' : 'Name (A to Z)'}</option>
                  <option value="name-asc">Name (A to Z)</option>
                  <option value="name-desc">Name (Z to A)</option>
                  <option value="tech-count">Most Technologies Used</option>
                  <option value="topic-count">Most Project Topics</option>
                </select>
              </div>
            )}
          </div>

          {/* Dynamic Content Views */}
          {loading ? (
            <div className="empty-state">
              <RefreshCw className="empty-icon animate-spin" size={40} style={{ animation: 'spin 1.5s linear infinite' }} />
              <div className="empty-title">Loading GSoC Organizations...</div>
              <p>Fetching data.json and preparing matches...</p>
            </div>
          ) : error ? (
            <div className="empty-state" style={{ borderColor: 'var(--color-accent)' }}>
              <HelpCircle size={40} className="empty-icon" style={{ color: 'var(--color-accent)' }} />
              <div className="empty-title">Failed to Load Data</div>
              <p>{error}</p>
              <button className="btn" onClick={() => window.location.reload()}>
                Retry Load
              </button>
            </div>
          ) : viewMode === 'stats' ? (
            <StatsPanel allOrgs={orgs} />
          ) : sortedOrgs.length > 0 ? (
            <div className={viewMode === 'list' ? 'list-layout' : 'org-grid'}>
              {sortedOrgs.map(org => (
                <OrgCard 
                  key={org.slug}
                  org={org}
                  onSelect={setSelectedOrg}
                  isBookmarked={bookmarkedSlugs.includes(org.slug)}
                  onBookmarkToggle={handleBookmarkToggle}
                  matchScore={org.matchScore}
                  matchingTags={org.matchingTags}
                  matchingInterests={org.matchingInterests}
                  searchQuery={searchTerm}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={40} className="empty-icon" />
              <div className="empty-title">No Organizations Found</div>
              <p>Your filter settings yielded no matches. Try clearing some tags or search queries.</p>
              <button className="btn btn-secondary" onClick={handleClearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Floating Detailed Panel */}
      {selectedOrg && (
        <OrgDetails 
          org={orgsWithScores.find(o => o.slug === selectedOrg.slug) || selectedOrg}
          onClose={() => setSelectedOrg(null)}
          isBookmarked={bookmarkedSlugs.includes(selectedOrg.slug)}
          onBookmarkToggle={handleBookmarkToggle}
          similarOrgs={similarOrgs}
          onSelectSimilar={setSelectedOrg}
          onTagClick={handleTagClickFromDetails}
          searchQuery={searchTerm}
        />
      )}

      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
