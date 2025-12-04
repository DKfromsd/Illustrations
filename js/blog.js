const CLOUD_FUNCTIONS_URL = 'https://us-central1-pen-from-the-northwest-blog.cloudfunctions.net/api';

// Load Firebase config from separate file (keeps it out of GitHub source)
const firebaseConfig = {
  apiKey: "AIzaSyACJE6BZz3Cvfaahra5U1b-nPY9u-1JG-A",
  authDomain: "pen-from-the-northwest-blog.firebaseapp.com",
  projectId: "pen-from-the-northwest-blog",
};

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM helpers
const getEl = id => document.getElementById(id);
const showNotice = (success, msg = '') => {
  getEl('js-login-success').textContent = success ? msg || 'Login successful!' : '';
  getEl('js-login-err').textContent = success ? '' : msg || 'Invalid credentials';
  getEl('js-login-success').classList.toggle('hidden', !success);
  getEl('js-login-err').classList.toggle('hidden', success);
  setTimeout(() => {
    getEl('js-login-success').classList.add('hidden');
    getEl('js-login-err').classList.add('hidden');
  }, 4000);
};

// Get fresh ID token for backend calls
async function getToken() {
  return auth.currentUser ? await auth.currentUser.getIdToken() : null;
}

// Login form
getEl('js-login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = getEl('username').value.trim();
  const password = getEl('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle UI update
  } catch (err) {
    showNotice(false, err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
      ? 'Invalid email or password'
      : 'Login failed – try again');
  }
});

// Auth state observer – the heart of the app
onAuthStateChanged(auth, async user => {
  if (user) {
    getEl('js-login-section').classList.add('hidden');
    getEl('js-post-form-section').classList.remove('hidden');
    showNotice(true, `Welcome, ${user.email.split('@')[0]}!`);
    await displayPosts();
  } else {
    getEl('js-login-section').classList.remove('hidden');
    getEl('js-post-form-section').classList.add('hidden');
    await displayPosts(); // still show public posts
  }
});

// Create post
getEl('js-post-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = getEl('post-title').value.trim();
  const content = getEl('post-content').innerText.trim();
  const visibility = getEl('js-post-form').querySelector('[name="visibility"]').value;
  const token = await getToken();

  if (!token) return alert('Please log in first');

  try {
    const res = await fetch(`${CLOUD_FUNCTIONS_URL}/createPost`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, visibility }),
    });
    const data = await res.json();
    if (res.ok) {
      e.target.reset();
      getEl('post-content').innerHTML = '';
      alert('Post created successfully!');
      displayPosts();
    } else {
      alert('Error: ' + (data.error || 'Unknown'));
    }
  } catch (err) {
    alert('Network error – check your connection');
  }
});

// Display all posts
async function displayPosts() {
  const token = await getToken();
  const res = await fetch(`${CLOUD_FUNCTIONS_URL}/getPosts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const posts = await res.json();

  const container = getEl('js-posts');
  if (!Array.isArray(posts) || posts.length === 0) {
    container.innerHTML = '<div class="tile-item">No posts yet.</div>';
    return;
  }

  container.innerHTML = posts.map(p => `
    <div class="tile-item">
      <h3>${p.title}</h3>
      <div class="post-content-preview">${p.content.replace(/\n/g, '<br>')}</div>
      ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:100%;margin:10px 0;border-radius:8px;">` : ''}
      <p><small>By ${p.author} • ${new Date(p.created_at).toLocaleString()} • ${p.visibility.toUpperCase()}</small></p>
    </div>
  `).join('');
}

// Paste image support (from your old code – very nice feature!)
getEl('post-content').addEventListener('paste', e => {
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const file = item.getAsFile();
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = '100%';
      getEl('post-content').innerHTML = '';
      getEl('post-content').appendChild(img);
    }
  }
});

// Initial load
displayPosts();