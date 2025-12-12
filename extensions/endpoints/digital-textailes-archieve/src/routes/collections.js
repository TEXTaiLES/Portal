import { CSP_POLICY, USE_CASES, USE_CASE_MAP } from '../utils/constants.js';
import { matchesByUseCase } from '../utils/helpers.js';
import { renderNavbar } from '../templates/navbar.js';
import { renderHtmlPage, renderFooter } from '../templates/layout.js';

export default (router, { services }) => {
	const { ItemsService } = services;

	router.get('/collections/:usecase?', async (req, res) => {
		try {
			const rawParam = req.params.usecase;
			const showCards = !rawParam;
			
			let usecase = rawParam || 'all';
			if (usecase === 'all-use-cases') {
				usecase = 'all';
			} else if (usecase.startsWith('use-case-')) {
				const useCaseNum = usecase.replace('use-case-', '');
				usecase = USE_CASE_MAP[useCaseNum] || usecase; // e.g., '1' -> '1. Textile Artifacts'
			}

    // Connects to Directus database
	const costumesService = new ItemsService('costumes', {
		schema: req.schema,
		accountability: null,
	});

	// Fetches all costumes from database
	const allCostumes = await costumesService.readByQuery({
		fields: ['id', 'title', 'gltf_file', 'obj_file', 'use_case', 'collection', 'source', 'time_period'],
		limit: -1
	});

	// Extract use case number
	const useCaseNumber = usecase !== 'all' ? usecase.match(/\d+/)?.[0] : null;
	
	// Filter costumes based on selected use case
	const filteredCostumes = usecase === 'all' 
		? allCostumes 
		: allCostumes.filter(c => matchesByUseCase(c, usecase, useCaseNumber));

    // Generates HTML for each costume card
	const costumesHtml = filteredCostumes.length
				? filteredCostumes.map(c => `
					<div class="col-md-4 col-sm-6 mb-4">
						<a href="/digital-textailes-archieve/artifact/${c.id}" class="text-decoration-none">
							<div class="card h-100">
								<div style="height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
									${c.gltf_file || c.obj_file ? `<model-viewer 
										src="/digital-textailes-archieve/assets/${c.gltf_file || c.obj_file}"
										alt="${c.title || '3D Model'}"
										auto-rotate
										camera-controls
										style="width: 100%; height: 100%;">
									</model-viewer>` : `<div class="text-muted">No 3D model</div>`}
								</div>
								<div class="card-body">
					<h6 class="card-title">${c.title || 'Untitled'}</h6>
					<span class="badge mb-2" style="color: #265d72;">Costume</span>
					${c.use_case ? `<p class="text-muted small mb-1">Use Case ${c.use_case}</p>` : ''}
					<small class="text-muted">${c.collection || ''} ${c.time_period ? '• ' + c.time_period : ''}</small>
				</div>
			</div>
		</a>
	</div>
`).join('\n')
	: '';

// Handles empty results (no artifacts match the filter)
const allItemsHtml = costumesHtml 
	? costumesHtml
	: '<div class="col-12"><p class="text-muted">No artifacts found for this use case</p></div>';

// Generates grid of 8 use case cards
const useCaseMenu = USE_CASES.map(uc => {
				const isActive = uc.key === usecase.toLowerCase();
				const useCaseNumber = uc.key.match(/^(\d+)\./)?.[1];
				const url = uc.key === 'all' 
					? '/digital-textailes-archieve/collections/all-use-cases' 
					: `/digital-textailes-archieve/collections/use-case-${useCaseNumber}`;
				
			const count = uc.key === 'all' 
				? allCostumes.length
				: allCostumes.filter(c => matchesByUseCase(c, uc.key, useCaseNumber)).length;				const imageUrl = `/digital-textailes-archieve/static/Archieve_files/${uc.image}`;
				
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
<div class="hero-section" style="background: url('/digital-textailes-archieve/static/Archieve_files/Hero/the-archeological-parc-of-pompeii-5-1.jpeg') center/cover no-repeat; position: relative; color: white; padding: 60px 0; text-align: center; margin-bottom: 40px;">
    <div style="content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 1;"></div>
    <div class="container" style="position: relative; z-index: 2;">
        <h1 style="font-size: 2.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">Collections</h1>
        <p style="font-size: 1.2rem; opacity: 0.95; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);">Explore Our Cultural Heritage Archives</p>
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
				<p class="text-muted">${filteredCostumes.length} artifact(s) found</p>
				<div class="row mt-4">
					${allItemsHtml}
				</div>
				<p class="mt-3"><a href="/digital-textailes-archieve/collections">← Back to Collections</a></p>
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
