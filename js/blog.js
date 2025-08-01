'use strict';

// Replace with your new API endpoint (e.g., Render, Fly.io, Vercel, or Deta)
const API_URL = 'https://go-backend-e4wm.onrender.com/api'; 
//const API_URL = 'https://go-backend.onrender.com/api'; // Render
// Example for Render

const showNotice = (id, message, isSuccess = true) => {
  const noticeEl = getEl(id);
  noticeEl.innerText = message;
  noticeEl.classList.remove('hidden');
  setTimeout(() => noticeEl.classList.add('hidden'), isSuccess ? 1500 : 5000);
};

const checkAuth = () => {
  return !!localStorage.getItem('jwt');
};

const displayPosts = async () => {
  const postsEl = getEl('js-posts');
  postsEl.innerHTML = '';
  try {
    const headers = { 'Content-Type': 'application/json' };
    const jwt = localStorage.getItem('jwt');
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
    const response = await fetch(`${API_URL}/posts`, { headers });
    const posts = await response.json();
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
  } catch (error) {
    console.error('Error fetching posts:', error);
    showNotice('js-login-err', 'Failed to load posts', false);
  }
};

const handleLogin = async e => {
  e.preventDefault();
  const data = new FormData(e.target);
  try {
    const response = await fetch(`${API_URL}/login`, {
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
      showNotice('js-login-success', 'Login successful!');
      displayPosts();
    } else {
      showNotice('js-login-err', 'Invalid credentials', false);
    }
  } catch (error) {
    showNotice('js-login-err', 'Login failed', false);
  }
};

const handlePostSubmit = async e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const image = data.get('image');
  let imageUrl = '';
  if (image.size > 0) {
    const imageForm = new FormData();
    imageForm.append('image', image);
    const uploadResponse = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` },
      body: imageForm
    });
    if (uploadResponse.ok) {
      imageUrl = (await uploadResponse.json()).image_url;
    }
  }
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`
    },
    body: JSON.stringify({
      title: data.get('title'),
      content: data.get('content'),
      visibility: data.get('visibility'),
      image_url: imageUrl
    })
  });
  if (response.ok) {
    e.target.reset();
    showNotice('js-login-success', 'Post created!');
    displayPosts();
  } else {
    showNotice('js-login-err', 'Failed to create post', false);
  }
};

const main = async () => {
  await loadFont();
  if (checkAuth()) {
    getEl('js-login-section').classList.add('hidden');
    getEl('js-post-form-section').classList.remove('hidden');
  }
  getEl('js-login-form').addEventListener('submit', handleLogin);
  getEl('js-post-form').addEventListener('submit', handlePostSubmit);
  displayPosts();
};

main();