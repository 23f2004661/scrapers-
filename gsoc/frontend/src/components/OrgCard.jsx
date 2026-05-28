import React, { useState } from 'react';
import { Bookmark, ExternalLink, Zap } from 'lucide-react';

export default function OrgCard({ 
  org, 
  onSelect, 
  isBookmarked, 
  onBookmarkToggle, 
  matchScore, 
  matchingTags = [],
  matchingInterests = [],
  searchQuery = ''
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  // Get initials for logo fallback
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

  const handleCardClick = (e) => {
    // Prevent selection if clicking the external link or bookmark button
    if (e.target.closest('.bookmark-btn') || e.target.closest('.footer-link')) {
      return;
    }
    onSelect(org);
  };

  const hasHighMatch = matchScore > 50;

  return (
    <div 
      className={`org-card ${hasHighMatch ? 'high-match' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <div className="org-logo-wrapper">
          {org.logo_url && !logoFailed ? (
            <img 
              src={org.logo_url} 
              alt={`${org.name} logo`} 
              className="org-logo"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="logo-fallback">
              {getInitials(org.name)}
            </div>
          )}
        </div>
        
        <div className="card-title-area">
          <h3 className="org-name">{getHighlightedText(org.name, matchingInterests, searchQuery)}</h3>
          {org.license && <span className="license-badge">{org.license}</span>}
        </div>

        <button 
          className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(org.slug);
          }}
          title={isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
          aria-label="Bookmark"
        >
          <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        {matchScore > 0 && (
          <span className="match-score-badge" title="Match Score based on your interests">
            <Zap size={10} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />
            {matchScore}%
          </span>
        )}
      </div>

      <p className="org-tagline">{getHighlightedText(org.tagline, matchingInterests, searchQuery)}</p>

      {org.categories && org.categories.length > 0 && (
        <div className="org-categories">
          {org.categories.map((cat, i) => (
            <span key={i} className="category-badge">
              {cat}
            </span>
          ))}
        </div>
      )}

      {org.tech_tags && org.tech_tags.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div className="tag-section-title">Technologies</div>
          <div className="tech-badges">
            {org.tech_tags.slice(0, 8).map((tech, i) => {
              const isMatch = matchingTags.includes(tech.toLowerCase());
              return (
                <span 
                  key={i} 
                  className={`badge tech ${isMatch ? 'matching' : ''}`}
                >
                  {tech}
                </span>
              );
            })}
            {org.tech_tags.length > 8 && (
              <span className="badge" style={{ opacity: 0.6 }}>
                +{org.tech_tags.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="card-footer">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {org.topic_tags ? org.topic_tags.length : 0} topics
        </span>
        {org.website_url && (
          <a 
            href={org.website_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            Visit Website <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
