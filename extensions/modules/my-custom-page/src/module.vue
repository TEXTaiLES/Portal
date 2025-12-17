<template>
	<private-view title="Heritage Assets Gallery">
		<div v-if="loading" class="loading">Loading heritage assets...</div>
		
		<div v-else class="heritage-assets-grid">
			<div v-for="asset in heritageAssets" :key="asset.id" class="heritage-asset-card">et-card">
				<h3>{{ asset.title || 'Untitled' }}</h3>
				
				<!-- Display Image -->
				<div v-if="asset.image_file" class="image-container">
					<img :src="getAssetUrl(asset.image_file)" :alt="asset.title" />
				</div>
				
				<!-- Display 3D Model - TODO: Fix CSP issue to enable model-viewer -->
				<!-- <div v-if="asset.gltf_file" class="model-container">
					<model-viewer 
						:src="getAssetUrl(asset.gltf_file)"
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
			heritageAssets: [],
			loading: true,
		};
	},
	async mounted() {
		// TODO: Load model-viewer web component once CSP is configured
		// const script = document.createElement('script');
		// script.type = 'module';
		// script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
		// document.head.appendChild(script);
		
		await this.loadHeritageAssets();
	},
	methods: {
		async loadHeritageAssets() {
			try {
				const response = await this.api.get('/items/heritage_assets', {
					params: {
						fields: ['id', 'title', 'image_file', 'gltf_file']
					}
				});
				this.heritageAssets = response.data.data;
			} catch (error) {
				console.error('Error loading heritage assets:', error);
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

.heritage-assets-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	gap: 20px;
	padding: 20px;
}

.heritage-asset-card {
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
