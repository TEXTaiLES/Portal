import { CSP_POLICY } from '../utils/constants.js';
import { renderNavbar } from '../templates/navbar.js';
import { renderHtmlPage, renderFooter } from '../templates/layout.js';

export default (router) => {
	router.get('/toolbox', async (req, res) => {
		try {
			const tools = [
				{ name: 'AmalthAI', image: 'Logos/AmalthAI_Logo.png', links: [
					{ label: 'Documentation', url: 'https://textailes.github.io/AmalthAI-documentation/' },
					{ label: 'GitHub', url: 'https://github.com/TEXTaiLES/AmalthAI' },
					{ label: 'Server', url: '#' }
				]},
				{ name: 'THOTH', image: 'Logos/thoth-logo.png', links: [
					{ label: 'Documentation', url: 'https://textailes.github.io/thoth-documentation/' },
					{ label: 'GitHub', url: 'https://github.com/TEXTaiLES/THOTH' },
					{ label: 'Server', url: '#' }
				]},
				{ name: 'ZEUSbot', image: 'Icon-Textailes-Colour-RGB-Ver.png', links: [
					{ label: 'Documentation', url: 'https://textailes.github.io/UGV-documentation/' },
					{ label: 'GitHub', url: 'https://github.com/TEXTaiLES/ZEUSbot' },	
				]},
				{ name: 'NEFELE', image: 'Logos/nephele_logo_2.png', links: [
					{ label: 'Documentation', url: 'https://textailes.github.io/SAMplify_SuGaR-documentation/' },
					{ label: 'GitHub', url: 'https://github.com/TEXTaiLES/SAMplify_SuGaR' },
					{ label: 'Server', url: '#' }
				]},
				{ name: 'HESTIA', image: 'Icon-Textailes-Colour-RGB-Ver.png', links: [
					{ label: 'Documentation', url: 'http://textailes.athenarc.gr:5000/docs' },
					{ label: 'GitHub', url: 'https://github.com/TEXTaiLES/HESTIA' },
					{ label: 'Server', url: '#' }
				]},
				{ name: 'INDRA', image: 'Logos/env_cond_mon_logo.png', links: [
					{ label: 'Documentation', url: 'https://textailes.github.io/Environmental-Condition-Monitoring-documentation/' },
					{ label: 'GitHub', url: 'https://github.com/TEXTaiLES/Environmental-Condition-Monitoring' },
					{ label: 'Server', url: '#' }
				]}
			];

			const toolsHtml = tools.map(tool => {
                // Builds image URL from tool.image
				const imageUrl = `/digital-textailes-archieve/static/Archieve_files/${tool.image}`;
				// Creates HTML links (Documentation, GitHub, Server)
                const linksHtml = tool.links.map(link => 
					`<div><a href="${link.url}" class="text-decoration-none text-primary small">${link.label}</a></div>`
				).join('');
				
                // Returns HTML card for this tool
				return `
					<div class="col-md-6 mb-3">
						<div class="card">
							<div class="card-body">
								<div class="row align-items-center">
									<div class="col-3">
										<img src="${imageUrl}" alt="${tool.name}" class="img-fluid" style="max-height: 80px; object-fit: contain;">
									</div>
									<div class="col-5">
										<h5 class="card-title mb-0">${tool.name}</h5>
									</div>
									<div class="col-4 text-end">
										${linksHtml}
									</div>
								</div>
							</div>
						</div>
					</div>`;
			}).join('\n');

			const content = `
${renderNavbar('toolbox')}

<!-- Hero Section -->
<div class="hero-section" style="background: url('/digital-textailes-archieve/static/Archieve_files/Hero/the-archeological-parc-of-pompeii-5-1.jpeg') center/cover no-repeat; position: relative; color: white; padding: 60px 0; text-align: center; margin-bottom: 40px;">
    <div style="content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); z-index: 1;"></div>
    <div class="container" style="position: relative; z-index: 2;">
        <h1 style="font-size: 2.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">Digital Toolbox</h1>
        <p style="font-size: 1.2rem; opacity: 0.95; text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);">Our Tools for Cultural Heritage</p>
    </div>
</div>

<div class="container mb-5">
    <div class="row mt-3">
        <div class="col-0 col-lg-2"></div>
        <div class="col-12 col-lg-10">
			<div class="row mt-4">
				${toolsHtml}
			</div>
			<p class="mt-3"><a href="/digital-textailes-archieve">Back to Home</a></p>
        </div>
    </div>
</div>

${renderFooter()}`;

			const html = renderHtmlPage({
				title: 'Toolbox - Digital Textailes Archive',
				content,
				cspPolicy: CSP_POLICY
			});

			res.set('Content-Type', 'text/html');
			res.set('Content-Security-Policy', CSP_POLICY);
			res.send(html);
		} catch (error) {
			console.error('Toolbox error:', error);
			res.status(500).send('Error: ' + error.message);
		}
	});
};
