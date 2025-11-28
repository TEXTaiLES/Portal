export default (router, { services }) => {
	const { ItemsService } = services;

	router.get('/', async (req, res) => {
		const artifactsService = new ItemsService('artifacts', {
			schema: req.schema, // Passes the database schema to directus
			accountability: null, // Public access, no authentication
		});

		try {
			const artifacts = await artifactsService.readByQuery({ // Fetch all artifacts
				fields: ['artifact_id', 'title', 'filename', 'public_url', 'drone_id', 'timestamp'],
			});

			// Use the same token as in the module to have access to the files
			//const token = 'vrNIDMzAge5Xd_XwyffjigeL_bUdbfVB';

			const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Artifacts Gallery - Public</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body { 
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			background: #f5f5f5; 
			padding: 20px; 
		}
		.header { 
			text-align: center; 
			padding: 40px 20px; 
			background: white; 
			border-radius: 8px; 
			margin-bottom: 30px; 
		}
		.header h1 { color: #333; font-size: 2.5em; margin-bottom: 10px; }
		.artifacts-grid { 
			display: grid; 
			grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); 
			gap: 20px; 
			max-width: 1400px; 
			margin: 0 auto; 
		}
		.artifact-card { 
			background: white; 
			border-radius: 8px; 
			overflow: hidden; 
			box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
		}
		.artifact-card:hover { transform: translateY(-4px); }
		.artifact-card h3 { 
			padding: 15px; 
			background: #6644ff; 
			color: white; 
		}
		.image-container { 
			height: 200px; 
			display: flex; 
			align-items: center; 
			justify-content: center; 
			background: #f5f5f5; 
		}
		.image-container img { 
			width: 100%; 
			height: 100%; 
			object-fit: contain; 
		}
		.info { padding: 15px; color: #666; line-height: 1.6; font-size: 0.9em; }
		.info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
		.info-label { font-weight: 600; color: #333; }
	</style>
</head>
<body>
	<div class="header">
		<h1>Artifacts Archive</h1>
		<p>Public Collection - ${artifacts.length} items</p>
	</div>
	<div class="artifacts-grid">
		${artifacts.map(artifact => `
			<div class="artifact-card">
				<h3>${artifact.title || 'Untitled'}</h3>
				${artifact.public_url ? `
					<div class="image-container">
						<img src="${artifact.public_url}" alt="${artifact.title || artifact.filename}">
					</div>
				` : `
					<div class="image-container">
						<p style="color: #999;">No preview available</p>
					</div>
				`}
				<div class="info">
					<div class="info-row">
						<span class="info-label">Filename:</span>
						<span>${artifact.filename}</span>
					</div>
					${artifact.drone_id ? `
						<div class="info-row">
							<span class="info-label">Drone:</span>
							<span>${artifact.drone_id}</span>
						</div>
					` : ''}
					<div class="info-row">
						<span class="info-label">Uploaded:</span>
						<span>${new Date(artifact.timestamp).toLocaleDateString()}</span>
					</div>
				</div>
			</div>
		`).join('')}
	</div>
</body>
</html>`;

			res.set('Content-Type', 'text/html');
			res.send(html);
		} catch (error) {
			res.status(500).send('Error: ' + error.message);
		}
	});
};
