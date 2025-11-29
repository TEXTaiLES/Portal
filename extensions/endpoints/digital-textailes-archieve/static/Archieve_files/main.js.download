
document.addEventListener(
    "DOMContentLoaded", function (event) {
        //console.log('%c© Athena R.C.', "font-size: 31px; font-family: impact, arial, helvetica, sans-serif; font-weight: bold; color: #ff0000;")
        ajaxifyForms();
        ajaxModals();
        ajaxActions();
        ajaxTables();
        //enableTooltips();
        //stickIt();
        stickyHeader();
        checkCookie();

        var btn = $('#top_button');
        $(window).scroll(function() {
            if ($(this).scrollTop()) {
                $('#top_button').fadeIn();
            } else {
                $('#top_button').fadeOut();
            }
        });

        btn.on('click', function(e) {
            e.preventDefault();
            $('html, body').animate({scrollTop:0}, '300');
        });

        // Empty modal on close
        var myModalEl = document.getElementById('Modal')
        myModalEl.addEventListener('hidden.bs.modal', function (event) {
            document.querySelector('.modal-content').innerHTML = "";
        })

        $("a.cookieConsentOK").click(function () {
            console.log("on");
            const d = new Date();
            var exdays=14;
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            console.log(expires);
            document.cookie = "NTCONSENT=yes; expires="+expires+";/";
            $("#cookieConsent").css("display","none");

        });


    }
);

function checkCookie() {
    let consentCookie = getCookie('NTCONSENT');
    //console.log(consentCookie);
    if (consentCookie == "" || consentCookie == null) {
        $("#cookieConsent").css("display","block");
    } else {
        $("#cookieConsent").css("display","none");
    }
}
function getConsentCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    // unescape has been deprecated, replaced with decodeURI
    return decodeURI(dc.substring(begin + prefix.length, end));
}


async function ajaxifyForms($selector = '')
{
    await new Promise(r => setTimeout(r, 100));  // Bloody Hell
    $($selector + " form[data-ajax]").submit(
        function (event) {
            event.preventDefault();
            const frm = $(this);
            $.ajax(
                {
                    type: frm.attr('method'),
                    url: frm.attr('action'),
                    data: frm.serialize()
                }
            ).done(
                function ( data ) {
                    try {
                        data = $.parseJSON(data);
                        showToast(data.flag, data.msg);
                        //$('#Modal').modal('hide');
                    } catch (e) {
                        alert(e.message);
                    }
                }
            ).fail(
                function ( data ) {
                    showToast(2, "Some error occurred");
                }
            );
        }
    );
}


// Modals with ajax content
function ajaxModals($selector = '') {
    $(document).on('click', $selector + ' a[data-bs-toggle="modal"][data-ajax], ' + $selector + ' button[data-bs-toggle="modal"][data-ajax]',
        function (event) {
            event.preventDefault();
            //event.stopPropagation();
            $url = '404.html';
            if ($(this)[0].hasAttribute("href")) {
                $url = $(this).attr('href');
            } else if ($(this)[0].hasAttribute("data-href")) {
                $url = $(this).attr('data-href');
            }
            refreshMe = $(this).attr('data-refresh');

            $.ajax(
                {
                    url: $url,
                    type: 'get',
                    context: this,
                    success: function (response) {
                        $('#Modal .modal-content').empty().html(response);
                        $('#Modal').modal('show');
                    }
                }
            );
        }
    );
}

// Sticky menu
function stickIt() {
    if ($('#stickyMenu')[0]) {
        console.log($('#stickyMenu'));
        var lastScrollTop = 0;
        $(window).scroll(function (event) {
            var st = $(this).scrollTop();
            var targetOffset = $("#menu").offset().top;
            // if (  $(window).scrollTop() > targetOffset ) {
            //     $("#photoThumb").removeClass('d-none');
            // }
            if (st > lastScrollTop) {
                $("#menu").addClass('d-none');
                $(".menuThumb").addClass('d-none');
                $("#stickyMenu").addClass('newMarginTop');
                $(".breadcrumb").addClass('d-none');
                $("#iconCollect").removeClass('d-none');
                $("#mainContent").removeClass('fromHeader').addClass('fromHeaderSm');
                $("#listCollect").addClass('d-none');
                $("#playProd").addClass('d-none');


                // downscroll code
            } else {
                $("#mainContent").addClass('fromHeader');
                $("#menu").removeClass('d-none');
                $(".menuThumb").removeClass('d-none');
                $("#stickyMenu").removeClass('newMarginTop');
                $(".breadcrumb").removeClass('d-none');
                $("#iconCollect").addClass('d-none');
                $("#listCollect").removeClass('d-none');
                $("#playProd").removeClass('d-none');
                $("#forScroll").removeClass('noMarginTop');
                $("#mainContent").addClass('fromHeader').removeClass('fromHeaderSm');

            }
            lastScrollTop = st;
        });
    }
}

function stickyHeader() {
    if ($('#subnav')[0]) {
        const subnav = document.getElementById('subnav');
        const stickyWrapper = document.getElementById('sticky-wrapper');
        //const subnavOffsetTop = $(stickyWrapper).offset().top; //stickyWrapper.offsetTop;

        function toggleSticky(w) {
            subnavOffsetTop = $(stickyWrapper).offset().top;
            //console.log(stickyWrapper.classList.contains('isSticky'));

            //if ($(window).scrollTop() >= parseInt(subnavOffsetTop) + 10 && !stickyWrapper.classList.contains('isSticky')) {
            if ($(window).scrollTop() >= parseInt($(stickyWrapper).height()) + 10 && !stickyWrapper.classList.contains('isSticky')) {
                stickyWrapper.classList.add('isSticky');
                //$('.block').find('h2').removeClass('pseudo_border');
                //window.scrollBy(0, window.scrollY + 20);
                //console.log("down: " + window.scrollY);
                //stickyWrapper.style.height = subnav.offsetHeight + 'px'; // Maintain layout
                return;
            } 
            else 
            if ($(window).scrollTop() < ($(stickyWrapper).height() - 10) && stickyWrapper.classList.contains('isSticky')) {  //
                //console.log("up: " + window.scrollY);
                stickyWrapper.classList.remove('isSticky');
                //$('.block').find('h2').addClass('pseudo_border');
                //stickyWrapper.style.height = 'auto'; // Reset to auto height
                return;
            }
        }

        // Listen for scroll events to toggle the sticky class
        window.addEventListener('scroll', function() { setTimeout(toggleSticky, 100); } );
    }
}

//ajax actions
function ajaxActions($selector = '')
{
    $(document).on( 'click', $selector + ' a[data-ajax]:not([data-bs-toggle="modal"]), button[data-ajax]:not([data-bs-toggle="modal"])',
        function(event) {

            /*if (!'radio,checkbox'.includes(event.target.type)) {
                  event.preventDefault();
            }*/
            event.preventDefault();
            //event.stopImmediatePropagation()
            event.stopPropagation();
            //console.log(event.target);

            if ($(this).is('[data-confirm]') ) {
                if (!confirm('Είστε σίγουροι;') ) {
                    return false;
                }
            }

            //code for refresh table after delete


            let $url = '';
            if ($(this)[0].hasAttribute("href") ) {
                $url = $(this).attr('href');
            } else if ($(this)[0].hasAttribute("data-href") ) {
                $url = $(this).attr('data-href');
            }
            if (!$url.length) { return false; }
            $.ajax(
                {
                    url:    $url,
                    type:   'get',
                    context: this
                }
            ).done(
                function ( data ) {
                    try {
                        data = $.parseJSON(data);
                    } catch (e) {
                        showToast(2, "Some error occurred. Check console.");
                        console.debug(e.message);
                        return false;
                    }
                    showToast(data.flag, data.msg);
                    if ($(this)[0].hasAttribute("data-delete") && data.flag == 1 ) {
                        toDelete = $(this).closest($(this).attr('data-delete'));
                        table = $(toDelete).closest('table');
                        // inform datatable lib
                        if ($.fn.DataTable.isDataTable(table) ) {
                            var table = table.DataTable();
                            table.row(toDelete).remove().draw();
                        } else {
                            toDelete.remove();
                        }
                        //if ($(this)[0].hasAttribute("data-redraw") ) {
                        refreshMe = $(this).attr('data-refresh');
                        refreshTbl();
                        console.log(refreshMe);
                        //}

                    }
                }
            ).fail(
                function ( data ) {
                    showToast(2, "Some error occurred. Check console.");
                    console.debug(data);
                }
            );
        }
    );
}

function refreshTbl()
{

    if (refreshMe == null) {
        return;
    }

    $('#' + refreshMe).each(
        function () {

            let url = $(this).attr('data-fetched');
            ajaxTblAction.call(this, url);
        }
    );
    refreshMe = null;
}

// Alerts
function showToast(flag, msg)
{

    let flag_color = '<span class="flag_okheader"><i class="fa-solid fa-check" style="color:#fff"></i></span>';
    let err_class="ok_class";
    if (flag == 2 ) {
        flag_color = '<span class="flag_errheader"><i class="fa-solid fa-exclamation" style="color:#fff"></i></span>';       
        err_class="error_class";
    }
    var alert = $('<div role="alert" aria-live="assertive" aria-atomic="true" class="toast ">');
    alert.append(
        '<div class="toast-header '+err_class+'">' + flag_color +
        '  <span class="me-auto">' + msg +'</span>\n' +
        '  <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>\n' +
        '</div>\n'        
    );
    let t = new bootstrap.Toast(alert[0]);
    $('#alerts').append(alert);
    t.show();

    /*var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function (toastEl) {
        return new bootstrap.Toast(toastEl) //, option
    })
    toastList.forEach(toast => toast.show());*/
    //console.log(toastList);
}


// FILL THE PAGE FILTERS FROM THE SAVED ONES
function fill_search_filters(filterData) {
    if (filterData != null) {
        //console.log(filterData);
        for (const prop in filterData) {
            if (/check/i.test(prop)) {
                $('#'+prop).prop('checked', filterData[prop]);   
            } else {
                $('#'+prop).val(filterData[prop]);
            }
        }
    }
}

// ajax filled tables
function ajaxTables($selector = '')
{
    $($selector + ' table[data-fetch]').each(
        function () {
            let url = $(this).attr('data-fetch');
            ajaxTblAction.call(this, url);
        }
    );
}

function ajaxTblAction(url)
{
    let $this = $(this);
    let field_id = '';

    let fields = $this.attr('data-fields').split(',');
    let first_field = fields[0];

    // When assigning an entity (e.g. works) to a play, the user cannot reorder the table without
    // page refresh, because the row does not have the data-id attribute. So this code refresh the
    // table to include the data-id attribute.
    switch (first_field) {
        case 'coproducerRank':
            field_id = 'coprodplayID';
            break;
        case 'workRank':
            field_id = 'playWorksID';
            break;
        case 'repeatRank':
            field_id = 'repeatID';
            break;
        case 'contributorRank':
            field_id = 'contributorsID';
            break;
        case 'actorRank':
            field_id = 'actorID';
            break;
        case 'programRank':
            field_id = 'playProgramID';
            break;
        case 'pubRank':
            field_id = 'pubID';
            break;
        case 'photoRank':
            field_id = 'photoID';
            break;
        case 'soundRank':
            field_id = 'soundID';
            break;
        case 'videoRank':
            field_id = 'videoID';
            break;
        default:
            field_id = '';
    }

    $.ajax(
        {
            url: url,
            type: 'get',
            dataType: 'JSON',
            context: this
        }
    ).done(
        function(data) {
            //console.log(data);
            if ($.fn.DataTable.isDataTable($this)){
                $this.DataTable().destroy();
            }
            let tbody = $('tbody', this)[0];
            $(tbody).empty();
            const len = data.length;

            data.forEach(
                function (row) {
                    let tr_str = "<tr data-id='" + row[field_id] + "'>";
                    fields.forEach(
                        function (field) {
                            tr_str += "<td>" + row[field] + "</td>";
                        }
                    );
                    tr_str += "</tr>";
                    $(tbody).append(tr_str);
                }
            );

            let oldData = $this.data('fetch');
            $this.removeAttr('data-fetch').attr({ 'data-fetched': oldData });

            // inform datatable lib
            if ($.fn.DataTable.isDataTable(this) ) {

                var table = $this.DataTable();
                table.draw();
            } else {
                
                var table = $this.DataTable({
                        
                    "bInfo": false,
                    "ordering": false,
                    "bLengthChange": false,
                    pagingType: 'full_numbers',
                    "language": {
                        "paginate": {
                            "first":"<i class='fas fa-angle-double-left fa-lg custom-bd' style='color:red'></i>",
                            "previous": "<i class='fas fa-angle-left fa-lg custom-bd' style='color:red'></i>",
                            "next": "<i class='fas fa-angle-right fa-lg custom-bd' style='color:red'></i>",
                            "last": "<i class='fas fa-angle-double-right fa-lg custom-bd' style='color:red'></i>",
    
                        }
                    }
                });
                
                // define this function per page to enable reordering with custom persistence logic
                if ( typeof(customTblInit) === typeof(Function) ) {
                    customTblInit();
                } else {
                    console.log("mpike edw");
                    
                    
                  
                }
            }

            //ajaxActions('#' + $(this).attr('id')); // apply  these selectors
            //ajaxModals('#' + $(this).attr('id'));
        }
    ).fail(
        function ( data ) {
            showToast(2, "Failed loading table data");
            console.debug(data);
        }
    );
}

