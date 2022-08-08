/**
 * Search all elements - autocomplete
 *
 * @copyright: Copyright (C) 2005-2016  Media A-Team, Inc. - All rights reserved.
 * @license:   GNU/GPL http://www.gnu.org/copyleft/gpl.html
 */
 define(["jquery","fab/list-plugin","fab/fabrik","lib/debounce/jquery.ba-throttle-debounce","plugins/fabrik_list/autocompletesearch/dist/js/select2.min.js"],(function(t,e,i,s,r){return new Class({Extends:e,initialize:function(e){var s=this;this.parent(e),this.getListForm(),this.getForm();var r="select2Css";if(!document.getElementById(r)){var a=document.getElementsByTagName("head")[0],n=document.createElement("link");n.id=r,n.rel="stylesheet",n.type="text/css",n.href="plugins/fabrik_list/autocompletesearch/dist/css/select2.min.css",n.media="all",a.appendChild(n)}this.inputSearch=t(this.listform).find(".fabrik_filter.search-query.input-medium")[0];var l=t(this.inputSearch).attr("id"),o=t(this.inputSearch).attr("name");this.select2=new Element("select",{id:l,class:"fabrik_filter",name:o,style:"width: 100% !important"}),t(this.inputSearch).before(this.select2),t(this.select2).after(new Element("br")),t(".bi-search")[0]&&t(".bi-search")[0].remove(),t(this.inputSearch).remove(),t(this.select2).select2({dropdownAutoWidth:1}),t(this.select2).append("<option></option>"),t(this.select2).on("select2:select",(function(t){var e=t.params.data;if(/<\/?[a-z][\s\S]*>/i.test(e.text)){var s=e.text.match('href="([^"]+)');s[1]?window.open(s[1]):i.fireEvent("fabrik.list.dofilter",[this])}else i.fireEvent("fabrik.list.dofilter",[this])})),t(this.select2).on("select2:open",(function(e){var s=t(".select2-search__field")[0];t(s).prop("placeholder"),i.fireEvent("fabrik.listfilter.clear",[this])})),t(this.select2).select2({ajax:{delay:250,url:function(t){return"index.php?option=com_fabrik&format=raw&view=list&listid="+s.options.listid+"&fabrik_list_filter_all_"+s.options.listid+"_com_fabrik_"+s.options.listid+"="+t.term},processResults:function(t){return dataFormat=JSON.parse(t.substr(0,t.indexOf("<script>"))).data[0],arrFormat=dataFormat.map((function(t){return element=s.options.elName+"_raw",arr={id:t.data[element],text:t.data[element]},arr})),{results:s.getUniqueListBy(arrFormat,"id")}}},minimumInputLength:1,placeholder:"Buscar em todos os campos",templateSelection:function(e){return/<\/?[a-z][\s\S]*>/i.test(e.text)?t(e.text):e.text},templateResult:function(e){return/<\/?[a-z][\s\S]*>/i.test(e.text)?t(e.text):e.text}})},getUniqueListBy:function(t,e){return[...new Map(t.map((t=>[t[e],t]))).values()]},getListForm:function(){return this.listform||(this.listform=i.getBlock("list_"+this.options.listid)),this.listform},getForm:function(){return this.form||(this.form=this.listform.form),this.form}})}));