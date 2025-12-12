/**
 * ATON API Integration Routes
 * 
 * These endpoints integrate with ATON server REST API v2 to:
 * - Create scenes with 3D models (POST /aton/scene/:artifactId)
 * - Retrieve existing scenes (GET /aton/scene/:artifactId)
 * - List all scenes (GET /aton/scenes)
 * - Get or create scene URL (GET /aton/scene/:artifactId/url)
 * 
 */

import { createAtonScene, getAtonScene, listAtonScenes } from '../utils/helpers.js';
import { ATON_CONFIG } from '../utils/constants.js';

export default (router, { services }) => {
	const { ItemsService } = services;

	/**
	 * POST /aton/scene/:artifactId
	 * 
	 * Creates a new scene in ATON with the artifact's 3D model
	 * Calls ATON API: POST /api/v2/scenes/
	 */
	router.post('/aton/scene/:artifactId', async (req, res) => {
		try {

            // Connects to Directus database
			const costumesService = new ItemsService('costumes', {
				schema: req.schema,
				accountability: null,
			});

            // Fetches all costumes from database
			const costumes = await costumesService.readByQuery({
				fields: ['id', 'title', 'gltf_file', 'obj_file'],
				filter: { id: { _eq: req.params.artifactId } },
				limit: 1
			});

			if (!costumes || costumes.length === 0) {
				return res.status(404).json({ error: 'Artifact not found' });
			}

			const costume = costumes[0];
			const modelFile = costume.gltf_file || costume.obj_file;
			
			if (!modelFile) {
				return res.status(400).json({ error: 'No 3D model available for this artifact' });
			}

			// Construct the full URL to the model
			const baseUrl = `${req.protocol}://${req.get('host')}`;
			const modelUrl = `${baseUrl}/digital-textailes-archieve/assets/${modelFile}`;

			// Call ATON API v2 to create the scene
			const sceneData = await createAtonScene(
				costume.id,
				costume.title,
				modelUrl
			);

			res.json({
				...sceneData,
				artifactId: costume.id,
				artifactTitle: costume.title,
				modelUrl: modelUrl
			});

		} catch (error) {
			console.error('Create ATON scene error:', error);
			res.status(500).json({ 
				error: 'Failed to create ATON scene',
				message: error.message 
			});
		}
	});

	/**
	 * GET /aton/scene/:artifactId
	 * 
	 * Retrieves an existing scene from ATON
	 * Calls ATON API: GET /api/v2/scenes/{user}/{sceneId}
	 * Returns 404 if scene doesn't exist
	 */
	router.get('/aton/scene/:artifactId', async (req, res) => {
		try {
			// Build scene ID from artifact ID
			const sceneId = `artifact_${req.params.artifactId}`;
			const user = req.query.user || ATON_CONFIG.DEFAULT_USER;

			// Call ATON API v2 to get the scene
			const sceneData = await getAtonScene(user, sceneId);

			if (!sceneData) {
				return res.status(404).json({ 
					error: 'Scene not found',
					message: `Scene ${sceneId} not found for user ${user}. You may need to create it first.`,
					createEndpoint: `/digital-textailes-archieve/aton/scene/${req.params.artifactId}`
				});
			}

			res.json(sceneData);

		} catch (error) {
			console.error('Get ATON scene error:', error);
			res.status(500).json({ 
				error: 'Failed to get ATON scene',
				message: error.message 
			});
		}
	});

	/**
	 * GET /aton/scenes
	 * 
	 * Lists all public scenes from ATON server
	 * Calls ATON API: GET /api/v2/scenes/
	 */
	router.get('/aton/scenes', async (req, res) => {
		try {
			// Fetch all public scenes from ATON
			const scenesData = await listAtonScenes();

			res.json({
				...scenesData,
				baseUrl: ATON_CONFIG.BASE_URL,
				thothPath: ATON_CONFIG.THOTH_PATH
			});

		} catch (error) {
			console.error('List ATON scenes error:', error);
			res.status(500).json({ 
				error: 'Failed to list ATON scenes',
				message: error.message 
			});
		}
	});

	/**
	 * GET /aton/scene/:artifactId/url
	 * 
	 * Convenience endpoint that:
	 * 1. Tries to get existing scene from ATON
	 * 2. If not found, creates a new scene
	 * 3. Returns the scene URL for THOTH annotator
	 * 
	 * This is the main endpoint used by the "Annotate with THOTH" button
	 */
	router.get('/aton/scene/:artifactId/url', async (req, res) => {
		try {
			// Get artifact data from Directus database
			const costumesService = new ItemsService('costumes', {
				schema: req.schema,
				accountability: null,
			});

			const costumes = await costumesService.readByQuery({
				fields: ['id', 'title', 'gltf_file', 'obj_file'],
				filter: { id: { _eq: req.params.artifactId } },
				limit: 1
			});

			if (!costumes || costumes.length === 0) {
				return res.status(404).json({ error: 'Artifact not found' });
			}

			const costume = costumes[0];
			const sceneId = `artifact_${costume.id}`;
			const user = req.query.user || ATON_CONFIG.DEFAULT_USER;

			// Try to get existing scene from ATON
			let sceneData = await getAtonScene(user, sceneId);

			// If doesn't exist, create it
			if (!sceneData) {
				const modelFile = costume.gltf_file || costume.obj_file;
				
				if (!modelFile) {
					return res.status(400).json({ error: 'No 3D model available' });
				}

				const baseUrl = `${req.protocol}://${req.get('host')}`;
                // Build model URL
				const modelUrl = `${baseUrl}/digital-textailes-archieve/assets/${modelFile}`;

				sceneData = await createAtonScene(costume.id, costume.title, modelUrl);
			}

			res.json({
				...sceneData,
				artifactId: costume.id,
				artifactTitle: costume.title
			});

		} catch (error) {
			console.error('Get/create scene URL error:', error);
			res.status(500).json({ 
				error: 'Failed to get scene URL',
				message: error.message 
			});
		}
	});
};
