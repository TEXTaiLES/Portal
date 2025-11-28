<template>
	<private-view title="Costumes Gallery">
		<div v-if="loading" class="loading">Loading costumes...</div>
		
		<div v-else class="costumes-grid">
			<div v-for="costume in costumes" :key="costume.id" class="costume-card">
				<h3>{{ costume.title || 'Untitled' }}</h3>
				
				<!-- Display Image -->
				<div v-if="costume.image_file" class="image-container">
					<img :src="getAssetUrl(costume.image_file)" :alt="costume.title" />
				</div>
				
				<!-- Display 3D Model - TODO: Fix CSP issue to enable model-viewer -->
				<!-- <div v-if="costume.gltf_file" class="model-container">
					<model-viewer 
						:src="getAssetUrl(costume.gltf_file)"
						camera-controls 
						auto-rotate
						shadow-intensity="1"
						alt="3D Costume Model"
						style="width: 100%; height: 400px;">
					</model-viewer>
				</div> -->
			</div>
		</div>
	</private-view>
</template>

<script>
import { useApi } from '@directus/extensions-sdk';

export default {
	setup() {
		const api = useApi();
		return { api };
	},
	data() {
		return {
			costumes: [],
			loading: true,
		};
	},
	async mounted() {
		// TODO: Load model-viewer web component once CSP is configured
		// const script = document.createElement('script');
		// script.type = 'module';
		// script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
		// document.head.appendChild(script);
		
		await this.loadCostumes();
	},
	methods: {
		async loadCostumes() {
			try {
				const response = await this.api.get('/items/Costumes', {
					params: {
						fields: ['id', 'title', 'image_file', 'gltf_file']
					}
				});
				this.costumes = response.data.data;
			} catch (error) {
				console.error('Error loading costumes:', error);
			} finally {
				this.loading = false;
			}
		},
		getAssetUrl(fileId) {
			if (!fileId) return '';
			const token = 'MGZhBaIBVHBEmtn_FsK_wDDMGDt2g7hg';
			return `http://localhost:8055/assets/${fileId}?access_token=${token}`;
		}
	}
};
</script>

<style scoped>
.loading {
	text-align: center;
	padding: 40px;
	font-size: 18px;
}

.costumes-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	gap: 20px;
	padding: 20px;
}

.costume-card {
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 10px;
	background: white;
}

.costume-card h3 {
	margin-top: 0;
	margin-bottom: 15px;
}

.image-container {
	margin-bottom: 15px;
	height: 100px;

	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f5f5;
}

.image-container img {
	width: 100%;
	height: 100%;
	object-fit: contain;
	border-radius: 4px;
}

.model-container {
	margin-bottom: 15px;
	background: #f5f5f5;
	border-radius: 4px;
	overflow: hidden;
}

model-viewer {
	display: block;
}
</style>
