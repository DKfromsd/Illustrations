const CLOUD_FUNCTIONS_URL = 'https://us-central1-pen-from-the-northwest-blog.cloudfunctions.net/api';

// Show notice (for login success/error)
function showNotice(isSuccess, message) {
    const successNotice = document.getElementById('js-login-success');
    const errorNotice = document.getElementById('js-login-err');
    if (isSuccess) {
        successNotice.textContent = message || 'Login successful!';
        successNotice.classList.remove('hidden');
        errorNotice.classList.add('hidden');
    } else {
        errorNotice.textContent = message || 'Invalid credentials';
        errorNotice.classList.remove('hidden');
        successNotice.classList.add('hidden');
    }
}

// Handle login (backend-based)
async function handleLogin(username, password) {
    try {
        const response = await fetch(`${CLOUD_FUNCTIONS_URL}/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('jwt', result.token);
            document.getElementById('js-login-section').classList.add('hidden');
            document.getElementById('js-post-form-section').classList.remove('hidden');
            showNotice(true);
            displayPosts();
        } else {
            throw new Error(result.error || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotice(false, error.message);
    }
}

// Handle post submission
async function handlePostSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').innerText;
    const visibility = document.querySelector('#js-post-form select[name="visibility"]').value;
    const jwt = localStorage.getItem('jwt');

    try {
        console.log('Sending POST to /api/createPost');
        const response = await fetch(`${CLOUD_FUNCTIONS_URL}/api/createPost`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({title, content, visibility})
        });
        console.log('Response status:', response.status);
        const result = await response.json();
        if (response.ok) {
            alert('Post created successfully');
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').innerText = '';
            displayPosts();
        } else {
            console.error('Post error:', result);
            alert('Failed to create post: ' + result.error);
        }
    } catch (error) {
        console.error('Post creation error:', error);
        alert('Failed to create post: ' + error.message);
    }
}

// Display posts
async function displayPosts() {
    try {
        const response = await fetch(`${CLOUD_FUNCTIONS_URL}/api/getPosts`, {
            headers: {'Authorization': `Bearer ${localStorage.getItem('jwt') || ''}`}
        });
        const posts = await response.json();
        const postsDiv = document.getElementById('js-posts');
        postsDiv.innerHTML = posts.map(post => `
            <div class="tile-item">
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <p>Visibility: ${post.visibility}</p>
                <p>Posted by ${post.author} on ${new Date(post.created_at).toLocaleString()}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load posts error:', error);
    }
}

// Main initialization
function main() {
    document.getElementById('js-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        await handleLogin(username, password);
    });

    document.getElementById('js-post-form').addEventListener('submit', handlePostSubmit);
}

// Run main
main();
