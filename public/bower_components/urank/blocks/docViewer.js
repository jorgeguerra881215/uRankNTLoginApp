var DocViewer = (function(){

    var _this;
    // Settings
    var s = {};
    // Classes
    var docViewerContainerClass = 'urank-docviewer-container',
        defaultDocViewerContainerClass = 'urank-docviewer-container-default',
        detailsSectionClass = 'urank-docviewer-details-section',
        contentSectionOuterClass = 'urank-docviewer-content-section-outer',
        contentSectionClass = 'urank-docviewer-content-section';
    // Id prefix
    var detailItemIdPrefix = '#urank-docviewer-details-';
    // Selectors
    var $root = $(''),
        $detailsSection = $(''),
        $contentSection = $('');
    // Helper
    var customScrollOptions = {
        axis: 'y',
        theme: 'light',
        //scrollbarPosition: 'outside',
        autoHideScrollbar: true,
        scrollEasing: 'linear',
        mouseWheel: {
            enable: true,
            axis: 'y'
        },
        keyboard: {
            enable: true
        },
        advanced: {
            updateOnContentResize: true
        }
    };

    /**
     * Modified by Jorch
     */
    var _document,_keywords,_colorScale = '';
    var _list  = new ContentList();
    var _selectedKeywords = [];
    var counter = 0;
    var _selectedConnection = [];
    var _periodicity_color = ['#9d5600', '#ff8c00', '#ffaf4e', '#ffe4c4'];
    //var fs = require("fs");

    function DocViewer(arguments) {
        s = $.extend({
            root: ''
        }, arguments);
    }
    /**
     * Modified by Jorch
     */
    var saveLabel = function saveLabelBton(document_id,event){
        var label = $('#label-text').val();
        var observation = $('#urank-docviewer-labeling-text').val();
        _document = urank.getDocumentById(document_id);
        if(_document != '' != label != ''){

            var terms = '';
            _selectedKeywords.map(function(sk){ terms = terms+'  ' + sk.term + '('+sk.weight+')' });
            _document.terms = terms;

            _document.title = label;
            _document.keyword = terms;
            _document.observation = observation;
            _showDocument(_document,_keywords,_colorScale);
            $('#label-text').val(label);
            var label_list = $("#contentlist ul li[urank-id='"+_document.id+"'] h3");
            //label_list.html(_document.title);
            label_list.attr('title',_document.title+'\n'+_document.description);




            //list.build(_keywords,null);
            /*s.readFile('test.json', 'utf8', function(err,data){
             console.log(data);
             });*/
            //Write info in data.txt file using php script
            /*var scriptURL = 'http://localhost/loginapp/server/save.php',
                date = new Date(),
                timestamp = date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate() + '_' + date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds(),
                urankState = urank.getCurrentState(),
                gf = [{ filename: 'urank_labeled_' + timestamp + '.txt', content: JSON.stringify(urankState) }];//JSON.stringify(urankState)

            $.generateFile({ filename: "bookmarks.json", content: JSON.stringify(urankState), script: scriptURL });*/

            //Saving logs register
            urank.enterLog('Label '+label+','+_document.id);

            urank.selectMultipleListItem();

            return false;
        }
    }


    /**
     * Created by Jorch
     * Labeling connections like Botnet
     */
    var saveBotnetLabel = function saveLabelBton(event,document_id){
        console.log('Etiquetando como botnet la connection '+document_id);
        var documentId = document_id != null ? document_id : _document.id;
        $('#label-text').val("Botnet");
        //changing a color
        $("[urank-span-id='"+documentId+"']").removeClass('yellow-circle');
        $("[urank-span-id='"+documentId+"']").removeClass('green-circle');
        $("[urank-span-id='"+documentId+"']").addClass('red-circle');

        $("#index-label-"+document_id).removeClass('unlabelled');
        $("#index-label-"+document_id).removeClass('normal');
        $("#index-label-"+document_id).addClass('botnet');

        $('#urank-label-button-botnet-'+document_id).prop('disabled', true);
        $('#urank-label-button-botnet-'+document_id).removeClass('non-opacity');
        $('#urank-label-button-botnet-'+document_id).addClass('opacity');

        $('#urank-label-button-normal-'+document_id).prop('disabled', false);
        $('#urank-label-button-normal-'+document_id).removeClass('opacity');
        $('#urank-label-button-normal-'+document_id).addClass('non-opacity');

        $('span#label-'+document_id).html('Botnet');

        keepElementFocus();
        urank.updateLabelDictionary(document_id, label = 'Botnet');
        saveLabel(document_id,event);

    }

    /**
     * Created by Jorch
     * Labeling connections like Normal
     */
    var saveNormalLabel = function saveLabelBton(event,document_id){
        console.log('Etiquetando como normal la connection '+document_id);
        var documentId = document_id != null ? document_id : _document.id;
        $('#label-text').val("Normal");
        //changing a color

        $("[urank-span-id='"+documentId+"']").removeClass('yellow-circle');
        $("[urank-span-id='"+documentId+"']").removeClass('red-circle');
        $("[urank-span-id='"+documentId+"']").addClass('green-circle');

        $("#index-label-"+document_id).removeClass('unlabelled');
        $("#index-label-"+document_id).removeClass('botnet');
        $("#index-label-"+document_id).addClass('normal');

        $('#urank-label-button-normal-'+document_id).prop('disabled', true);
        $('#urank-label-button-normal-'+document_id).removeClass('non-opacity');
        $('#urank-label-button-normal-'+document_id).addClass('opacity');

        $('#urank-label-button-botnet-'+document_id).prop('disabled', false);
        $('#urank-label-button-botnet-'+document_id).removeClass('opacity');
        $('#urank-label-button-botnet-'+document_id).addClass('non-opacity');

        $('span#label-'+document_id).html('Normal');

        keepElementFocus();
        urank.updateLabelDictionary(document_id, label = 'Normal');
        saveLabel(document_id,event);
    }

    var keepElementFocus = function(){
        _list.selectListItem(_document.id);
        event.stopPropagation();
    }

    /**
     * Created by Jorch
     * Labeling connections like Normal
     */
    var hideUnrankedListItems = function() {

        if(_this.status !== RANKING_STATUS.no_ranking) {
            _this.data.forEach(function(d){
                var display = d.rankingPos > 0 ? '' : 'none';
                //$(liItem + '' + d.id).css('display', display);
                $('.'+liClass+'['+urankIdAttr+'="'+d.id+'"]').css('display', display);
            });
            $ul.addClass(ulPaddingBottomclass);
        }
        _this.multipleHighlightMode = false;
    };
    
    var _build = function(opt) {

        this.opt = opt.misc;

        var containerClasses = (this.opt.defaultBlockStyle) ? docViewerContainerClass +' '+ defaultDocViewerContainerClass : docViewerContainerClass;
        $root = $(s.root).empty().addClass(containerClasses);

        // Append details section, label and connection details
        $detailsSection = $("<div id='doc-viewer-detail' style='display: none' class='" + detailsSectionClass + "'></div>").appendTo($root);
        var $infoSection = $("<div id='doc-viewer-info'></div>").appendTo($detailsSection);

        //user section
        var $userSection = $('<div id="doc-user-section"></div>').appendTo($infoSection);
        $("<div id='doc-user-section-logo'></div>").appendTo($userSection);

        //Label section
        var $labelContainer = $('<div id="doc-label-section"></div>').appendTo($infoSection);
        $("<div id='doc-label-container'><label id='urank-docviewer-details-label' class='urank-docviewer-attributes'></label></div>").appendTo($labelContainer);
        $('<div id="doc-word-container"></div>').appendTo($infoSection);
        //$("<div id='urank-docviewer-details-title'></div>").appendTo($titleContainer);
        //$("<label id='urank-docviewer-details-label' class='urank-docviewer-attributes'></label>").appendTo($labelContainer);
        $("<div style='clear: both'></div>").appendTo($infoSection);

        /**
         * Modified by Jorch
         */
        //Section to show connection info
        var $titleContainer = $('<div class="doc-attributes-sontainer"></div>').appendTo($infoSection);
        $("<input type='checkbox' id='filter-initial-port' name='connection-attribute' value='initial-ip'><label>Ip Origin:</label>").appendTo($titleContainer);
        $("<label id='urank-docviewer-details-initport' class='urank-docviewer-attributes'></label>").appendTo($titleContainer);
        var $titleContainer = $('<div class="doc-attributes-sontainer"></div>').appendTo($infoSection);
        $("<input type='checkbox' id='filter-end-port' name='connection-attribute' value='end-ip'><label>Ip Dest:</label>").appendTo($titleContainer);
        $("<label id='urank-docviewer-details-destport' class='urank-docviewer-attributes'></label>").appendTo($titleContainer);
        var $titleContainer = $('<div class="doc-attributes-sontainer"></div>').appendTo($infoSection);
        $("<input type='checkbox' id='filter-port' name='connection-attribute' value='port'><label>Port:</label>").appendTo($titleContainer);
        $("<label id='urank-docviewer-details-port' class='urank-docviewer-attributes'></label>").appendTo($titleContainer);
        var $titleContainer = $('<div class="doc-attributes-sontainer"></div>').appendTo($infoSection);
        $("<input type='checkbox' id='filter-protocol' name='connection-attribute' value='protocol'><label>Protocol:</label>").appendTo($titleContainer);
        $("<label id='urank-docviewer-details-protocol' class='urank-docviewer-attributes'></label>").appendTo($titleContainer);

        //Dividing section
        $("<div class='urank-docviewer-divisor'></div>").appendTo($infoSection);

        var $titleContainer = $('<div></div>').appendTo($detailsSection);
        $("<div id='urank-docviewer-labeling'>" +
            "<input type='text' placeholder='Add new label...' id='label-text' style='display: none'>" +
            "<label>Tell us why you select this label:</label>"+
            "<textarea id='urank-docviewer-labeling-text' rows='5'></textarea>"+
            "<button id='urank-label-button-botnet'>Botnet</button>" +
            "<button id='urank-label-button-normal' style='float: right'>Normal</button>" +
            "</div>").appendTo($titleContainer);
        $('#urank-label-button-botnet').click(saveBotnetLabel);
        $('#urank-label-button-normal').click(saveNormalLabel);
        $('#urank-docviewer-labeling-text').click(keepElementFocus);

        //Dividing section
        $("<div class='urank-docviewer-divisor'></div>").appendTo($titleContainer);

        $('input[type=checkbox][name=connection-attribute]').change(function() {
            urank.findNotLabeled(this.value,this.filter);
            console.log('vemos cuanto demora !!!! :)');
        });

        this.opt.facetsToShow.forEach(function(facetName){
            var $facetContainer = $('<div></div>').appendTo($detailsSection);
            $("<label>" + facetName.capitalizeFirstLetter() + ":</label>").appendTo($facetContainer);
            $("<span id='urank-docviewer-details-" + facetName + "'></span>").appendTo($facetContainer);
        });

        // Append content section for snippet placeholder
        //var $contentSectionOuter = $('<div style="height: 200px"></div>').appendTo($root).addClass(contentSectionOuterClass);
        $contentSection = $('<div id="tabs" style="height: 160px; display: none"></div>').appendTo($root).addClass(contentSectionOuterClass); //$('<div></div>').appendTo($contentSectionOuter).addClass(contentSectionClass);

        $('<ul><li><a href="#tabs-1">Letter</a></li><li><a href="#tabs-2">Connection Sequence</a></li></ul>').appendTo($contentSection);
        var $contentTab1 = $('<div id="tabs-1"></div>').appendTo($contentSection);
        var $p = $('<p id="contentTabs-1"></p>').appendTo($contentTab1);
        var $contentTab2 = $('<div id="tabs-2"></div>').appendTo($contentSection);
        $('<p id="contentTabs-2"></p>').appendTo($contentTab2);
        $( "#tabs" ).tabs();

        //$('<p></p>').appendTo($contentSection);

        //Statistic section
        var $statisticSection = $("<div id='doc-viewer-statistic' style='display: none'></div>").appendTo($root);
        $("<div id='doc-viewer-top'></div>").appendTo($statisticSection);
        $("<div id='doc-viewer-left'></div>").appendTo($statisticSection);


        $root.on('mousedown', function(event){ event.stopPropagation(); });

        /*if(this.opt.customScrollBars)
            $contentSectionOuter.css('overflowY', 'hidden').mCustomScrollbar(customScrollOptions);*/




    };

    /**
     * @private
     * Description
     * @param {type} document Description
     * @param {Array} keywords (only stems)
     */
    var _showDocument = function(document, keywords, colorScale, connection_unlabelled, heatmap){
        /**
         * Modified by Jorch
         */
        _document = document;
        _keywords = keywords;
        _colorScale = colorScale;
        //$('#doc-viewer-detail').css('display','block');
        var port_info = document.connection_id.split("-");
        var init_port = port_info[0];
        var dest_port = port_info[1];
        var port = port_info[2];
        var protocol = port_info[3];
        $('#label-text').val('');
        $('#urank-docviewer-labeling-text').val(_document.observation);
        $(detailItemIdPrefix + 'initport').html(getStyledText(init_port, keywords, colorScale));
        $(detailItemIdPrefix + 'destport').html(getStyledText(dest_port, keywords, colorScale));
        $(detailItemIdPrefix + 'port').html(getStyledText(port, keywords, colorScale));
        $(detailItemIdPrefix + 'protocol').html(getStyledText(protocol, keywords, colorScale));
        $('#filter-initial-port').attr('value',init_port);
        $('#filter-end-port').attr('value',dest_port);
        $('#filter-port').attr('value',port);
        $('#filter-protocol').attr('value',protocol);
        //$('#urank-label-button-normal').prop('disabled', true);
        var bton_bot = $('#urank-label-button-botnet');
        var bton_norm = $('#urank-label-button-normal');
        switch (document.title){
            case 'Botnet':
                bton_bot.css('opacity',0.5);
                bton_bot.prop('disabled', true);
                bton_norm.css('opacity',1);
                bton_norm.prop('disabled', false);
                $('#urank-docviewer-details-label').removeClass('normal');
                $('#urank-docviewer-details-label').removeClass('unlabelled');
                $('#urank-docviewer-details-label').addClass('botnet');
                break;
            case 'Normal':
                bton_norm.css('opacity',0.5);
                bton_norm.prop('disabled', true);
                bton_bot.css('opacity',1);
                bton_bot.prop('disabled', false);
                $('#urank-docviewer-details-label').removeClass('botnet');
                $('#urank-docviewer-details-label').removeClass('unlabelled');
                $('#urank-docviewer-details-label').addClass('normal');
                break;
            default:
                bton_bot.css('opacity',1);
                bton_bot.prop('disabled', false);
                bton_norm.css('opacity',1);
                bton_norm.prop('disabled', false);
                $('#urank-docviewer-details-label').removeClass('botnet');
                $('#urank-docviewer-details-label').removeClass('normal');
                $('#urank-docviewer-details-label').addClass('unlabelled');
        }


        $(detailItemIdPrefix + 'label').html(document.title); //class='urank-tagcloud-tag ui-draggable ui-draggable-handle dragging active'
        /*"<div style='width: 100%; height: 30px'>"+
         document.keyword+
         "</div>");*/
        $('#doc-word-container').html('');
        /*
        document.keyword.split(' ').forEach(function(item){
            item != '' && item != ' ' ? $('#doc-word-container').append('<label class="doc-word">'+' '+ item+'</label>') : null;
        });
        */

        //show statistic
        $('#doc-viewer-top').html('');
        $('#doc-viewer-left').html('');
        var letters = [];
        var description = document.description;
        var i = description.length;
        while (i--) {
            var characterReg = /[a-zA-Z]/;
            var item = description[i];
            if(characterReg.test(item)) {
                letters.push(item);
            }
        }

        var count_letters = letters.length;
        var initial_porcent = 100/count_letters;
        var letter_porcent = {};
        var characteristic_porcent = {
            SP:0,
            WP:0,
            SNP:0,
            WNP:0
        };
        var all_letters = ['a','b','c','d','e','f','g','h','i','A','B','C','D','E'
            ,'F','G','H','I','r','s','t','u','v','w','x','y','z','R','S','T','U','V','W','X','Y','Z'];
        letters.forEach(function(item){
            letter_porcent[item] = item in letter_porcent ? letter_porcent[item] + initial_porcent : initial_porcent;
            var strong_periodicReg = /[a-i]/;
            var weak_periodicReg = /[A-I]/;
            var strong_nonperiodicReg = /[R-Z]/;
            var weak_nonperiodicReg = /[r-z]/;

            strong_periodicReg.test(item) ? characteristic_porcent['SP'] += 1 : null;
            weak_periodicReg.test(item) ? characteristic_porcent['WP'] += 1 : null;
            strong_nonperiodicReg.test(item) ? characteristic_porcent['SNP'] += 1 : null;
            weak_nonperiodicReg.test(item) ? characteristic_porcent['WNP'] += 1 : null;
        });

        var letter_data = [];
        all_letters.forEach(function(item){
            if(item in letter_porcent){
                var element = {
                    date: item,
                    value: letter_porcent[item]
                }
                letter_data.push(element)
            }else{
                var element = {
                    date: item,
                    value: 0
                }
                letter_data.push(element)
            }
        });
        /*$.each(letter_porcent , function(index, value) {
            var element = {
                date: index,
                value: value
            }
            letter_data.push(element)
        });*/

        var periodic_data = [];
        $.each(characteristic_porcent, function(index,value){
            var element = {
                age: index,
                population: value
            }
            periodic_data.push(element);
        })

        var getFacet = function(facetName, facetValue){
            return facetName == 'year' ? parseDate(facetValue) : facetValue;
        };

        var facets = (this.opt && this.opt.facetsToShow) ? this.opt.facetsToShow : [];
        facets.forEach(function(facet){
            //console.log(getFacet(facet, document.facets[facet]));
            //$(detailItemIdPrefix + '' + facet).html(getFacet(facet, document.facets[facet]));
            $(detailItemIdPrefix + '' + facet).html(document.facets[facet]);
        });

        // Descomentar si en la secuencia de letras viene dividida por palabras.
        /*var sequence = '';
        var words = document.description.split(' ');
        for(var i = 0; i < words.length; i++){
            if(words[i].length != words[i+1].length){
                sequence += words[i];
                break;
            }
            sequence += words[i][0];
        }*/
        var sequence = document.description

        //$( "#tabs" ).css('display','block');
        $('#contentTabs-1').html(getStyleWordSecuencie(document.description, keywords, colorScale));
        $('#contentTabs-2').html(sequence);

        //var $p = $('<p></p>').appendTo($contentSection).html(getStyleWordSecuencie(document.description, keywords, colorScale));
        //$p.hide().fadeIn('slow').scrollTo('top');

        //Saving logs register



        /**
         * Showing the list of connections
         */
        $('div.urank-docviewer-container-default').removeClass('selected');
        var id = "urank-docviewer-"+document.id;
        if(_selectedConnection.indexOf(document.id) == -1){

            var connection_list = ''//show_list_document(document, init_port, dest_port, port, protocol,sequence,letter_data,periodic_data,counter,heatmap);

            if(connection_unlabelled != null){
                connection_list = show_list_document_with_similar_botnet_and_normal(document, init_port, dest_port, port, protocol,sequence,letter_data,periodic_data,counter, connection_unlabelled, heatmap);
            }
            else{
                connection_list = show_list_document(document, init_port, dest_port, port, protocol,sequence,letter_data,periodic_data,counter,heatmap);
            }


            $('#viscanvas > div.urank-hidden-scrollbar-inner > div').append(connection_list);
            $("#btn-show-connection-sequence-"+document.id).on( "click", function() {
                var connection = $(this).attr('sequence');
                var index = $(this).attr('index');
                var title = $(this).attr('title');
                var id_connection = $(this).attr('idC');
                var sequence_template = '<div class="doc-label-container">' +
                    '<label class="urank-docviewer-attributes urank-docviewer-details-label '+title.toLowerCase()+'">'+index+' | '+'<span id="label-'+id_connection+'">'+title+'</span></label>' +
                    '</div>'
                $("#dialog-seguence").html('<p>'+connection+'</p>');
                $("#dialog-seguence").dialog( "open" );

                urank.enterLog('Sequence Connection,'+id_connection);
            });
            $("#btn-minimize-connection-"+document.id).on( "click", function (){
               var btn = $(this);
               var id_document= btn.attr('idC');
               var main_content = $("#main-element-"+id_document);
               main_content.toggleClass('display-none');
               if (main_content.hasClass('display-none')) {
                   btn.html('<i class="fa fa-chevron-down"></i>');
               } else {
                   btn.html('<i class="fa fa-chevron-up"></i>');
               }
            });
            $("#btn-close-connection-"+document.id).on( "click", function() {
                var btn = $(this);//$('#'+id);
                var id_connection = btn.attr('idC');
                var counter = btn.attr('counter');
                //urank.onWatchiconClicked(id_connection)

                //Deselect the connections in the list
                var $li = $('.'+'urank-list-li'+'['+'urank-id'+'="'+id_connection+'"]');
                var watchIcon = $li.find(' .' + 'urank-list-li-button-watchicon');
                watchIcon.removeClass("urank-list-li-button-watchicon-on")
                watchIcon.addClass("urank-list-li-button-watchicon-off")
                $li.removeClass('watched');


                //Caso donde cierro una conexion botnet o normal
                // que se abrio automaticamente para comparar una sin etiquetar.
                if(btn.attr('comparative') == 'true'){
                    $('#urank-docviewer-'+id_connection).replaceWith('');//css('display','none');
                    var index = _selectedConnection.indexOf(id_connection)

                    if(index != -1){
                        _selectedConnection.splice(index,1);
                        urank.enterLog('Close Comparative Connection,'+id_connection);
                    }
                    urank.onDeselectItem(id_connection);
                    return false; //Termino aca la ejecucion del evento
                }

                //Clear all filters in this connection  $('#filter-initial-port-'+index+':checked').length > 0
                var change = false;
                var initialPort = $('#filter-initial-port-'+id_connection);
                var endPort = $('#filter-end-port-'+id_connection);
                var filterPort = $('#filter-port-'+id_connection);
                var filterProtocol = $('#filter-protocol-'+id_connection);
                if($('#filter-initial-port-'+id_connection+':checked').length > 0 ){
                    initialPort.prop('checked', false);
                    change = true;
                }
                if($('#filter-end-port-'+id_connection+':checked').length > 0 ){
                    endPort.prop('checked', false);
                    change = true;
                }
                if($('#filter-port-'+id_connection+':checked').length > 0 ){
                    filterPort.prop('checked', false);
                    change = true;
                }
                if($('#filter-protocol-'+id_connection+':checked').length > 0 ){
                    filterProtocol.prop('checked', false);
                    change = true;
                }
               if(change){
                   urank.findNotLabeled(this.value,null);
               }


                $('#urank-docviewer-'+id_connection).replaceWith('');//css('display','none');
                var index = _selectedConnection.indexOf(id_connection)

                //Remove connection from connection list
                var li = $('ul#connection-list li[urank-id='+id_connection+']');
                li[0].removeAttribute("style");
                urank.onDeselectItem(id_connection);

                if(index != -1){
                    _selectedConnection.splice(index,1);
                    urank.enterLog('Close Connection,'+id_connection);
                }

            });
            //$('input[type=checkbox][name=connection-attribute]').change(function() {
            $('#filter-initial-port-'+document.id).change(function() {
                console.log('filtrando');
                /*$(this).prop('checked', true);*/
                urank.findNotLabeled(this.value,null);
            });
            $('#filter-end-port-'+document.id).change(function() {
                console.log('filtrando');
                /*$(this).prop('checked', true);*/
                urank.findNotLabeled(this.value,null);
            });
            $('#filter-port-'+document.id).change(function() {
                console.log('filtrando');
                /*$(this).prop('checked', true);*/
                urank.findNotLabeled(this.value,null);
            });
            $('#filter-protocol-'+document.id).change(function() {
                console.log('filtrando');
                /*$(this).prop('checked', true);*/
                urank.findNotLabeled(this.value,null);
            });
            $('#urank-label-button-botnet-'+document.id).on("click",function(){
                var btn = $(this);//$('#'+id);
                var id_connection = btn.attr('idC');
                saveBotnetLabel(this,id_connection);
            });
            $('#urank-label-button-normal-'+document.id).on("click",function(){
                var btn = $(this);//$('#'+id);
                var id_connection = btn.attr('idC');
                saveNormalLabel(this,id_connection);
            });
            $( ".btn-show-info-heatmap" ).on( "click", function() {
                urank.enterLog('Show Info Heatmap,0');
                $( "#dialog-info-heatmap" ).dialog( "open" );
            });
            $("#select-text-box-"+document.id).on("select", function () {
                const selText = getSelectedText();
                $('.connection-sequence').each(function (index){
                    var main_text = $(this).text();
                    const text_result = getIndicesOf(selText, main_text, true);
                    const html = $.parseHTML(text_result);
                    $(this).html(html)
                });
            });

            pieChart('pie-graph-'+document.id,periodic_data)
            barChart('bar-graph-'+document.id,letter_data)

            counter ++;
            _selectedConnection.push(document.id);
        }
        else{
            $('#'+id).addClass('selected');
        }

    };

    var show_list_document = function (document, init_port, dest_port, port, protocol, sequence, letter_data, periodic_data,counter,heatmap){
        var title = document.title;
        var opacity_botnet_class = document.title == "Botnet" ? "opacity" : "non-opacity";
        var opacity_normal_class = document.title == "Normal" ? "opacity" : "non-opacity";
        var disable_botnet = document.title == "Botnet" ? "disable=''" : "";
        var disable_normal = document.title == "Normal" ? "disable=''" : "";
        var index = $('label#label-'+document.id).attr('value');
        var bot_probability =   document.botprob != 'NA' ? parseFloat(document.botprob.replace(",", ".")) : ''
        var bot_style = bot_probability != '' ? 'background: linear-gradient(to right,  red 0%, red ' + bot_probability*100 +'%,green ' + bot_probability*100 + '%,green 100%)' : ''
        var botnet_left = bot_probability != '' ? 'Botnet' : '';
        var normal_rigth = bot_probability != '' ? 'Normal' : '';

        var head = '<div>' +
                        '<div class="left" style="margin-right: 10px;">' +
                            '<div class="doc-label-container">' +
                                '<label id="index-label-'+document.id+'" class="urank-docviewer-attributes urank-docviewer-details-label '+title.toLowerCase()+'">'+index+' | '+'<span id="label-'+document.id+'">'+title+'</span></label>' +
                            '</div>' +
                        '</div>' +
                        '<div class="doc-attributes-sontainer left">' +
                            '<input type="checkbox" id="filter-initial-port-'+document.id+'" class="filter-initial-port" name="connection-attribute" value="'+init_port+'"><label>Ip Origin:</label><label id="urank-docviewer-details-initport'+document.id+'" class="urank-docviewer-attributes">'+init_port+'</label>' +
                        '</div>' +
                        '<div class="doc-attributes-sontainer left">' +
                            '<input type="checkbox" id="filter-end-port-'+document.id+'" class="filter-end-port" name="connection-attribute" value="'+dest_port+'"><label>Ip Dest:</label><label id="urank-docviewer-details-destport'+document.id+'" class="urank-docviewer-attributes">'+dest_port+'</label>' +
                        '</div>' +
                        '<div class="doc-attributes-sontainer left">' +
                            '<input type="checkbox" id="filter-port-'+document.id+'" class="filter-port" name="connection-attribute" value="'+port+'"><label>Port:</label><label id="urank-docviewer-details-port'+document.id+'" class="urank-docviewer-attributes">'+port+'</label>' +
                        '</div>' +
                        '<div class="doc-attributes-sontainer left">' +
                            '<input type="checkbox" id="filter-protocol-'+document.id+'" class="filter-protocol" name="connection-attribute" value="'+protocol+'"><label>Protocol:</label><label id="urank-docviewer-details-protocol'+document.id+'" class="urank-docviewer-attributes">'+protocol+'</label>' +
                        '</div>' +
                        '<div style="clear: both"></div>' +
                    '</div>';
        var body =
                    '<div style="width: 100%; margin: 2px">' +
                        '<div class="left">' +
                            '<label><span>'+ botnet_left +' </span><span style="' + bot_style + '" urank-span-prediction-id="'+ document.id+'" class="document_view-botnet-bar"></span> <span>' + normal_rigth + '</span></label>' +
                        '</div>'+
                        '<div class="left" style="margin-left: 25px">' +
                        heatmap[0].outerHTML() + heatmap[1].outerHTML() + heatmap[2].outerHTML() +heatmap[3].outerHTML() +heatmap[4].outerHTML() +heatmap[5].outerHTML() +heatmap[6].outerHTML() +heatmap[7].outerHTML() +heatmap[8].outerHTML() +heatmap[9].outerHTML() +
                        '</div>'+
                        '<div class="left">' +
                            '<span class="info btn-show-info-heatmap fa fa-info-circle" title="Info"></span>'+
                        '</div>'+
                        '<div class="left" style="margin-left: 30px">' +
                            '<button id="btn-show-connection-sequence-'+document.id+'" class="btn-show-connection-sequence" idC="'+document.id+'" sequence="'+sequence+'" index="'+index+'" title="Show Connection Sequence" style="width: auto !important;"><i class="fa fa-file-text-o"></i></button>'+
                        '</div>'+
                        '<div class="rigth" style="margin-right: 10px">' +
                            '<button style="float: right; background: red; color: black; text-shadow: none; box-shadow: none" id="urank-label-button-botnet-'+document.id+'" class="btn-botnet-label-connection rigth '+opacity_botnet_class+'" style="margin: 2px" title="Set as Botnet behavior" idC="'+document.id+'"'+disable_botnet+'>Botnet</button>' +
                            '<button style="float: right; background: #008000; color: black; text-shadow: none; box-shadow: none" id="urank-label-button-normal-'+document.id+'" class="btn-normal-label-connection rigth '+opacity_normal_class+'" style="margin: 2px" title="Set as Normal behavior" idC="'+document.id+'"'+disable_normal+'>Normal</button>' +
                            '<div style="clear: both"></div>'+
                        '</div>' +
                        '<div style="clear: both"></div>'+
                    '</div>' +
                    '<div style="margin-bottom: 0px">' +
                        '<div id="bar-graph" class="left chart">' +
                            '<div id="bar-graph-'+document.id+'"></div>' +
                        '</div>'+
                        '<div id="pie-graph" class="left chart">' +
                            '<div id="pie-graph-'+document.id+'" class=""></div>' +
                        '</div>'+
                        '<div id="text-select" class="left chart">' +
                            '<textarea id="select-text-box-'+document.id+'"  class="select-text-box" type="textarea" rows="5" cols="40" value="'+sequence+'" >'+sequence+'</textarea>' +
                        '</div>'+
                        '<div style="clear: both"></div>' +
                    '</div>';
        var block = _createBlock(head, body, document.id);
        var element =
            '<div id="urank-docviewer-'+document.id+'" class="urank-docviewer-container-default selected" style="margin-top: -3px;">' +
                '<div style="display: block;" class="urank-docviewer-details-section">' +
                    block +
                '</div>'+
            '</div>';
        return element;
    }

    var show_list_document_with_similar_botnet_and_normal = function (document, init_port, dest_port, port, protocol, sequence, letter_data, periodic_data,counter, connection_unlabelled, heatmap){
        var title = document.title;
        var connection_unlabelled_info = connection_unlabelled.connection_id.split("-");
        var init_port_unlabelled = connection_unlabelled_info[0];
        var dest_port_unlabelled = connection_unlabelled_info[1];
        var port_unlabelled = connection_unlabelled_info[2];
        var protocol_unlabelled = connection_unlabelled_info[3];
        var class_similar_init_port = init_port_unlabelled == init_port ? 'similar-connection-feature' : ''
        var class_similar_dest_port = dest_port_unlabelled == dest_port ? 'similar-connection-feature' : ''
        var class_similar_port = port_unlabelled == port ? 'similar-connection-feature' : ''
        var class_similar_protocol = protocol_unlabelled == protocol ? 'similar-connection-feature' : ''

        var index = $('label#label-'+document.id).attr('value');
        var bot_probability =   document.botprob != 'NA' ? parseFloat(document.botprob.replace(",", ".")) : ''
        var bot_style = bot_probability != '' ? 'background: linear-gradient(to right,  red 0%, red ' + bot_probability*100 +'%,green ' + bot_probability*100 + '%,green 100%)' : ''
        var botnet_left = bot_probability != '' ? 'Botnet' : '';
        var normal_rigth = bot_probability != '' ? 'Normal' : '';

        const head =
            '<div>' +
                '<div class="left" style="margin-right: 25px;">' +
                    '<div class="doc-label-container">' +
                        '<label id="index-label-'+document.id+'" class="urank-docviewer-attributes urank-docviewer-details-label '+title.toLowerCase()+'">'+index+' | '+'<span id="label-'+document.id+'">'+title+'</span></label>' +
                    '</div>' +
                '</div>' +
                '<div class="' + class_similar_init_port + ' doc-attributes-sontainer left doc-attributes-container-comparative">' +
                    '<label>Ip Origin:</label><label id="urank-docviewer-details-initport'+document.id+'" class="urank-docviewer-attributes">'+init_port+'</label>' +
                '</div>' +
                '<div class="' + class_similar_dest_port + ' doc-attributes-sontainer left doc-attributes-container-comparative">' +
                    '<label>Ip Dest:</label><label id="urank-docviewer-details-destport'+document.id+'" class="urank-docviewer-attributes">'+dest_port+'</label>' +
                '</div>' +
                '<div class="' + class_similar_port + ' doc-attributes-sontainer left doc-attributes-container-comparative">' +
                    '<label>Port:</label><label id="urank-docviewer-details-port'+document.id+'" class="urank-docviewer-attributes">'+port+'</label>' +
                '</div>' +
                '<div class="' + class_similar_protocol + ' doc-attributes-sontainer left doc-attributes-container-comparative">' +
                    '<label>Protocol:</label><label id="urank-docviewer-details-protocol'+document.id+'" class="urank-docviewer-attributes">'+protocol+'</label>' +
                '</div>' +
                '<div style="clear: both"></div>' +
            '</div>';

        const body =
            '<div style="width: 100%; margin: 2px">' +
                '<div class="left">' +
                    '<label><span>'+ botnet_left +' </span><span style="' + bot_style + '" urank-span-prediction-id="'+ document.id+'" class="document_view-botnet-bar"></span> <span>' + normal_rigth + '</span></label>' +
                '</div>'+
                '<div class="left" style="margin-left: 25px">' +
                heatmap[0].outerHTML() + heatmap[1].outerHTML() + heatmap[2].outerHTML() +heatmap[3].outerHTML() +heatmap[4].outerHTML() +heatmap[5].outerHTML() +heatmap[6].outerHTML() +heatmap[7].outerHTML() +heatmap[8].outerHTML() +heatmap[9].outerHTML() +
                '</div>'+
                '<div class="left">' +
                    '<span class="info btn-show-info-heatmap fa fa-info-circle" title="Info"></span>'+
                '</div>'+
                '<div class="left" style="margin-left: 30px">' +
                    '<button id="btn-show-connection-sequence-'+document.id+'" class="btn-show-connection-sequence" idC="'+document.id+'" sequence="'+sequence+'" index="'+index+'" title="Show Connection Sequence" style="width: auto !important;"><i class="fa fa-file-text-o"></i></button>'+
                '</div>'+
                '<div style="clear: both"></div>'+
            '</div>' +
            '<div style="margin-bottom: 0px">' +
                '<div id="bar-graph" class="left chart">' +
                    '<div id="bar-graph-'+document.id+'"></div>' +
                '</div>'+
                '<div id="pie-graph" class="left chart">' +
                    '<div id="pie-graph-'+document.id+'" class=""></div>' +
                '</div>'+
                '<div class="left chart text-display-container">' +
                    '<p id="text-display'+document.id+'"  class="connection-sequence">'+sequence+'</p>'+
                '</div>'+
                '<div style="clear: both"></div>' +
            '</div>';
        const block = _createBlock(head, body, document.id);

        const element =
            '<div id="urank-docviewer-'+document.id+'" class="urank-docviewer-container-default selected" style="margin-top: -3px;">' +
                '<div style="display: block;" class="urank-docviewer-details-section">' +
                    block +
                '</div>'+
            '</div>';

        return element;
    }


    var show_filter = function(document, init_port, dest_port, port, protocol){
        var ipOrigen = '<input type="checkbox" id="filter-initial-port-'+document.id+'" class="filter-initial-port" name="connection-attribute" value="'+init_port+'"><label>Ip Origin:</label><label id="urank-docviewer-details-initport'+document.id+'" class="urank-docviewer-attributes">'+init_port+'</label>';
        var ipDest = '<input type="checkbox" id="filter-end-port-'+document.id+'" class="filter-end-port" name="connection-attribute" value="'+dest_port+'"><label>Ip Dest:</label><label id="urank-docviewer-details-destport'+document.id+'" class="urank-docviewer-attributes">'+dest_port+'</label>';
        var port = '<input type="checkbox" id="filter-port-'+document.id+'" class="filter-port" name="connection-attribute" value="'+port+'"><label>Port:</label><label id="urank-docviewer-details-port'+document.id+'" class="urank-docviewer-attributes">'+port+'</label>';
        var protocol = '<input type="checkbox" id="filter-protocol-'+document.id+'" class="filter-protocol" name="connection-attribute" value="'+protocol+'"><label>Protocol:</label><label id="urank-docviewer-details-protocol'+document.id+'" class="urank-docviewer-attributes">'+protocol+'</label>';
        $('#header-filter-ip-origin').append(ipOrigen);
    }

    /**
     * Created by Jorch
     * @private
     */
    var _updateSelectedKeys = function(selectedKeyWords){
        _selectedKeywords = selectedKeyWords
    };

    var _clear = function(){
        /**
         * Modified by Jorch
         */
        // Clear details section
        /*$(detailItemIdPrefix + 'title').empty();
         var facets = (this.opt && this.opt.facetsToShow) ? this.opt.facetsToShow : [];
         facets.forEach(function(facet){
         $(detailItemIdPrefix + '' + facet).empty();
         });
         // Clear content section
         $contentSection.empty();*/
        //_selectedConnection = [];
    };

    var _reset = function(){
        _selectedConnection = [];
    };

    var _destroy = function() {
        $root.empty().removeClass(docViewerContainerClass)
    };

    var barChart = function(idElement,data){
        data.forEach(function(d) {
            d.date = d.date;
            d.value = d.value / 100;
        });

        const margin = {top: 20, right: 20, bottom: 70, left: 40},
            width = 320 - margin.left - margin.right,
            height = 120 - margin.top - margin.bottom;

        const svg = d3.select('#'+idElement)
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const chart = svg.append('g')
            .attr('transform', 'translate(' + margin.left +',' + margin.top +')');
            //.attr('transform', translate(${margin}, ${margin}));

        const yScale = d3.scaleLinear()
            .range([height, 0])
            .domain([0, 1]);

        chart.append('g')
            .call(d3.axisLeft(yScale));

        const xScale = d3.scaleBand()
            .range([0, width])
            .domain(data.map((s) => s.date))
            .padding(0.2);

        chart.append('g')
            .attr('transform', 'translate(0, '+height+')')
            .call(d3.axisBottom(xScale));

        chart.selectAll()
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (s) => xScale(s.date))
        .attr('y', (s) => yScale(s.value))
        .attr('height', (s) => height - yScale(s.value))
        .attr('width', xScale.bandwidth())
        .style("fill", "steelblue");
    }

    var pieChart = function(idElement, _data){
        // set the dimensions and margins of the graph
        var width = 100
            height = 100
            margin = 10

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        var radius = Math.min(width, height) / 2 - margin

        // append the svg object to the div called 'my_dataviz'
        var svg = d3.select("#"+idElement)
          .append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Create dummy data
        //var data = {a: 9, b: 20, c:30, d:8, e:12}
        var data = {sp: _data[0].population, wp: _data[1].population, snp: _data[2].population, wnp: _data[3].population}

        // set the color scale
        var color = d3.scaleOrdinal()
          .domain(data)
          .range(_periodicity_color);//d3.schemeSet2

        // Compute the position of each group on the pie:
        var pie = d3.pie()
          .value(function(d) {return d.value; })
        var data_ready = pie(d3.entries(data))
        // Now I know that group A goes from 0 degrees to x degrees and so on.

        // shape helper to build arcs:
        var arcGenerator = d3.arc()
          .innerRadius(0)
          .outerRadius(radius)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
          .selectAll('mySlices')
          .data(data_ready)
          .enter()
          .append('path')
            .attr('d', arcGenerator)
            .attr('fill', function(d){ return(color(d.data.key)) })
            .attr("stroke", "black")
            .style("stroke-width", "0.5px")
            .style("opacity", 0.5)

        // Now add the annotation. Use the centroid method to get the best coordinates
        svg
          .selectAll('mySlices')
          .data(data_ready)
          .enter()
          .append('text')
          .text(function(d){ return d.data.key})
          .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
          .style("text-anchor", "middle")
          .style("font-size", 10)
    }

    var _createBlock = function(head, body, id_document){
        return '<div class="panel panel-default">'+
                      '<div class="panel-heading">'+
                        '<div class="pull-left">' +
                            head+
                        '</div>'+
                        '<div class="widget-icons pull-right">'+
                          '<a class="wminimize" id="btn-minimize-connection-'+id_document+'" idC="'+id_document+'"><i class="fa fa-chevron-up"></i></a>'+
                          '<a class="wclose"><i class="fa fa-times" id="btn-close-connection-'+id_document+'" class="btn-close-connection" idC="'+id_document+'" comparative="false" counter="'+counter+'"></i></a>'+
                        '</div>'+
                        '<div class="clearfix"></div>'+
                      '</div>'+
                      '<div class="panel-body" id="main-element-'+id_document+'" >'+
                        '<div class="padd sscroll">'+
                            body+
                        '</div>'+
                        '<div class="widget-foot"></div>'+
                      '</div>'+
            '</div>';
    };

    var getSelectedText = function() {
        var selText = "";
        if (window.getSelection) {  // all browsers, except IE before version 9
            if (document.activeElement &&
                    (document.activeElement.tagName.toLowerCase () == "textarea" ||
                     document.activeElement.tagName.toLowerCase () == "input"))
            {
                var text = document.activeElement.value;
                selText = text.substring (document.activeElement.selectionStart,
                                          document.activeElement.selectionEnd);
            }
            else {
                var selRange = window.getSelection ();
                selText = selRange.toString ();
            }
        }
        return selText;
    };

    function getIndicesOf(searchStr, str, caseSensitive) {
        var i = 0, j = 0;
        var text_result = '';
        var searchStrLen = searchStr.length;
        if (searchStrLen == 0) {
            return [];
        }
        var startIndex = 0, index, indices = [];
        if (!caseSensitive) {
            str = str.toLowerCase();
            searchStr = searchStr.toLowerCase();
        }
        while ((index = str.indexOf(searchStr, startIndex)) > -1) {
            indices.push(index);
            startIndex = index + searchStrLen;

            text_result = text_result + str.substr(i, index - i) + '<mark>' + searchStr + '</mark>';
            i = startIndex
        }
        if (startIndex < str.length){
            text_result = text_result + str.substr(startIndex, str.length - startIndex)
        }
        return text_result;
    }

    // Prototype
    DocViewer.prototype = {
        build: _build,
        clear: _clear,
        reset: _reset,
        showDocument: _showDocument,
        destroy: _destroy,
        /**
         * Modified by Jorch
         */
        updateSelectedKeys: _updateSelectedKeys
    };

    return DocViewer;
})();