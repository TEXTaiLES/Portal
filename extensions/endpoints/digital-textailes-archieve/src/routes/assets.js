import { PATHS } from '../utils/constants.js';
import { serveFile, mapGltfUris } from '../utils/helpers.js';

const path = require('path');
const fs = require('fs');
const obj2gltf = require('obj2gltf');

export default (router, { services }) => {
	const { ItemsService } = services;

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
			
			// Handle OBJ files - convert to GLB (binary GLTF)
			if (file.type === 'model/obj' || file.filename_download.endsWith('.obj')) {
				try {
					const glb = await obj2gltf(uploadsPath, {
						binary: true, // Output GLB format (binary)
						logger: (msg) => console.log(msg)
					});
					
					res.set('Content-Type', 'model/gltf-binary');
					return res.send(Buffer.from(glb));
				} catch (error) {
					console.error('OBJ to GLB conversion error:', error);
					return res.status(500).send('Error converting OBJ to GLB: ' + error.message);
				}
			}
			
			// Handle GLTF files - rewrite URIs to use proxy
			if (file.type === 'model/gltf+json' || file.filename_download.endsWith('.gltf')) {
				const gltfContent = fs.readFileSync(uploadsPath, 'utf8');
				const gltf = JSON.parse(gltfContent);
				await mapGltfUris(gltf, filesService);
				res.set('Content-Type', 'model/gltf+json');
				return res.send(JSON.stringify(gltf));
			}
			
			// Handle MTL files (material files for OBJ)
			if (file.type === 'model/mtl' || file.filename_download.endsWith('.mtl')) {
				res.set('Content-Type', 'model/mtl');
			}
			
			// Stream other files (bin, jpg, obj, mtl, etc)
			fs.createReadStream(uploadsPath).pipe(res);
		} catch (error) {
			console.error('Asset error:', error);
			res.status(500).send('Error: ' + error.message);
		}
	});
};
