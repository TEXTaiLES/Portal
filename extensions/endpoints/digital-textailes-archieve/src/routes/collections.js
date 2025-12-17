import { CSP_POLICY, USE_CASES, USE_CASE_MAP } from '../utils/constants.js';
import { matchesByUseCase } from '../utils/helpers.js';
import { renderNavbar } from '../templates/navbar.js';
import { renderHtmlPage, renderFooter } from '../templates/layout.js';

export default (router, { services }) => {
	const { ItemsService } = services;

	router.get('/collections/:usecase?', async (req, res) => {
		try {
			// Check if user is authenticated via accountability or access_token query param
			// Directus sets req.accountability when a valid auth token is present in headers or query
			let isAuthenticated = req.accountability && req.accountability.user;
			
			console.log('Auth check:', {
				hasAccountability: !!req.accountability,
				hasUser: !!(req.accountability && req.accountability.user),
				cookies: req.cookies,
				authHeader: req.headers.authorization,
				queryToken: req.query.access_token ? 'present' : 'missing'
			});
			
			const rawParam = req.params.usecase;
			const showCards = !rawParam;
			
			let usecase = rawParam || 'all';
			if (usecase === 'all-use-cases') {
				usecase = 'all';
			} else if (usecase.startsWith('use-case-')) {
				const useCaseNum = usecase.replace('use-case-', '');
				usecase = USE_CASE_MAP[useCaseNum] || usecase; // e.g., '1' -> '1. Textile Artifacts'
			}

			// If not authenticated, show login message
			if (!isAuthenticated) {
				const content = `
${renderNavbar('collections')}

<!-- Hero Section -->
<div class="hero-section">
    <div class="container">
        <h1>Collections</h1>
        <p>Explore Our Cultural Heritage Archives</p>
    </div>
</div>

<div class="container mb-5">
    <div class="row mt-5">
        <div class="col-12 text-center">
            <div class="alert alert-info" role="alert" style="max-width: 600px; margin: 0 auto;">
                <i class="fas fa-lock fa-3x mb-3"></i>
                <h4>Authentication Required</h4>
                <p>Collections can be accessed with login</p>
                
                <!-- Login Form -->
                <form id="loginForm" class="mt-4">
                    <div class="mb-3">
                        <input type="email" class="form-control form-control-lg" id="email" placeholder="Email" required style="border-radius: 8px;">
                    </div>
                    <div class="mb-3">
                        <input type="password" class="form-control form-control-lg" id="password" placeholder="Password" required style="border-radius: 8px;">
                    </div>
                    <button type="submit" class="btn btn-lg w-100" style="background-color: #53909c; border: none; border-radius: 8px; color: white; font-weight: 500; padding: 12px; transition: all 0.3s ease;" onmouseover="this.style.backgroundColor='#467d88'" onmouseout="this.style.backgroundColor='#53909c'">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                    <div id="loginError" class="alert alert-danger mt-3" style="display: none; border-radius: 8px;"></div>
                    <div id="loginSuccess" class="alert alert-success mt-3" style="display: none; border-radius: 8px;">Login successful! Redirecting...</div>
                </form>

                <script>
                    document.getElementById('loginForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const email = document.getElementById('email').value;
                        const password = document.getElementById('password').value;
                        const errorDiv = document.getElementById('loginError');
                        const successDiv = document.getElementById('loginSuccess');
                        
                        errorDiv.style.display = 'none';
                        successDiv.style.display = 'none';
                        
                        try {
                            // Authenticate with Directus API
                            const response = await fetch('http://localhost:8055/auth/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password }),
                                credentials: 'include'
                            });
                            
                            if (response.ok) {
                                const data = await response.json();
                                // Check if we got an access token
                                const token = data?.data?.access_token || data?.access_token;
                                
                                if (token) {
                                    // Store token in sessionStorage and redirect with token as query param
                                    sessionStorage.setItem('directus_token', token);
                                    
                                    successDiv.style.display = 'block';
                                    // Redirect to same page with token to authenticate
                                    setTimeout(() => {
                                        window.location.href = '/digital-textailes-archieve/collections?access_token=' + token;
                                    }, 1000);
                                } else {
                                    errorDiv.textContent = 'Authentication succeeded but no access token was returned';
                                    errorDiv.style.display = 'block';
                                }
                            } else {
                                const data = await response.json();
                                errorDiv.textContent = data.errors?.[0]?.message || 'Invalid username or password';
                                errorDiv.style.display = 'block';
                            }
                        } catch (error) {
                            errorDiv.textContent = 'Error connecting to Directus: ' + error.message;
                            errorDiv.style.display = 'block';
                        }
                    });
                </script>
            </div>
        </div>
    </div>
</div>

${renderFooter()}`;

				const html = renderHtmlPage({
					title: 'Collections - Digital Textailes Archive',
					content,
					includeModelViewer: false,
					cspPolicy: CSP_POLICY
				});

				res.set('Content-Type', 'text/html');
				res.set('Content-Security-Policy', CSP_POLICY);
				return res.send(html);
			}

    // Get access token from query to pass to links
	const accessToken = req.query.access_token || '';
	const tokenParam = accessToken ? `?access_token=${accessToken}` : '';

	// Connects to Directus database
	const heritageAssetsService = new ItemsService('heritage_assets', {
		schema: req.schema,
		accountability: req.accountability,
	});

	// Fetches all heritage assets from database
	const allHeritageAssets = await heritageAssetsService.readByQuery({
		fields: ['id', 'title', 'gltf_file', 'obj_file', 'obj_files', 'use_case', 'collection', 'source', 'time_period'],
		limit: -1
	});

	// Extract use case number (e.g., from "1. Greek Ancient Textiles" get "1")
	// Since heritageAsset.use_case only contains numbers, we just extract the digit
	const useCaseNumber = usecase !== 'all' ? usecase.match(/\d+/)?.[0] : null;
	
	// Filter heritage assets based on selected use case
	const filteredHeritageAssets = usecase === 'all' 
		? allHeritageAssets 
		: allHeritageAssets.filter(c => matchesByUseCase(c, usecase, useCaseNumber));

    // Generates HTML for each heritage asset card
	const heritageAssetsHtml = filteredHeritageAssets.length
				? filteredHeritageAssets.map(c => `
					<div class="col-md-4 col-sm-6 mb-4">
						<a href="/digital-textailes-archieve/artifact/${c.id}${tokenParam}" class="text-decoration-none">
							<div class="card h-100">
								<div style="height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
									${c.gltf_file || c.obj_file ? `<model-viewer 
										src="/digital-textailes-archieve/assets/${c.gltf_file || c.obj_file}${c.obj_file && c.obj_files ? '?obj_files=' + c.obj_files : ''}"
										alt="${c.title || '3D Model'}"
										auto-rotate
										camera-controls
										style="width: 100%; height: 100%;">
									</model-viewer>` : `<div class="text-muted">No 3D model</div>`}
								</div>
								<div class="card-body">
					<h6 class="card-title">${c.title || 'Untitled'}</h6>
					<span class="badge mb-2" style="color: #265d72;">Heritage Asset</span>
					${c.use_case ? `<p class="text-muted small mb-1">Use Case ${c.use_case}</p>` : ''}
					<small class="text-muted">${c.collection || ''} ${c.time_period ? '• ' + c.time_period : ''}</small>
				</div>
			</div>
		</a>
	</div>
`).join('\n')
	: '';

// Handles empty results (no artifacts match the filter)
const allItemsHtml = heritageAssetsHtml 
	? heritageAssetsHtml
	: '<div class="col-12"><p class="text-muted">No artifacts found for this use case</p></div>';

// Generates grid of 8 use case cards
const useCaseMenu = USE_CASES.map(uc => {
				const isActive = uc.key === usecase.toLowerCase();
				const useCaseNumber = uc.key.match(/^(\d+)\./)?.[1];
				const baseUrl = uc.key === 'all' 
					? '/digital-textailes-archieve/collections/all-use-cases' 
					: `/digital-textailes-archieve/collections/use-case-${useCaseNumber}`;
				const url = baseUrl + tokenParam;
				
			const count = uc.key === 'all' 
				? allHeritageAssets.length
				: allHeritageAssets.filter(c => matchesByUseCase(c, uc.key, useCaseNumber)).length;				const imageUrl = `/digital-textailes-archieve/static/Archieve_files/${uc.image}`;
				
				return `
					<div class="col-md-4 col-sm-6 mb-3">
						<a href="${url}" class="text-decoration-none">
							<div class="card ${isActive ? 'border-primary' : ''}">
								<img src="${imageUrl}" class="card-img-top" alt="${uc.label}" style="height: 150px; object-fit: contain; padding: 10px;">
								<div class="card-body">
									<h6 class="card-title ${isActive ? 'text-primary' : ''}">${uc.label}</h6>
									<p class="card-text text-muted">${count} artifact(s)</p>
								</div>
							</div>
						</a>
					</div>`;
			}).join('\n');

			const content = `
${renderNavbar('collections')}

<!-- Hero Section -->
<div class="hero-section">
    <div class="container">
        <h1>Collections</h1>
        <p>Explore Our Cultural Heritage Archives</p>
    </div>
</div>

<div class="container mb-5">
    <div class="row mt-3">
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 col-lg-10">
			${showCards ? `
				<div class="row mt-4">
					${useCaseMenu}
				</div>
			` : `
				<h2>${usecase === 'all' ? 'All Use Cases' : (USE_CASES.find(uc => uc.key === usecase.toLowerCase())?.label || usecase.toUpperCase())}</h2>
				<p class="text-muted">${filteredHeritageAssets.length} artifact(s) found</p>
				<div class="row mt-4">
					${allItemsHtml}
				</div>
				<p class="mt-3"><a href="/digital-textailes-archieve/collections${tokenParam}">← Back to Collections</a></p>
			`}
		</div>
    </div>
</div>

${renderFooter()}`;

			const html = renderHtmlPage({
				title: 'Collections - Digital Textailes Archive',
				content,
				includeModelViewer: !showCards,
				cspPolicy: CSP_POLICY
			});

			res.set('Content-Type', 'text/html');
			res.set('Content-Security-Policy', CSP_POLICY);
			res.send(html);
		} catch (error) {
			console.error('Collections error:', error);
			res.status(500).send('Error: ' + error.message);
		}
	});
};
