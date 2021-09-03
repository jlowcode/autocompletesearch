/**
 * Search all elements - autocomplete
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */

define(['jquery', 'fab/list-plugin', 'fab/fabrik', 'lib/debounce/jquery.ba-throttle-debounce', 'plugins/fabrik_list/autocompletesearch/dist/js/select2.min.js'], function (jQuery, FbListPlugin, Fabrik, debounce, select2) {
	var FbListautocompletesearch = new Class({

		Extends: FbListPlugin,

		initialize: function (options) {
            var self = this;

            this.parent(options);

            this.getListForm();
            this.getForm();

            var cssId = 'select2Css';  // you could encode the css path itself to generate id..
            if (!document.getElementById(cssId)) {
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('link');
                link.id = cssId;
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = 'plugins/fabrik_list/autocompletesearch/dist/css/select2.min.css';
                link.media = 'all';
                head.appendChild(link);

            }

            this.inputSearch = jQuery(this.listform).find('.fabrik_filter.search-query.input-medium')[0];
            var idInputSearch = jQuery(this.inputSearch).attr('id');
            var nameInputSearch = jQuery(this.inputSearch).attr('name');

            this.select2 = new Element('select', {'id': idInputSearch, 'class': 'fabrik_filter', 'name': nameInputSearch, 'style': 'width: 100% !important'});
            jQuery(this.inputSearch).before(this.select2);
            jQuery(this.select2).after(new Element('br'));
            
            if(jQuery('.bi-search')[0]){
                jQuery('.bi-search')[0].remove();
            }

            jQuery(this.inputSearch).remove();

            jQuery(this.select2).select2({
                dropdownAutoWidth: true                    
            });

            jQuery(this.select2).append('<option></option>');

            jQuery(this.select2).on('select2:select', function (e) {
                var data = e.params.data;
                if(/<\/?[a-z][\s\S]*>/i.test(data.text)){
                    var matched = data.text.match('href="([^"]+)');
                    if(matched[1]){
                        window.open(matched[1]);
                    } else {
                        Fabrik.fireEvent('fabrik.list.dofilter', [this]);
                    }
                } else {
                    Fabrik.fireEvent('fabrik.list.dofilter', [this]);
                }
            });

            jQuery(this.select2).on('select2:open', function (e) {
                var elSelectSearch = jQuery('.select2-search__field')[0];
                if(!jQuery(elSelectSearch).prop('placeholder')){
                    jQuery(elSelectSearch).attr('placeholder', 'Buscar em todos os campos');
                }
                Fabrik.fireEvent('fabrik.listfilter.clear', [this]);
            });

            jQuery(this.select2).select2({
                ajax: {
                  delay: 250,
                  url: 'index.php',
                  data: function(params){
                    var query = {
                        option: 'com_fabrik',
                        format: 'raw',
                        task: 'plugin.pluginAjax',
                        plugin: 'autocompletesearch',
                        g: 'list',
                        listref: self.options.listid,
                        method: 'autocomplete_options',
                        search: params.term,
                        value: params.term,
                        elName: self.options.elName,
                        type: 'public'
                    }

                    return query;

                  },

                  processResults: function (data) {
                    // Transforms the top-level key of the response object from 'items' to 'results'
                    return {
                      results: self.getUniqueListBy(JSON.parse(data), 'id')
                    };
                  }

                },
                minimumInputLength: 1,
                placeholder: 'Buscar em todos os campos',
                templateSelection: function(item) {return /<\/?[a-z][\s\S]*>/i.test(item.text) ? jQuery(item.text) : item.text; },
                templateResult:function(item) {return /<\/?[a-z][\s\S]*>/i.test(item.text) ? jQuery(item.text) : item.text; }
            });

        },

        getUniqueListBy: function(arr, key) {
            return [...new Map(arr.map(item => [item[key], item])).values()]
        },

        getListForm: function(){
            if(!this.listform){
                this.listform = Fabrik.getBlock('list_' + this.options.listid);
            }

            return this.listform;
        },

        getForm: function () {
            if (!this.form) {
                this.form = this.listform.form;
            }

            return this.form;
        },

	});

	return FbListautocompletesearch;
});
