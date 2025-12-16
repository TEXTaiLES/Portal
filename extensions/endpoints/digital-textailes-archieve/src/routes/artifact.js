import { CSP_POLICY, ATON_CONFIG } from '../utils/constants.js';
import { renderNavbar } from '../templates/navbar.js';
import { renderHtmlPage, renderFooter } from '../templates/layout.js';
import { getAtonScene } from '../utils/helpers.js';

export default (router, { services }) => {
	const { ItemsService } = services;

	router.get('/artifact/:id', async (req, res) => {
		try {
			const costumesService = new ItemsService('costumes', {
				schema: req.schema,
				accountability: null,
			});

            // Fetches artifact from database by ID
			const costumes = await costumesService.readByQuery({
				fields: [
					'id', 'title', 'gltf_file', 'obj_file', // e.g., "ben-uuid"
					'obj_files.directus_files_id', // e.g., ["ben-uuid", "ben_ks-uuid"]
					// Identification
					'accession_number', 'reference_name_number', 'material_analyzed',
					// Condition
					'object_status', 'condition_assessment', 'state_of_preservation', 'type_of_preservation',
					// Preventive conservation
					'temperature', 'humidity', 'type_of_container', 'mount', 'result',
					// Interventive conservation
					'conservation_date', 'cleaning', 'introduction_of_foreign_material', 'specific_foreign_material_introduce',
					// Legacy fields
					'creator', 'sensor', 'location', 'source', 'time_period', 'collection', 'use_case'
				],
				filter: { id: { _eq: req.params.id } },
				limit: 1
			});

			if (!costumes || costumes.length === 0) {
				return res.status(404).send('Artifact not found');
			}

			const costume = costumes[0];

			// Build asset URL with obj_files parameter if available
			let modelUrl = '';
			if (costume.gltf_file) {
				modelUrl = `/digital-textailes-archieve/assets/${costume.gltf_file}`;
			} else if (costume.obj_file) {
				// Extract file IDs from obj_files relational field
				const relatedFileIds = costume.obj_files?.map(f => f.directus_files_id).filter(Boolean) || []; // e.g., ["ben-uuid","ben_ks-uuid"]
				if (relatedFileIds.length > 0) {
					modelUrl = `/digital-textailes-archieve/assets/${costume.obj_file}?obj_files=${relatedFileIds.join(',')}`; // Result: "/assets/ben-uuid?obj_files=ben-uuid,ben_ks-uuid"
				} else {
					modelUrl = `/digital-textailes-archieve/assets/${costume.obj_file}`;
				}
			}

			// Build ATON scene URL for this artifact
			// The URL will be used by the "Annotate with THOTH" button
			const sceneId = `artifact_${costume.id}`;
			let atonSceneUrl = `${ATON_CONFIG.BASE_URL}${ATON_CONFIG.THOTH_PATH}?s=${sceneId}`;
			
			// Try to check if scene exists in ATON (optional - will use URL anyway)
			try {
				const sceneData = await getAtonScene(ATON_CONFIG.DEFAULT_USER, sceneId);
				if (sceneData) {
					atonSceneUrl = sceneData.sceneUrl;
				}
			} catch (err) {
				// Scene might not exist yet - that's ok, URL will still work or user can create it
				console.log(`Scene ${sceneId} not found in ATON, but URL will still be provided`);
			}

			const content = `
${renderNavbar('collections')}

<div class="container mb-5">
    <div class="row mt-3">
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 col-lg-10">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="https://textailes-eccch.eu/">Home</a></li>
                    <li class="breadcrumb-item"><a href="/digital-textailes-archieve/collections">Collections</a></li>
                    <li class="breadcrumb-item active" aria-current="page">${costume.title || 'Artifact'}</li>
                </ol>
            </nav>
        </div>
    </div>

    <div class="row mt-3">
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 col-lg-8">
            <div class="mt-3 mb-4">
                <div id="costume-model" style="height: 555px;">
                   <model-viewer
                     src="${modelUrl}"
                     camera-controls
                     auto-rotate
                     environment-image="neutral"
                     exposure="0.7"
                     shadow-intensity="3"
                     tone-mapping="neutral"
                     style="width:100%; height:100%;">
                   </model-viewer>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-12 text-end mb-3">
                    <div class="feature-card" style="display: inline-block;">
                        <button onclick="annotateWithThoth(${costume.id})" class="btn btn-primary">
                            <i class="fas fa-edit"></i> Annotate with THOTH
                        </button>
                    </div>
                </div>
            </div>

            <script>
                /**
                 * Annotate with THOTH - Main function
                 * 
                 * This function:
                 * 1. Shows loading spinner on button
                 * 2. Calls API endpoint to get or create ATON scene
                 * 3. Opens THOTH annotator in new tab with the scene
                 */
                async function annotateWithThoth(artifactId) {
                    const btn = event.target.closest('button');
                    const originalText = btn.innerHTML;
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing scene...';
                    
                    try {
                        // Call endpoint that gets existing scene or creates new one
                        const response = await fetch('/digital-textailes-archieve/aton/scene/' + artifactId + '/url');
                        const data = await response.json();
                        
                        if (data.success) {
                            console.log('Scene data:', data);
                            // Open THOTH with the scene
                            window.open(data.sceneUrl, '_blank');
                        } else {
                            alert('Error: ' + (data.message || 'Failed to prepare scene'));
                        }
                    } catch (error) {
                        alert('Error: ' + error.message);
                    } finally {
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                    }
                }
            </script>

            <div class="row mt-4">
                <!-- Identification Section -->
                <div class="col-12 mb-4">
                    <h4 class="border-bottom pb-2">Identification</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Title:</dt>
                                <dd>${costume.title || 'N/A'}</dd>
                                
                                <dt class="samewidth">ID:</dt>
                                <dd>${costume.id || 'N/A'}</dd>
                                
                                <dt class="samewidth">Accession Number:</dt>
                                <dd>${costume.accession_number || 'N/A'}</dd>
                            </dl>
                        </div>
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Reference Name/Number:</dt>
                                <dd>${costume.reference_namenumber || 'N/A'}</dd>
                                
                                <dt class="samewidth">Material Analyzed:</dt>
                                <dd>${costume.material_analyzed || 'N/A'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <!-- Condition Section -->
                <div class="col-12 mb-4">
                    <h4 class="border-bottom pb-2">Condition</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Object Status:</dt>
                                <dd>${costume.object_status || 'N/A'}</dd>
                                
                                <dt class="samewidth">Condition Assessment:</dt>
                                <dd>${costume.condition_assessment || 'N/A'}</dd>
                            </dl>
                        </div>
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">State of Preservation:</dt>
                                <dd>${costume.state_of_preservation || 'N/A'}</dd>
                                
                                <dt class="samewidth">Type of Preservation:</dt>
                                <dd>${costume.type_of_preservation || 'N/A'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <!-- Preventive Conservation Section -->
                <div class="col-12 mb-4">
                    <h4 class="border-bottom pb-2">Preventive Conservation</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Temperature:</dt>
                                <dd>${costume.temperature ? costume.temperature + '°C' : 'N/A'}</dd>
                                
                                <dt class="samewidth">Humidity:</dt>
                                <dd>${costume.humidity ? costume.humidity + '% RH' : 'N/A'}</dd>
                                
                                <dt class="samewidth">Type of Container:</dt>
                                <dd>${costume.type_of_container || 'N/A'}</dd>
                            </dl>
                        </div>
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Mount:</dt>
                                <dd>${costume.mount || 'N/A'}</dd>
                                
                                <dt class="samewidth">Result:</dt>
                                <dd>${costume.result ? `<a href="${costume.result}" target="_blank">View</a>` : 'N/A'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <!-- Interventive Conservation Section -->
                <div class="col-12 mb-4">
                    <h4 class="border-bottom pb-2">Interventive Conservation</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Conservation Date:</dt>
                                <dd>${costume.conservation_date || 'N/A'}</dd>
                                
                                <dt class="samewidth">Cleaning:</dt>
                                <dd>${costume.cleaning === true ? 'Yes' : costume.cleaning === false ? 'No' : 'N/A'}</dd>
                            </dl>
                        </div>
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Foreign Material Introduced:</dt>
                                <dd>${costume.introduction_of_foreign_material || 'N/A'}</dd>
                                
                                <dt class="samewidth">Specific Foreign Material:</dt>
                                <dd>${costume.specific_foreign_material_introduce || 'N/A'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <!-- Additional Information Section -->
                <div class="col-12 mb-4">
                    <h4 class="border-bottom pb-2">Additional Information</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Use Case:</dt>
                                <dd>${costume.use_case || 'N/A'}</dd>
                                
                                <dt class="samewidth">Collection:</dt>
                                <dd>${costume.collection || 'N/A'}</dd>
                                
                                <dt class="samewidth">Time Period:</dt>
                                <dd>${costume.time_period || 'N/A'}</dd>
                            </dl>
                        </div>
                        <div class="col-md-6">
                            <dl>
                                <dt class="samewidth">Creator:</dt>
                                <dd>${costume.creator || 'N/A'}</dd>
                                
                                <dt class="samewidth">Sensor:</dt>
                                <dd>${costume.sensor || 'N/A'}</dd>
                                
                                <dt class="samewidth">Location:</dt>
                                <dd>${costume.location || 'N/A'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
            
            <p class="mt-3"><a href="/digital-textailes-archieve/collections">← Back to Collections</a></p>
        </div>
        <div class="col-0 col-lg-2"></div>
    </div>
</div>

${renderFooter()}`;

			const html = renderHtmlPage({
				title: `${costume.title || 'Artifact'} - Digital Textailes Archive`,
				content,
				includeModelViewer: true,
				bodyClass: 'id="costume" tabindex="0"',
				cspPolicy: CSP_POLICY
			});

			res.set('Content-Type', 'text/html');
			res.set('Content-Security-Policy', CSP_POLICY);
			res.send(html);
		} catch (error) {
			console.error('Artifact view error:', error);
			res.status(500).send('Error: ' + error.message);
		}
	});
};
