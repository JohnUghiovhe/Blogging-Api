window.appUtils = {
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
