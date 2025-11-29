// Configuration and constants
const CONTENT_TYPES = {
	'.ico': 'image/x-icon',
	'.css': 'text/css',
	'.js': 'application/javascript',
	'.download': 'application/javascript',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.svg': 'image/svg+xml',
	'.gif': 'image/gif',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.eot': 'application/vnd.ms-fontobject'
};

const PATHS = {
	STATIC_ROOT: '/directus/extensions/endpoints/digital-textailes-archieve/static/Archieve_files',
	UPLOADS_ROOT: '/directus/uploads',
	FAVICON: 'Icon-Textailes-Colour-RGB-Ver.png'
};

const CSP_POLICY = "default-src 'self'; script-src 'self' 'unsafe-eval' https://ajax.googleapis.com; script-src-elem 'self' https://ajax.googleapis.com; connect-src 'self' https://ajax.googleapis.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; worker-src 'self' blob:; child-src 'self' blob:;";

export default (router, { services }) => {
	const { ItemsService } = services;
	const fs = require('fs');
	const path = require('path');

	// Helper: Serve a file with proper content type
	const serveFile = (filePath, res, contentTypeOverride = null) => {
		if (!fs.existsSync(filePath)) {
			return res.status(404).send('File not found');
		}
		const ext = path.extname(filePath).toLowerCase();
		const contentType = contentTypeOverride || CONTENT_TYPES[ext];
		if (contentType) {
			res.set('Content-Type', contentType);
		}
		const fileContent = fs.readFileSync(filePath);
		res.send(fileContent);
	};

	// Helper: Map GLTF URIs to file IDs
	const mapGltfUris = async (gltf, filesService) => {
		const allFiles = await filesService.readByQuery({
			fields: ['id', 'filename_download'],
			limit: -1
		});

		const fileMap = new Map(allFiles.map(f => [f.filename_download, f.id]));

		const updateUri = (item) => {
			if (item.uri && !item.uri.startsWith('data:')) {
				const filename = path.basename(item.uri);
				const fileId = fileMap.get(filename);
				if (fileId) {
					item.uri = fileId;
				}
			}
		};

		gltf.buffers?.forEach(updateUri);
		gltf.images?.forEach(updateUri);

		return gltf;
	};

	// Route: Serve static files
	router.get('/static/Archieve_files/*', (req, res) => {
		const requestedPath = req.params[0];
		const staticPath = path.join(PATHS.STATIC_ROOT, requestedPath);
		serveFile(staticPath, res);
	});

	// Route: Serve favicon
	router.get('/favicon.ico', (req, res) => {
		const faviconPath = path.join(PATHS.STATIC_ROOT, PATHS.FAVICON);
		serveFile(faviconPath, res, 'image/png');
	});

	// Route: Proxy endpoint to serve assets publicly
	router.get('/assets/:fileId', async (req, res) => {
		try {
			const filesService = new ItemsService('directus_files', {
				schema: req.schema,
				accountability: null,
			});
			const file = await filesService.readOne(req.params.fileId);
			if (!file) {
				return res.status(404).send('File not found');
			}
			const uploadsPath = path.join(PATHS.UPLOADS_ROOT, file.filename_disk);
			if (!fs.existsSync(uploadsPath)) {
				return res.status(404).send('File not found on disk');
			}
			res.set('Content-Type', file.type || 'application/octet-stream');
			res.set('Access-Control-Allow-Origin', '*');
			// Handle GLTF files - rewrite URIs to use proxy
			if (file.type === 'model/gltf+json' || file.filename_download.endsWith('.gltf')) {
				const gltfContent = fs.readFileSync(uploadsPath, 'utf8');
				const gltf = JSON.parse(gltfContent);
				await mapGltfUris(gltf, filesService);
				res.set('Content-Type', 'model/gltf+json');
				return res.send(JSON.stringify(gltf));
			}
			// Stream other files (bin, jpg, etc)
			fs.createReadStream(uploadsPath).pipe(res);
		} catch (error) {
			console.error('Asset error:', error);
			res.status(500).send('Error: ' + error.message);
		}
	});

	router.get('/', async (req, res) => {
		const costumesService = new ItemsService('costumes', {
			schema: req.schema,
			accountability: null,
		});
		try {
			const costumes = await costumesService.readByQuery({
				fields: ['id', 'title', 'gltf_file', 'creator', 'sensor', 'location', 'source', 'time_period'],
				filter: { id: { _eq: 1 } },
			});
			const costume = costumes[0] || {};
			const html = `<!DOCTYPE html>
<html lang="en" dir="ltr" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <title>Digital Textailes Archive</title>
    
    <!-- Favicon with cache busting -->
    <link rel="icon" type="image/png" href="/digital-textailes-archieve/static/Archieve_files/Icon-Textailes-Colour-RGB-Ver.png">
    
	<!-- Bootstrap CSS -->
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/bootstrap.css" rel="stylesheet">
    
    <!-- Fontawesome -->
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/all.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/style.css" rel="stylesheet">
    
    <!-- Model Viewer -->
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
</head>

<body id="costume" tabindex="0">

<nav id="menu" class="ntnavbar navbar-expand-lg" aria-label="navbar">
    <div class="container">
        <div class="row mt-1">
            <div class="col-md-2 col-sm-12">
                <a class="navbar-brand" href="https://textailes-eccch.eu/">
                    <img src="/digital-textailes-archieve/static/Archieve_files/Logo-Textailes_Logo-Textailes-Colour-RGB-Hor.svg" alt="Logo" style="margin-top: 10%;">
                </a>
            </div>
            <div class="col-md-10 col-sm-12 text-end">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMenu">
                    <span class="navbar-toggler-icon"><i class="fas fa-bars"></i></span>
                </button>
                <div class="collapse navbar-collapse horizontal_border" id="navbarMenu">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0 nt_mtop text-uppercase">
                        <li class="nav-item">
                            <a class="firstnav nav-link py-1" href="/digital-textailes-archieve">Artifacts</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</nav>

<div class="container mb-5">
    <div class="row mt-3">
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 col-lg-10">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="https://textailes-eccch.eu/">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">
                        <span class="breadCurrent">${costume.title || 'Artifact'}</span>
                    </li>
                </ol>
            </nav>
        </div>
    </div>

    <div class="row">
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 col-lg-10">
            <div class="mt-5 mb-5">
                <div id="costume-model" style="height: 555px;">
                    <model-viewer 
                        src="/digital-textailes-archieve/assets/${costume.gltf_file}"
                        alt="${costume.title || '3D Costume Model'}"
                        camera-controls 
                        auto-rotate
                        shadow-intensity="1"
                        style="width: 100%; height: 100%;">
                    </model-viewer>
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-5">
        <div class="col-lg-2 col-sm-0 col-md-0"></div>
        <div class="col-lg-5 col-sm-12 col-md-12 mb-2">
            <dl>
                <dt class="samewidth">Title:</dt>
                <dd>${costume.title || 'N/A'}</dd>
                
                <dt class="samewidth">Creator:</dt>
                <dd>${costume.creator || 'N/A'}</dd>
                
                <dt class="samewidth">ID:</dt>
                <dd>${costume.id || 'N/A'}</dd>
            </dl>
        </div>
        <div class="col-lg-5 col-sm-12 col-md-12 mb-2">
            <dl>
                <dt class="samewidth">Time Period:</dt>
                <dd>${costume.time_period || 'N/A'}</dd>
                
                <dt class="samewidth">Sensor:</dt>
                <dd>${costume.sensor || 'N/A'}</dd>
                
                <dt>Location:</dt>
                <dd>${costume.location || 'N/A'}</dd>
                
                <dt>Source:</dt>
                <dd>${costume.source || 'N/A'}</dd>
            </dl>
        </div>
    </div>
</div>

<footer class="footer mt-auto">
    <div class="dark-footer h-75">
        <div class="container py-4">
            <div class="row dark-footer">
                <div class="col-lg-4 col-md-4 col-sm-12 vertical-line-right text-lg-start text-sm-center py-2">
                    <p class="pt-4">
                        <a href="https://textailes-eccch.eu/">
                            <img src="/digital-textailes-archieve/static/Archieve_files/EN_FundedbytheEU_RGB_NEG-1024x228.png" style="max-width: 350px;">
                        </a>
                    </p>
					<div class="footerLink pt-1">
                        <p>TEXTaiLES is a project funded by the European Commission under Grant Agreement n.101158328. The views and opinions expressed in this website are the sole responsibility of the author and do not necessarily reflect the views of the European Commission.</p>
                        <p><small><br>
                        <br>
                        <br>
                        <a class="plainlink" href="mailto:archive@n-t.gr" title="contact us" alt="contact mail"></a></small></p>                     </div>
                </div>
                <div class="col-lg-4 col-md-4 col-sm-12 vertical-line-right text-lg-start text-sm-center pt-4">
                    <p class="pt-4">
                        <a href="https://textailes-eccch.eu/">
                            <img src="/digital-textailes-archieve/static/Archieve_files/ECHOES_Logo_White_Horizontal_300x300-1024x221.png" style="max-width: 300px;">
                        </a>
                    </p>
					<p>TEXTaiLES is part of the ECCCH initiative.</p>
                </div>
                <div class="col-lg-4 col-md-4 col-sm-12 text-lg-start text-sm-center pt-4">
                    <p class="pt-4">
                        <a href="https://textailes-eccch.eu/">
                            <img src="/digital-textailes-archieve/static/Archieve_files/WBF_SBFI_EU_Frameworkprogramme_E_RGB_neg_hoch.png" style="max-width: 350px;">
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</footer>

<script src="/digital-textailes-archieve/static/Archieve_files/jquery-3.6.0.min.js.download"></script>
<script src="/digital-textailes-archieve/static/Archieve_files/bootstrap.bundle.min.js.download"></script>

</body>
</html>`;

			res.set('Content-Type', 'text/html');
			res.set('Content-Security-Policy', CSP_POLICY);
			res.send(html);
		} catch (error) {
			res.status(500).send('Error: ' + error.message);
		}
	});
};
