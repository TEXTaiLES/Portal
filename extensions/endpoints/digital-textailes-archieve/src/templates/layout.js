export const renderFooter = () => `
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
                        <a class="plainlink" href="mailto:archive@n-t.gr" title="contact us" alt="contact mail"></a></small></p>
                    </div>
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
</footer>`;

export const renderHtmlPage = ({ title, content, includeModelViewer = false, bodyClass = '', cspPolicy }) => `<!DOCTYPE html>
<html lang="en" dir="ltr" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
    <title>${title}</title>
    <link rel="icon" type="image/png" href="/digital-textailes-archieve/static/Archieve_files/Icon-Textailes-Colour-RGB-Ver.png">
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/bootstrap.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/style.css" rel="stylesheet">
    <link type="text/css" href="/digital-textailes-archieve/static/Archieve_files/css/home.css" rel="stylesheet">
    ${includeModelViewer ? '<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>' : ''}
</head>
<body${bodyClass ? ` ${bodyClass}` : ''}>

${content}

<script src="/digital-textailes-archieve/static/Archieve_files/jquery-3.6.0.min.js.download"></script>
<script src="/digital-textailes-archieve/static/Archieve_files/bootstrap.bundle.min.js.download"></script>
</body>
</html>`;
