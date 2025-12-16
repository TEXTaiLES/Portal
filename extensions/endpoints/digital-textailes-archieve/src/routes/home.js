import { CSP_POLICY } from '../utils/constants.js';
import { renderNavbar } from '../templates/navbar.js';
import { renderFooter } from '../templates/layout.js';

export default (router, { services }) => {
	const { ItemsService } = services;

	router.get('/', async (req, res) => {
		const costumesService = new ItemsService('costumes', {
			schema: req.schema,
			accountability: null,
		});

		try {
			// Get total artifact count and a featured artifact
			const allCostumes = await costumesService.readByQuery({
				fields: ['id', 'title', 'gltf_file', 'obj_file'],
				limit: -1
			});
			const totalArtifacts = allCostumes.length;
			
			// Get a featured artifact (you can change the ID or make it random)
			const featuredCostume = allCostumes[0] || {};

			const html = `<!DOCTYPE html>
<html lang="en" dir="ltr" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <title>Digital TEXTaiLES Archive</title>
    <link rel="icon" type="image/png" href="/digital-textailes-archieve/static/Archieve_files/Icon-Textailes-Colour-RGB-Ver.png">
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/bootstrap.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/style.css" rel="stylesheet">
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/css/home.css" rel="stylesheet">
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
</head>
<body>

${renderNavbar('home')}

<!-- Hero Section -->
<div class="hero-section">
    <div class="container">
        <h1>Digital TEXTaiLES Archive</h1>
        <p>Preserving Cultural Heritage Through 3D Digitization</p>
    </div>
</div>

<!-- About Section -->
<div class="container">
    <div class="about-section">
        <h2>About TEXTaiLES</h2>
        <p>The TEXTaiLES project aims to preserve and digitize cultural heritage artifacts through advanced 3D scanning and AI-powered reconstruction techniques. Our archive brings together ancient textiles, archaeological finds, and museum collections, making them accessible to researchers and the public worldwide.</p>
    </div>

    <!-- Features Grid -->
    <div class="row mb-5">
        <!-- Collections Card -->
        <div class="col-md-4 mb-4">
            <div class="card feature-card">
                <div class="card-body text-center">
                    <div class="mb-3">
                        <img src="/digital-textailes-archieve/static/Archieve_files/Icons/explore_collections_icon.png" alt="Explore Collections" style="width: 80px; height: 80px;">
                    </div>
                    <h3>Explore Collections</h3>
                    <p>Browse 8 use cases featuring ancient textiles, archaeological artifacts, and museum collections digitized in 3D.</p>
                    <a href="/digital-textailes-archieve/collections" class="btn btn-primary">View Collections</a>
                </div>
            </div>
        </div>

        <!-- Toolbox Card -->
        <div class="col-md-4 mb-4">
            <div class="card feature-card">
                <div class="card-body text-center">
                    <div class="mb-3">
                        <img src="/digital-textailes-archieve/static/Archieve_files/Icons/toolbox_icon.png" alt="Digital Toolbox" style="width: 80px; height: 80px;">
                    </div>
                    <h3>Digital Toolbox</h3>
                    <p>Explore our comprehensive suite of tools, including our robotic imaging system, 3D reconstruction pipeline, annotation platform, and AI-powered detection, segmentation, and classification tools. Access GitHub repositories, detailed documentation, and live demos to test and implement these solutions for your own projects.</p>
                    <a href="/digital-textailes-archieve/toolbox" class="btn btn-primary">Explore Tools</a>
                </div>
            </div>
        </div>

        <!-- Featured Artifact Card -->
        <div class="col-md-4 mb-4">
            <div class="card feature-card">
                <div class="card-body">
                    <h3 class="text-center">Featured Artifact</h3>
                    <div class="model-viewer-container">
                        <model-viewer 
                            src="/digital-textailes-archieve/assets/${featuredCostume.gltf_file || featuredCostume.obj_file || ''}"
                            alt="Featured Artifact"
                            auto-rotate
                            camera-controls
                            style="width: 100%; height: 100%;">
                        </model-viewer>
                    </div>
                    <div class="text-center mt-3">
                        <p class="mb-2"><strong>${featuredCostume.title || 'Explore our collection'}</strong></p>
                        <a href="/digital-textailes-archieve/artifact/${featuredCostume.id || '1'}" class="btn btn-primary btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Statistics Bar -->
<div class="stats-bar">
    <div class="container">
        <div class="row">
            <div class="col-md-4 stat-item">
                <div class="stat-number">${totalArtifacts}</div>
                <div class="stat-label">Digitized Artifacts</div>
            </div>
            <div class="col-md-4 stat-item">
                <div class="stat-number">8</div>
                <div class="stat-label">Use Cases</div>
            </div>
            <div class="col-md-4 stat-item">
                <div class="stat-number">6</div>
                <div class="stat-label">Our Tools</div>
            </div>
        </div>
    </div>
</div>

<div class="container mb-5"></div>

${renderFooter()}

<script src="/digital-textailes-archieve/static/Archieve_files/jquery-3.6.0.min.js.download"></script>
<script src="/digital-textailes-archieve/static/Archieve_files/bootstrap.bundle.min.js.download"></script>
</body>
</html>`;

			res.set('Content-Type', 'text/html');
			res.set('Content-Security-Policy', CSP_POLICY);
			res.send(html);
		} catch (error) {
			console.error('Root route error:', error);
			res.status(500).send('Error: ' + error.message);
		}
	});
};
