// blog.js
const CLOUD_FUNCTIONS_URL = 'https://us-central1-pen-from-the-northwest-blog.cloudfunctions.net'; // Update with your region/project

const getEl = id => document.getElementById(id);
const showNotice = (id, message, isSuccess) => {
  const el = getEl(id);
  el.textContent = message;
  el.className = `notice ${isSuccess ? '' : 'notice-err'}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
};

const handleLogin = async e => {
  e.preventDefault();
  const data = new FormData(e.target);
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.get('username'),
        password: data.get('password')
      })
    });
    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('jwt', token);
      getEl('js-login-section').classList.add('hidden');
      getEl('js-post-form-section').classList.remove('hidden');
      showNotice('js-login-success', 'Login successful!', true);
      displayPosts();
    } else {
      showNotice('js-login-err', 'Invalid credentials', false);
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotice('js-login-err', 'Login failed', false);
  }
};

const handlePostSubmit = async e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const contentEl = getEl('post-content');
  const textContent = contentEl.textContent.trim();

  // Handle pasted image
  const images = contentEl.querySelectorAll('img');
  if (images.length > 0) {
    const image = images[0];
    const response = await fetch(image.src);
    const blob = await response.blob();
    data.append('image', blob, `image-${Date.now()}.png`);
  }

  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_URL}/createPost`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
      body: data
    });
    if (response.ok) {
      e.target.reset();
      contentEl.innerHTML = '';
      showNotice('js-login-success', 'Post created!', true);
      displayPosts();
    } else {
      showNotice('js-login-err', 'Failed to create post', false);
    }
  } catch (error) {
    console.error('Post creation error:', error);
    showNotice('js-login-err', 'Failed to create post', false);
  }
};

const displayPosts = async () => {
  const postsEl = getEl('js-posts');
  postsEl.innerHTML = '';
  try {
    const response = await fetch(`${CLOUD_FUNCTIONS_URL}/getPosts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt') || ''}` }
    });
    if (!response.ok) {
      throw new Error('HTTP error');
    }
    const posts = await response.json();
    if (posts.length === 0) {
      postsEl.innerHTML = '<div class="post">No posts available.</div>';
    } else {
      posts.forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.innerHTML = `
          <div class="post-title">${post.title}</div>
          <div class="post-content">${post.content}</div>
          ${post.image_url ? `<img class="post-image" src="${post.image_url}" alt="Post image">` : ''}
          <div class="post-author">Posted by ${post.author} on ${new Date(post.created_at).toLocaleDateString()}</div>
        `;
        postsEl.appendChild(postEl);
      });
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    showNotice('js-login-err', 'Failed to load posts', false);
  }
};

const main = () => {
  // Check initial auth state (optional, for refresh handling)
  const token = localStorage.getItem('jwt');
  if (token) {
    getEl('js-login-section').classList.add('hidden');
    getEl('js-post-form-section').classList.remove('hidden');
    displayPosts();
  } else {
    getEl('js-login-section').classList.remove('hidden');
    getEl('js-post-form-section').classList.add('hidden');
    displayPosts();
  }
  getEl('js-login-form').addEventListener('submit', handleLogin);
  getEl('js-post-form').addEventListener('submit', handlePostSubmit);
  getEl('post-content').addEventListener('paste', async e => {
    e.preventDefault();
    const items = (e.clipboardData || window.clipboardData).items;
    let text = '';
    let image = null;
    for (const item of items) {
      if (item.type.startsWith('text')) {
        item.getAsString(s => text = s);
      } else if (item.type.startsWith('image')) {
        image = item.getAsFile();
      }
    }
    const contentEl = getEl('post-content');
    if (image) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(image);
      contentEl.innerHTML = '';
      contentEl.appendChild(img);
    }
    if (text) {
      contentEl.innerHTML += text.replace(/\n/g, '<br>');
    }
  });
};

main();