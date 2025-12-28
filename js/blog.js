// js/blog.js — FINAL WORKING VERSION (Dec 2025)
const CLOUD_FUNCTIONS_URL = 'https://us-central1-pen-from-the-northwest-blog.cloudfunctions.net/api';

//import { DataConnectOperationError } from "firebase/data-connect";
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

  $('js-posts-section').classList.remove('hidden');

  displayPosts(); // refresh posts list
});

// Get fresh ID token
const getToken = async () => auth.currentUser ? await auth.currentUser.getIdToken() : null;

// Create post
 
// PASTE HANDLER: Supports rich text (links) + images
$('post-content').addEventListener('paste', async (e) => {
  e.preventDefault();

  const items = e.clipboardData.items;
  let hasImage = false;

  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      hasImage = true;
      const blob = item.getAsFile();
      const url = URL.createObjectURL(blob);

      const img = document.createElement('img');
      img.src = url;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '8px';
      img.style.margin = '10px 0';
      img.dataset.tempUrl = url; // mark as temp for upload later
      img.dataset.blob = true;

      $('post-content').appendChild(img);
      $('post-content').appendChild(document.createElement('br'));
    }
  }

  // If no image, insert rich text (preserves <a>, <b>, etc.)
  if (!hasImage) {
    const html = e.clipboardData.getData('text/html');
    if (html) {
      document.execCommand('insertHTML', false, html);
    } else {
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
  }
});

// Submit post with images
$('js-post-form').addEventListener('submit', async e => {
  e.preventDefault();

  const title = $('post-title').value.trim();
  const visibility = $('js-post-form').querySelector('[name="visibility"]').value;
  const contentEl = $('post-content');
  const token = await getToken();

  if (!token) return alert('Please log in');

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', contentEl.innerHTML); // ← This keeps <a href=""> links!
  formData.append('visibility', visibility);

  // Find temp images and add to form
  const tempImages = contentEl.querySelectorAll('img[data-temp-url]');
  for (let i = 0; i < tempImages.length; i++) {
    const img = tempImages[i];
    const response = await fetch(img.src);
    const blob = await response.blob();
    formData.append('images', blob, `pasted-image-${i + 1}.png`);
  }

  try {
    const res = await fetch(`${CLOUD_FUNCTIONS_URL}/createPost`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      e.target.reset();
      contentEl.innerHTML = '';
      alert('Post created successfully!');
      displayPosts();
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Failed'));
    }
  } catch (err) {
    console.error(err);
    alert('Network error');
  }
});


// Display posts
async function displayPosts() {
  const token = await getToken();
  
  try {
     
    const res = await fetch(`${CLOUD_FUNCTIONS_URL}/getPosts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!res.ok) throw new Error('Failed to fetch');

    const posts = await res.json();
    const container = $('js-posts');

    // posts가 없거나 배열이 아닐 때
    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = '<div class="tile-item">No posts yet.</div>';
      return;
    }

    

      container.innerHTML = posts.map(p => {
      //const date = p.created_at ? new Date(p.created_at).toLocaleString() : 'Just now';
      let dateStr = 'Just now';
      if (p.created_at) {
        // ISO 문자열에서 Z나 밀리초가 있어도 안전하게 파싱
        const timestamp = p.created_at;

        // Firestore Timestamp 객체 형태인지 확인 (옛날 코드에서 올 수 있음)
        if (timestamp && timestamp.toDate) {
          dateStr = timestamp.toDate().toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        } else {
          // 문자열인 경우 안전하게 파싱
          const date = new Date(timestamp.replace('Z', ''));  // Z 제거 후 파싱 (안전)
          if (!isNaN(date.getTime())) {
            dateStr = date.toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          }
        }
      }

      const author = p.author || 'Unknown';
      const visibility = (p.visibility || 'private').toUpperCase();

      
      return `
        <div class="tile-item">
          <h3>${p.title || 'Untitled'}</h3>
          <div class="post-content-preview" style="line-height:1.6; word-break:break-word;">
            ${p.content} <!-- This now contains real <a>, <b>, <img> etc. -->
          </div>
          ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:100%; margin:10px 0; border-radius:8px;" loading="lazy">` : ''}
          <p><small>By ${author} • ${dateStr} • ${visibility}</small></p>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('displayPosts 전체 오류:', err);
    $('js-posts').innerHTML = `
      <div class="tile-item" style="color:#c33; text-align:center; padding:20px;">
        포스트을 불러오지 못했습니다.<br>
        <small>새로고침하거나 나중에 다시 시도해주세요.</small>
      </div>`;
  }
}

// Initial load
displayPosts();

// HTML escape (보안 + 깨짐 방지) – 필요하면 사용)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// DOM 로드 후 이벤트 바인딩 (이게 핵심! module에서도 완벽 동작)
document.addEventListener('DOMContentLoaded', () => {
  // Home 버튼 이벤트
  const homeBtn = document.getElementById('home-menu');
  if (homeBtn) {
    homeBtn.addEventListener('click', goto_Home);
  }

  // Blog 버튼 이벤트
  const blogBtn = document.getElementById('blog-menu');
  if (blogBtn) {
    blogBtn.addEventListener('click', goto_Blog);
  }

  // Gemini 버튼 이벤트
  const geminiBtn = document.getElementById('gemini-menu');
  if (geminiBtn) {
    geminiBtn.addEventListener('click', open_Gemini);
  }

  //log out 
  const logoutBtn = document.getElementById('logout-menu');
  if(logoutBtn){
    logoutBtn.addEventListener('click', async()=>{
      try{
        await auth.signOut();
        localStorage.clear();//removeItem('jwt');
        sessionStorage.clear();
        document.cookie.split(";").forEach(c =>{
          document.cookie= c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

      //location.reload(); 
      // 문제는 Firebase Auth의 자동 로그인 기능 .
      // onAuthStateChanged 리스너가 Firebase가 저장한 세션(쿠키)을 보고 자동으로 로그인 상태 복구하기 때문에,
      // signOut()을 해도 바로 다시 로그인돼서 blog.html이 유지.
    
        alert('Log-out-success');
        window.location.href = './blog.html';  // 무조건 blog.html로 강제 이동
      }
      catch(err){
        console.error('Logout error:', err);
      alert('Logout -failed, refresh and retry');
      }
    })
  }
});

const goto_Home = () => {
  window.location.href = './index.html';
}

const goto_Blog = () => {
  window.location.href = './blog.html';
}

const open_Gemini = () => {
  // const jwt = localStorage.getItem('jwt');
  // if (!jwt) {
  // localStorage에 jwt 저장안함. Firebase - onAuthStateChanged로 로그인 상태 유지.
  if (!auth.currentUser){
     alert('로그인 후에 이용할 수 있습니다.');
    return;
  }
  window.open(
    //'https://gemini-animator2.mickeyfromsd.workers.dev/'
    'https://backend-v2-7az.pages.dev/'
    ,'_blank'
    ,'width=1200,height=800,scrollbars=yes,resizable=yes'
  );
};

