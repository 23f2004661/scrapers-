import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Code, Lightbulb, BookOpen, 
  MessageSquare, Mail, Bookmark, Globe, Share2, Info 
} from 'lucide-react';

export default function OrgDetails({ 
  org, 
  onClose, 
  isBookmarked, 
  onBookmarkToggle,
  similarOrgs = [],
  onSelectSimilar,
  onTagClick,
  searchQuery = ''
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  // Reset logo failure state when org changes
  useEffect(() => {
    setLogoFailed(false);
  }, [org]);

  if (!org) return null;

  const getInitials = (name) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Helper to highlight words matching search query or active interests
  const getHighlightedText = (text, highlightWords = [], search = '') => {
    if (!text) return '';
    
    const words = [...highlightWords];
    if (search && search.trim()) {
      words.push(search.trim());
    }

    const uniqueWords = Array.from(new Set(
      words
        .map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
        .filter(Boolean)
    ));

    if (uniqueWords.length === 0) return text;

    const regex = new RegExp(`(${uniqueWords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();
      const isSearchMatch = search && lowerPart.includes(search.toLowerCase());
      const isInterestMatch = highlightWords.some(w => lowerPart.includes(w.toLowerCase()));
      
      if (isInterestMatch) {
        return <mark key={index} className="interest-highlight">{part}</mark>;
      } else if (isSearchMatch) {
        return <mark key={index} className="text-highlight">{part}</mark>;
      }
      return part;
    });
  };

  // Find contact links helper
  const getContactLink = (name) => {
    if (!org.contact_links) return null;
    const link = org.contact_links.find(
      l => l.name.toLowerCase() === name.toLowerCase()
    );
    return link ? link.value : null;
  };

  const emailContact = getContactLink('email');
  const chatContact = getContactLink('chat');
  const mailingListContact = getContactLink('mailingList');
  const blogContact = getContactLink('blog');

  // Handle click outside drawer to close
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('detail-overlay')) {
      onClose();
    }
  };

  return (
    <div className="detail-overlay" onClick={handleOverlayClick}>
      <div className="detail-drawer">
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="org-logo-wrapper" style={{ width: '50px', height: '50px', minWidth: '50px' }}>
              {org.logo_url && !logoFailed ? (
                <img 
                  src={org.logo_url} 
                  alt={`${org.name} logo`} 
                  className="org-logo"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className="logo-fallback" style={{ fontSize: '1rem' }}>
                  {getInitials(org.name)}
                </div>
              )}
            </div>
            <div className="drawer-header-info">
              <h2 className="drawer-title">{getHighlightedText(org.name, org.matchingInterests, searchQuery)}</h2>
              {org.license && <span className="license-badge" style={{ marginTop: '0.2rem' }}>{org.license}</span>}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
              onClick={() => onBookmarkToggle(org.slug)}
              style={{ position: 'static', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close details">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          {/* Categories */}
          {org.categories && org.categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {org.categories.map((cat, i) => (
                <span key={i} className="category-badge" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Tagline */}
          <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '1.05rem', borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.75rem' }}>
            "{getHighlightedText(org.tagline, org.matchingInterests, searchQuery)}"
          </div>

          {/* Description */}
          <div className="drawer-section">
            <h3 className="drawer-section-title"><Info size={16} /> About the Organization</h3>
            <p className="drawer-desc">{getHighlightedText(org.description, org.matchingInterests, searchQuery)}</p>
          </div>

          {/* Core GSoC Resources */}
          <div className="drawer-section">
            <h3 className="drawer-section-title"><Globe size={16} /> GSoC 2026 Resources</h3>
            <div className="link-grid">
              {org.website_url && (
                <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="resource-card">
                  <div className="resource-info">
                    <span className="resource-title">Official Website</span>
                    <span className="resource-desc">Visit official home page</span>
                  </div>
                  <Globe size={18} className="resource-icon" />
                </a>
              )}
              {org.ideas_link && (
                <a href={org.ideas_link} target="_blank" rel="noopener noreferrer" className="resource-card" style={{ borderColor: 'var(--color-warning)' }}>
                  <div className="resource-info">
                    <span className="resource-title" style={{ color: 'var(--text-primary)' }}>Project Ideas</span>
                    <span className="resource-desc">View list of GSoC project ideas</span>
                  </div>
                  <Lightbulb size={18} className="resource-icon" style={{ color: 'var(--color-warning)' }} />
                </a>
              )}
              {org.source_code && (
                <a href={org.source_code} target="_blank" rel="noopener noreferrer" className="resource-card">
                  <div className="resource-info">
                    <span className="resource-title">Source Code</span>
                    <span className="resource-desc">Explore repositories</span>
                  </div>
                  <Code size={18} className="resource-icon" />
                </a>
              )}
              {org.contributor_guidance_url && (
                <a href={org.contributor_guidance_url} target="_blank" rel="noopener noreferrer" className="resource-card" style={{ borderColor: 'var(--color-success)' }}>
                  <div className="resource-info">
                    <span className="resource-title">Contributor Guide</span>
                    <span className="resource-desc">Read how to contribute</span>
                  </div>
                  <BookOpen size={18} className="resource-icon" style={{ color: 'var(--color-success)' }} />
                </a>
              )}
            </div>
          </div>

          {/* Technologies & Topics */}
          <div className="drawer-section">
            <h3 className="drawer-section-title"><Code size={16} /> Technologies & Topics</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {org.tech_tags && org.tech_tags.length > 0 && (
                <div>
                  <div className="tag-section-title" style={{ marginBottom: '0.4rem', fontSize: '0.75rem' }}>Technologies (Click to filter)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {org.tech_tags.map((tech, i) => (
                      <button 
                        key={i} 
                        className="badge tech"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onTagClick(tech, 'tech')}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {org.topic_tags && org.topic_tags.length > 0 && (
                <div>
                  <div className="tag-section-title" style={{ marginBottom: '0.4rem', fontSize: '0.75rem' }}>Topics (Click to filter)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {org.topic_tags.map((topic, i) => (
                      <button 
                        key={i} 
                        className="badge"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onTagClick(topic, 'topic')}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Communication Channels */}
          {(emailContact || chatContact || mailingListContact || blogContact) && (
            <div className="drawer-section">
              <h3 className="drawer-section-title"><MessageSquare size={16} /> Communication</h3>
              <div className="contact-list">
                {chatContact && (
                  <div className="contact-item">
                    <MessageSquare size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="contact-label">Chat Room:</span>
                    <a href={chatContact} target="_blank" rel="noopener noreferrer" className="contact-value">
                      {chatContact}
                    </a>
                  </div>
                )}
                {mailingListContact && (
                  <div className="contact-item">
                    <Mail size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="contact-label">Mailing List:</span>
                    <a href={mailingListContact} target="_blank" rel="noopener noreferrer" className="contact-value">
                      {mailingListContact}
                    </a>
                  </div>
                )}
                {emailContact && (
                  <div className="contact-item">
                    <Mail size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="contact-label">Email:</span>
                    <a href={`mailto:${emailContact}`} className="contact-value">
                      {emailContact}
                    </a>
                  </div>
                )}
                {blogContact && (
                  <div className="contact-item">
                    <Share2 size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="contact-label">Blog/News:</span>
                    <a href={blogContact} target="_blank" rel="noopener noreferrer" className="contact-value">
                      {blogContact}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Similar Organizations */}
          {similarOrgs && similarOrgs.length > 0 && (
            <div className="drawer-section" style={{ marginTop: '1rem' }}>
              <h3 className="drawer-section-title"><Globe size={16} /> Similar Organizations</h3>
              <div className="similar-grid">
                {similarOrgs.map((similar, i) => (
                  <div 
                    key={i} 
                    className="similar-card"
                    onClick={() => onSelectSimilar(similar)}
                  >
                    <div className="similar-logo-wrapper">
                      {similar.logo_url ? (
                        <img 
                          src={similar.logo_url} 
                          alt="" 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '2px' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="logo-fallback" style={{ fontSize: '0.7rem', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getInitials(similar.name)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="similar-name">{similar.name}</div>
                      <div className="similar-tagline">{similar.tagline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
