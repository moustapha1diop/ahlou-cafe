document.addEventListener('DOMContentLoaded', function () {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    const uploadForm = document.getElementById('upload-form');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadMsg = document.getElementById('upload-msg');
    const progressWrap = document.getElementById('upload-progress-wrap');
    const progressBar = document.getElementById('upload-progress');

    const mediaGrid = document.getElementById('media-grid');
    const mediaEmpty = document.getElementById('media-empty');
    const filterSection = document.getElementById('filter-section');

    function getToken() {
        return localStorage.getItem('ahlou_admin_token');
    }

    function setToken(token) {
        localStorage.setItem('ahlou_admin_token', token);
    }

    function clearToken() {
        localStorage.removeItem('ahlou_admin_token');
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        loadMediaList();
    }

    function showLogin() {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }

    // --- Connexion ---
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loginError.textContent = '';
        const password = document.getElementById('password').value;

        fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password }),
        })
            .then(function (res) {
                return res.json().then(function (data) {
                    return { ok: res.ok, data: data };
                });
            })
            .then(function (result) {
                if (!result.ok) {
                    loginError.textContent = result.data.message || 'Erreur de connexion';
                    return;
                }
                setToken(result.data.token);
                document.getElementById('password').value = '';
                showDashboard();
            })
            .catch(function () {
                loginError.textContent = 'Impossible de contacter le serveur.';
            });
    });

    logoutBtn.addEventListener('click', function () {
        clearToken();
        showLogin();
    });

    // --- Upload ---
    uploadForm.addEventListener('submit', function (e) {
        e.preventDefault();
        uploadMsg.textContent = '';
        uploadMsg.className = 'upload-msg';

        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', document.getElementById('title').value);
        formData.append('section', document.getElementById('section').value);

        uploadBtn.disabled = true;
        progressWrap.style.display = 'block';
        progressBar.style.width = '0%';

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/media');
        xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());

        xhr.upload.addEventListener('progress', function (evt) {
            if (evt.lengthComputable) {
                const percent = Math.round((evt.loaded / evt.total) * 100);
                progressBar.style.width = percent + '%';
            }
        });

        xhr.onload = function () {
            uploadBtn.disabled = false;
            progressWrap.style.display = 'none';

            if (xhr.status === 401) {
                clearToken();
                showLogin();
                return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                uploadMsg.textContent = 'Publié avec succès ! Visible immédiatement sur le site.';
                uploadMsg.className = 'upload-msg success';
                uploadForm.reset();
                document.getElementById('section').value = 'live';
                loadMediaList();
            } else {
                let message = 'Erreur lors de la publication.';
                try {
                    message = JSON.parse(xhr.responseText).message || message;
                } catch (err) {}
                uploadMsg.textContent = message;
                uploadMsg.className = 'upload-msg error';
            }
        };

        xhr.onerror = function () {
            uploadBtn.disabled = false;
            progressWrap.style.display = 'none';
            uploadMsg.textContent = 'Impossible de contacter le serveur.';
            uploadMsg.className = 'upload-msg error';
        };

        xhr.send(formData);
    });

    // --- Liste des médias ---
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function loadMediaList() {
        const section = filterSection.value;
        const url = section ? '/api/media?section=' + encodeURIComponent(section) : '/api/media';

        fetch(url)
            .then(function (res) { return res.json(); })
            .then(function (medias) {
                mediaGrid.innerHTML = '';

                if (!Array.isArray(medias) || medias.length === 0) {
                    mediaEmpty.style.display = 'block';
                    return;
                }
                mediaEmpty.style.display = 'none';

                medias.forEach(function (media) {
                    const card = document.createElement('div');
                    card.className = 'media-card';

                    const thumb = media.type === 'video'
                        ? '<video src="' + media.url + '" muted></video>'
                        : '<img src="' + media.url + '" alt="' + escapeHtml(media.title) + '">';

                    card.innerHTML =
                        '<div class="media-thumb">' + thumb + '</div>' +
                        '<div class="media-card-info">' +
                            '<div>' +
                                '<div class="media-title">' + (escapeHtml(media.title) || '(sans titre)') + '</div>' +
                                '<div class="media-section">' + media.section + ' · ' + media.type + '</div>' +
                            '</div>' +
                            '<button class="delete-btn" data-id="' + media._id + '"><i class="fas fa-trash"></i> Supprimer</button>' +
                        '</div>';

                    mediaGrid.appendChild(card);
                });

                document.querySelectorAll('.delete-btn').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        deleteMedia(this.getAttribute('data-id'));
                    });
                });
            })
            .catch(function () {
                mediaEmpty.textContent = 'Erreur lors du chargement des médias.';
                mediaEmpty.style.display = 'block';
            });
    }

    function deleteMedia(id) {
        if (!confirm('Supprimer ce média du site ?')) return;

        fetch('/api/media/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + getToken() },
        })
            .then(function (res) {
                if (res.status === 401) {
                    clearToken();
                    showLogin();
                    return;
                }
                loadMediaList();
            })
            .catch(function () {
                alert('Erreur lors de la suppression.');
            });
    }

    filterSection.addEventListener('change', loadMediaList);

    // --- Démarrage ---
    if (getToken()) {
        showDashboard();
    } else {
        showLogin();
    }
});
