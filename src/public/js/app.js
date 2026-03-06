window.appUtils = {
  THEME_STORAGE_KEY: 'jay_blog_theme',

  getPreferredTheme() {
    const storedTheme = window.localStorage.getItem(this.THEME_STORAGE_KEY);
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  },

  applyTheme(theme) {
    const safeTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', safeTheme);
    this.updateThemeToggleLabel(safeTheme);
  },

  updateThemeToggleLabel(theme) {
    const button = document.getElementById('themeToggle');
    if (!button) return;

    const isDark = theme === 'dark';
    button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    button.textContent = isDark ? 'Light Theme' : 'Dark Theme';
  },

  initThemeToggle() {
    this.applyTheme(this.getPreferredTheme());

    if (document.getElementById('themeToggle')) {
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'themeToggle';
    button.className = 'theme-toggle';

    button.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(this.THEME_STORAGE_KEY, nextTheme);
      this.applyTheme(nextTheme);
    });

    document.body.appendChild(button);
    this.updateThemeToggleLabel(document.documentElement.getAttribute('data-theme'));
  },

  initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('[data-password-toggle]');
    toggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        if (!targetId) return;

        const input = document.getElementById(targetId);
        if (!input) return;

        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        button.textContent = showing ? 'Show' : 'Hide';
        button.setAttribute('aria-pressed', showing ? 'false' : 'true');
        button.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      });
    });
  },

  showMessage(targetId, message, type) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.className = `msg ${type || 'error'}`;
    el.textContent = message || '';
  },

  clearMessage(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.className = '';
    el.textContent = '';
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
    } catch (error) {
      // ignore network errors and still redirect
    }
    window.location.href = '/';
  },

  blogCard(blog, currentUserId) {
    const authorId = blog.author && (blog.author._id || blog.author.id || '');
    const isOwner = currentUserId && authorId && String(currentUserId) === String(authorId);
    const tags = (blog.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join('');

    return `
      <article class="blog-item">
        <h3><a href="/blogs/${blog._id}">${blog.title}</a></h3>
        <p class="muted">${blog.description || 'No description added yet.'}</p>
        <div class="blog-meta">
          <span>By ${blog.author?.first_name || ''} ${blog.author?.last_name || ''}</span>
          <span>${new Date(blog.timestamp).toLocaleString()}</span>
          <span>${blog.reading_time || 'Quick read'}</span>
          <span>${blog.read_count || 0} reads</span>
          <span>${blog.state || 'published'}</span>
        </div>
        ${tags ? `<div class="tags" style="margin-top:8px">${tags}</div>` : ''}
        ${isOwner ? `<div class="toolbar"><a class="btn ghost" href="/blogs/${blog._id}/edit">Edit</a></div>` : ''}
      </article>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.appUtils.initThemeToggle();
});
