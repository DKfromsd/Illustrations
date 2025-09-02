// blog.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const getEl = id => document.getElementById(id);
const showNotice = (id, message, isSuccess) => {
  const el = getEl(id);
  el.textContent = message;
  el.className = `notice ${isSuccess ? '' : 'notice-err'}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
};

const checkAuth = () => !!auth.currentUser;

const handleLogin = async e => {
  e.preventDefault();
  const data = new FormData(e.target);
  try {
    await auth.signInWithEmailAndPassword(data.get('username'), data.get('password'));
    getEl('js-login-section').classList.add('hidden');
    getEl('js-post-form-section').classList.remove('hidden');
    showNotice('js-login-success', 'Login successful!', true);
    displayPosts();
  } catch (error) {
    console.error('Login error:', error);
    showNotice('js-login-err', 'Invalid credentials', false);
  }
};

const handlePostSubmit = async e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const contentEl = getEl('post-content');
  const textContent = contentEl.textContent.trim();
  let imageUrl = '';

  // Check for pasted image
  const images = contentEl.querySelectorAll('img');
  if (images.length > 0) {
    const image = images[0]; // Take first pasted image
    try {
      // Convert base64 image to Blob
      const response = await fetch(image.src);
      const blob = await response.blob();
      const storageRef = storage.ref(`images/${Date.now()}-${auth.currentUser.uid}`);
      await storageRef.put(blob);
      imageUrl = await storageRef.getDownloadURL();
    } catch (error) {
      console.error('Image upload error:', error);
      showNotice('js-login-err', 'Failed to upload screenshot', false);
      return;
    }
  }

// Save post to Firestore
  try {
    await addDoc(collection(db, 'posts'), {
      title: data.get('title'),
      content: textContent,
      image_url: imageUrl,
      author: auth.currentUser.email,
      visibility: data.get('visibility'),
      created_at: serverTimestamp()
    });
    e.target.reset();
    contentEl.innerHTML = ''; // Clear contenteditable
    showNotice('js-login-success', 'Post created!', true);
    await displayPosts();
  } catch (error) {
    console.error('Post creation error:', error);
    showNotice('js-login-err', 'Failed to create post', false);
  }
};

const displayPosts = async () => {
  const postsEl = getEl('js-posts');
  postsEl.innerHTML = '';
  try {
    let q = collection(db, 'posts');
    if (auth.currentUser) {
      q = query(q, where('visibility', 'in', ['public', 'private']), orderBy('created_at', 'desc'));
    } else {
      q = query(q, where('visibility', '==', 'public'), orderBy('created_at', 'desc'));
    }
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      postsEl.innerHTML = '<div class="post">No posts available.</div>';
    } else {
      querySnapshot.forEach(doc => {
        const post = doc.data();
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.innerHTML = `
          <div class="post-title">${post.title}</div>
          <div class="post-content">${post.content}</div>
          ${post.image_url ? `<img class="post-image" src="${post.image_url}" alt="Post image">` : ''}
          <div class="post-author">Posted by ${post.author} on ${post.created_at?.toDate().toLocaleDateString() || 'Unknown date'}</div>
        `;
        postsEl.appendChild(postEl);
      });
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    showNotice('js-login-err', 'Failed to load posts', false);
  }
};

const main = async () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      getEl('js-login-section').classList.add('hidden');
      getEl('js-post-form-section').classList.remove('hidden');
      displayPosts();
    } else {
      getEl('js-login-section').classList.remove('hidden');
      getEl('js-post-form-section').classList.add('hidden');
      displayPosts();
    }
  });
  getEl('js-login-form').addEventListener('submit', handleLogin);
  getEl('js-post-form').addEventListener('submit', handlePostSubmit);
  // Handle paste event for screenshots
  getEl('post-content').addEventListener('paste', async e => {
    e.preventDefault();
    const items = (e.clipboardData || window.clipboardData).items;
    let text = '';
    let image = null;
    for (const item of items) {
      if (item.type.startsWith('text')) {
        text = item.getAsString(s => text = s);
      } else if (item.type.startsWith('image')) {
        image = item.getAsFile();
      }
    }
    const contentEl = getEl('post-content');
    if (image) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(image);
      contentEl.innerHTML = ''; // Clear existing content
      contentEl.appendChild(img);
    }
    if (text) {
      contentEl.innerHTML += text.replace(/\n/g, '<br>'); // Preserve line breaks
    }
  });
};

main();