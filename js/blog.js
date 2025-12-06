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
  
  try {
    const res = await fetch(`${CLOUD_FUNCTIONS_URL}/getPosts`, {
      method: 'GET',
      headers: token ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } : {
        'Content-Type': 'application/json'
      },
      // 이게 핵심! preflight 요청도 허용
      credentials: 'omit'
    });

    // 네트워크 오류나 500 등일 때도 여기서 잡아줌
    if (!res.ok) {
      console.error('getPosts 응답 오류:', res.status);
      $('js-posts').innerHTML = '<div class="tile-item" style="color:#c33;">포스트를 불러오지 못했습니다. 새로고침 해보세요.</div>';
      return;
    }

    const posts = await res.json();

    const container = $('js-posts');

    // posts가 없거나 배열이 아닐 때
    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = '<div class="tile-item">No posts yet.</div>';
      return;
    }

    container.innerHTML = posts.map(p => {
      // 날짜 안전하게 처리
      let dateStr = 'Just now';
      if (p.created_at) {
        const d = new Date(p.created_at);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleString();
        }
      }

      // 제목/내용/작성자 없을 때도 깨지지 않게
      const title = p.title ? (p.title || 'Untitled') : 'Untitled';
      const content = p.content ? p.content.replace(/\n/g, '<br>') : '';
      const author = p.author || 'Unknown';
      const visibility = (p.visibility || 'private').toUpperCase();

      return `
        <div class="tile-item">
          <h3>${title}</h3>
          <div class="post-content-preview">${content}</div>
          ${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:100%; margin:10px 0; border-radius:8px;" loading="lazy>` : ''}
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
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    alert('로그인 후에 이용할 수 있습니다.');
    return;
  }
  window.open(
    'https://gemini-animator2.mickeyfromsd.workers.dev/'
    ,'_blank'
    ,'width=1200,height=800,scrollbars=yes,resizable=yes'
  );
};

