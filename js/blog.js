// js/blog.js — FINAL WORKING VERSION (Dec 2025)
const CLOUD_FUNCTIONS_URL = 'https://us-central1-pen-from-the-northwest-blog.cloudfunctions.net/api';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// THIS IS SAFE TO BE PUBLIC — Google designed it this way
const firebaseConfig = {
  apiKey: "AIzaSyACJE6BZz3Cvfaahra5U1b-nPY9u-1JG-A",
  authDomain: "pen-from-the-northwest-blog.firebaseapp.com",
  projectId: "pen-from-the-northwest-blog",
  storageBucket: "pen-from-the-northwest-blog.appspot.com",
  messagingSenderId: "1035792858321",
  appId: "1:1035792858321:web:8c8f65c8e8e8e8e8e8e8e8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM shortcuts
const $ = id => document.getElementById(id);

// Show notice
const notice = (success, msg) => {
  $('js-login-success').textContent = success ? msg : '';
  $('js-login-err').textContent = success ? '' : msg;
  $('js-login-success').classList.toggle('hidden', !success);
  $('js-login-err').classList.toggle('hidden', success);
  setTimeout(() => {
    $('js-login-success').classList.add('hidden');
    $('js-login-err').classList.add('hidden');
  }, 4000);
};

// Login form
$('js-login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('username').value.trim();
  const password = $('password').value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    notice(true, 'Login successful!');
  } catch (err) {
    notice(false, 'Invalid email or password');
    console.error(err);
  }
});

// React to login state
onAuthStateChanged(auth, async user => {
  if (user) {
    $('js-login-section').classList.add('hidden');
    $('js-post-form-section').classList.remove('hidden');
    notice(true, `Welcome, ${user.email.split('@')[0]}!`);
  } else {
    $('js-login-section').classList.remove('hidden');
    $('js-post-form-section').classList.add('hidden');
  }
  displayPosts(); // refresh posts list
});

// Get fresh ID token
const getToken = async () => auth.currentUser ? await auth.currentUser.getIdToken() : null;

// Create post
$('js-post-form').addEventListener('submit', async e => {
  e.preventDefault();
  const title = $('post-title').value.trim();
  const content = $('post-content').innerText.trim();
  const visibility = $('js-post-form').querySelector('[name="visibility"]').value;
  const token = await getToken();

  if (!token) return alert('Please log in first');

  try {
    const res = await fetch(`${CLOUD_FUNCTIONS_URL}/createPost`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content, visibility })
    });

    if (res.ok) {
      e.target.reset();
      $('post-content').innerHTML = '';
      alert('Post created!');
      displayPosts();
    } else {
      const data = await res.json();
      alert('Error: ' + (data.error || 'Unknown'));
    }
  } catch (err) {
    alert('Network error');
  }
});

// Display posts
async function displayPosts() {
  const token = await getToken();
  const res = await fetch(`${CLOUD_FUNCTIONS_URL}/getPosts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  const posts = await res.json();

  const container = $('js-posts');
  if (!posts || posts.length === 0) {
    container.innerHTML = '<div class="tile-item">No posts yet.</div>';
    return;
  }

  container.innerHTML = posts.map(p => `
    <div class="tile-item">
      <h3>${p.title}</h3>
      <div>${p.content.replace(/\n/g, '<br>')}</div>
      ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:100%;margin:10px 0;">` : ''}
      <p><small>By ${p.author} • ${new Date(p.created_at).toLocaleString()} • ${p.visibility}</small></p>
    </div>
  `).join('');
}

// Initial load
displayPosts();