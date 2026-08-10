// Navigation entre pages
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('.nav-link, .footer-nav-link');
            const pages = document.querySelectorAll('.page');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const navMenu = document.getElementById('navMenu');
            const langBtn = document.querySelector('.lang-btn');
            const langOptions = document.querySelector('.lang-options');
            const langOptionsList = document.querySelectorAll('.lang-option');
            const currentLangSpan = document.getElementById('current-lang');
            
            // Langue actuelle (par défaut: français)
            let currentLang = 'fr';
            
            // Fonction pour changer de langue
            function changeLanguage(lang) {
                currentLang = lang;
                
                // Mettre à jour le bouton de langue
                currentLangSpan.textContent = lang === 'fr' ? 'Français' : 'Wolof';
                
                // Mettre à jour les options de langue
                langOptionsList.forEach(option => {
                    option.classList.remove('active');
                    if (option.getAttribute('data-lang') === lang) {
                        option.classList.add('active');
                    }
                });
                
                // Afficher/masquer les éléments selon la langue
                document.querySelectorAll('[data-lang]').forEach(element => {
                    if (element.getAttribute('data-lang') === lang) {
                        element.style.display = element.tagName === 'OPTION' ? '' : 'block';
                        // Pour les options de sélecteur
                        if (element.tagName === 'OPTION') {
                            element.selected = element.getAttribute('data-lang') === lang;
                        }
                    } else {
                        element.style.display = 'none';
                    }
                });
                
                // Mettre à jour les placeholders
                document.querySelectorAll('textarea').forEach(textarea => {
                    const placeholderFr = textarea.getAttribute('data-placeholder-fr');
                    const placeholderWo = textarea.getAttribute('data-placeholder-wo');
                    if (placeholderFr && placeholderWo) {
                        textarea.placeholder = lang === 'fr' ? placeholderFr : placeholderWo;
                    }
                });
                
                // Mettre à jour les textes des options de sélecteur
                document.querySelectorAll('select').forEach(select => {
                    const options = select.querySelectorAll('option');
                    options.forEach(option => {
                        const value = option.value;
                        const frOption = select.querySelector(`option[value="${value}"][data-lang="fr"]`);
                        const woOption = select.querySelector(`option[value="${value}"][data-lang="wo"]`);
                        
                        if (frOption && woOption) {
                            if (lang === 'fr') {
                                option.textContent = frOption.textContent;
                                option.style.display = '';
                            } else {
                                option.textContent = woOption.textContent;
                                option.style.display = '';
                            }
                        }
                    });
                });
                
                // Fermer le menu des langues
                langOptions.classList.remove('active');
            }
            
            // Gestion du bouton de langue
            langBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                langOptions.classList.toggle('active');
            });
            
            // Gestion des options de langue
            langOptionsList.forEach(option => {
                option.addEventListener('click', function() {
                    const lang = this.getAttribute('data-lang');
                    if (lang !== currentLang) {
                        changeLanguage(lang);
                    }
                });
            });
            
            // Fermer le menu des langues en cliquant ailleurs
            document.addEventListener('click', function(e) {
                if (!langBtn.contains(e.target) && !langOptions.contains(e.target)) {
                    langOptions.classList.remove('active');
                }
            });
            
            // Fonction pour changer de page
            function showPage(pageId) {
                // Masquer toutes les pages
                pages.forEach(page => {
                    page.classList.remove('active');
                });
                
                // Afficher la page sélectionnée
                const activePage = document.getElementById(pageId);
                if (activePage) {
                    activePage.classList.add('active');
                }
                
                // Mettre à jour la navigation active
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const linkPage = link.getAttribute('data-page');
                    if (linkPage && `${linkPage}-page` === pageId) {
                        // Afficher le lien dans la bonne langue
                        const frLink = link.parentElement.querySelector(`[data-lang="fr"]`);
                        const woLink = link.parentElement.querySelector(`[data-lang="wo"]`);
                        if (frLink && woLink) {
                            frLink.classList.add('active');
                            woLink.classList.add('active');
                        } else {
                            link.classList.add('active');
                        }
                    }
                });
                
                // Masquer le menu mobile après clic
                if (window.innerWidth <= 767) {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                    mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                }
                
                // Faire défiler vers le haut
                window.scrollTo(0, 0);
            }
            
            // Navigation au clic sur les liens
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const pageId = this.getAttribute('data-page') + '-page';
                    showPage(pageId);
                });
            });
            
            // Gestion du menu mobile
            mobileMenuBtn.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                this.querySelector('i').classList.toggle('fa-bars');
                this.querySelector('i').classList.toggle('fa-times');
            });
            
            // Gestion des onglets média
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // Retirer la classe active de tous les boutons et contenus
                    tabBtns.forEach(item => item.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Ajouter la classe active au bouton cliqué
                    this.classList.add('active');
                    
                    // Afficher le contenu correspondant
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });
            
            // Gestion du formulaire de contact
            const contactForm = document.getElementById('contactForm');
            
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Récupération des données du formulaire
                const formData = {
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value
                };
                
                // Message de confirmation dans la langue actuelle
                const successMessage = currentLang === 'fr' 
                    ? `Merci ${formData.name} ! Votre message a été envoyé. Nous vous contacterons bientôt au ${formData.phone}.`
                    : `Jërejëf ${formData.name} ! Sa bataaxal bi yónnee na. Dinaa la kontakte ci soonuka ci ${formData.phone}.`;
                
                alert(successMessage);
                
                // Réinitialisation du formulaire
                contactForm.reset();
                
                // Retourner à la page d'accueil après soumission
                showPage('home-page');
            });
            
            // Changement de style de la navigation au défilement
            window.addEventListener('scroll', function() {
                const header = document.querySelector('header');
                if (window.scrollY > 100) {
                    header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                } else {
                    header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }
            });
            
            // Chargement des médias ajoutés depuis le dashboard (MongoDB Atlas)
            function escapeHtml(str) {
                const div = document.createElement('div');
                div.textContent = str || '';
                return div.innerHTML;
            }

            // Charge les médias d'une section et les affiche dans les conteneurs correspondants.
            // suffix identifie les conteneurs dans le HTML, ex: "" pour l'onglet Nouveautés,
            // "-magal2022" pour l'onglet Magal 2022, etc.
            function loadGalleryForSection(section, suffix) {
                const loadingEl = document.getElementById('dynamic-loading' + suffix);
                const emptyEl = document.getElementById('dynamic-empty' + suffix);
                const imagesContainer = document.getElementById('dynamic-gallery-images' + suffix);
                const videosContainer = document.getElementById('dynamic-gallery-videos' + suffix);

                if (!imagesContainer || !videosContainer) return;

                fetch('/api/media?section=' + encodeURIComponent(section))
                    .then(function (res) { return res.json(); })
                    .then(function (medias) {
                        if (loadingEl) loadingEl.style.display = 'none';

                        imagesContainer.innerHTML = '';
                        videosContainer.innerHTML = '';

                        if (!Array.isArray(medias) || medias.length === 0) {
                            if (emptyEl) emptyEl.style.display = 'block';
                            return;
                        }
                        if (emptyEl) emptyEl.style.display = 'none';

                        medias.forEach(function (media) {
                            const title = escapeHtml(media.title);
                            if (media.type === 'image') {
                                const item = document.createElement('div');
                                item.className = 'gallery-item';
                                item.innerHTML =
                                    '<img src="' + media.url + '" alt="' + (title || 'Ahlou Café') + '">' +
                                    (title ? '<div class="image-title">' + title + '</div>' : '');
                                imagesContainer.appendChild(item);
                            } else if (media.type === 'video') {
                                const item = document.createElement('div');
                                item.className = 'video-item';
                                item.innerHTML =
                                    '<video controls style="width:100%; height:180px; background:#333; object-fit:cover;" src="' + media.url + '"></video>' +
                                    '<div class="video-info"><h3>' + (title || 'Vidéo') + '</h3></div>';
                                videosContainer.appendChild(item);
                            }
                        });
                    })
                    .catch(function () {
                        if (loadingEl) loadingEl.style.display = 'none';
                        if (emptyEl) emptyEl.style.display = 'block';
                    });
            }

            function loadDynamicGallery() {
                loadGalleryForSection('live', '');
                loadGalleryForSection('magal2022', '-magal2022');
                loadGalleryForSection('magal2023', '-magal2023');
                loadGalleryForSection('magal2024', '-magal2024');
                loadGalleryForSection('magal2025', '-magal2025');
                loadGalleryForSection('magal2026', '-magal2026');
            }

            loadDynamicGallery();

            // Afficher la page d'accueil par défaut
            showPage('home-page');
            
            // Fermer le menu mobile en cliquant sur un lien
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 767) {
                        navMenu.classList.remove('active');
                        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                    }
                });
            });
            
            // Gérer le redimensionnement de la fenêtre
            window.addEventListener('resize', function() {
                if (window.innerWidth > 767) {
                    navMenu.classList.remove('active');
                    mobileMenuBtn.querySelector('i').classList.remove('fa-times');
                    mobileMenuBtn.querySelector('i').classList.add('fa-bars');
                }
            });
        });
